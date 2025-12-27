import type { APIRoute } from 'astro';
import { GoogleGenerativeAI } from '@google/generative-ai';

export const prerender = false;
import {
    createStatus,
    createAppointment,
    createMedication,
    createDoctor,
    getAllDoctors
} from '../../lib/data/fileOperations';

export const POST: APIRoute = async ({ request }) => {
    try {
        const data = await request.json();
        const userMessage = data.message;

        if (!userMessage) {
            return new Response(JSON.stringify({ error: 'Message is required' }), { status: 400 });
        }

        const apiKey = import.meta.env.GOOGLE_API_KEY;
        if (!apiKey) {
            return new Response(JSON.stringify({ error: 'API key not configured' }), { status: 500 });
        }

        // Load lightweight context
        const doctors = await getAllDoctors();
        const doctorContext = doctors.map(d => `- "${d.name}" (${d.specialty}): ID="${d.id}"`).join('\n');

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({
            model: "gemini-3-flash-preview",
            systemInstruction: `Du bist ein medizinischer Assistent für Bine. Deine Aufgabe ist es, Bines gesprochene Eingaben in strukturierte Daten umzuwandeln und in der Datenbank zu speichern.

WICHTIG - Ärzte-Kontext:
${doctorContext || '(Keine Ärzte in der Datenbank)'}

REGELN für doctorId bei Terminen:
1. Wenn der genannte Arzt in der Liste oben steht, verwende IMMER die exakte UUID (z.B. "abc123-...")
2. Wenn der Arzt NICHT in der Liste steht, verwende den Namen als Platzhalter
3. Bei Fachgebiet-Angaben (z.B. "zum Zahnarzt") ohne Namen: suche passenden Arzt in der Liste

Heutiges Datum: ${new Date().toISOString().split('T')[0]}
Aktuelle Uhrzeit: ${new Date().toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}
`,
            tools: [
                {
                    functionDeclarations: [
                        {
                            name: "createStatus",
                            description: "Erstellt einen neuen Tagesstatus-Eintrag. Nutze dies für Symptome, Schmerzen, Befinden.",
                            parameters: {
                                type: "OBJECT",
                                properties: {
                                    painLevel: { type: "NUMBER", description: "Schmerzlevel von 0 bis 10" },
                                    symptoms: { type: "ARRAY", items: { type: "STRING" }, description: "Liste der Symptome" },
                                    mood: { type: "STRING", description: "Stimmung/Laune" },
                                    notes: { type: "STRING", description: "Zusätzliche Freitext-Notizen" }
                                },
                                required: ["painLevel"]
                            }
                        },
                        {
                            name: "createAppointment",
                            description: "Erstellt einen neuen Arzttermin.",
                            parameters: {
                                type: "OBJECT",
                                properties: {
                                    date: { type: "STRING", description: "Datum und Uhrzeit im ISO Format (YYYY-MM-DDTHH:MM)" },
                                    doctorId: { type: "STRING", description: "ID des Arztes (falls bekannt) oder neuer Name" },
                                    reason: { type: "STRING", description: "Grund für den Termin" },
                                    type: { type: "STRING", description: "Art des Termins (z.B. 'Untersuchung', 'Therapie')" }
                                },
                                required: ["date", "reason"]
                            }
                        },
                        {
                            name: "createMedication",
                            description: "Erstellt einen neuen Medikamenten-Eintrag.",
                            parameters: {
                                type: "OBJECT",
                                properties: {
                                    name: { type: "STRING", description: "Name des Medikaments" },
                                    dosage: { type: "STRING", description: "Dosierung (z.B. '500mg', '1 Tablette')" },
                                    frequency: { type: "STRING", description: "Einnahmehäufigkeit" },
                                    startDate: { type: "STRING", description: "Startdatum (ISO)" }
                                },
                                required: ["name", "dosage"]
                            }
                        },
                        {
                            name: "createDoctor",
                            description: "Legt einen neuen Arzt an.",
                            parameters: {
                                type: "OBJECT",
                                properties: {
                                    name: { type: "STRING", description: "Name des Arztes" },
                                    specialty: { type: "STRING", description: "Fachgebiet" },
                                    city: { type: "STRING", description: "Stadt/Ort" }
                                },
                                required: ["name", "specialty"]
                            }
                        }
                    ]
                }
            ]
        });

        const chat = model.startChat();
        const result = await chat.sendMessage(userMessage);
        const response = await result.response;
        const calls = response.functionCalls();

        if (calls && calls.length > 0) {
            const call = calls[0];
            let actionResult;

            console.log("Function Call:", call.name, call.args);

            if (call.name === "createStatus") {
                actionResult = await createStatus({
                    painLevel: call.args.painLevel as number,
                    symptoms: (call.args.symptoms as string[]) || [],
                    mood: (call.args.mood as string) || undefined,
                    content: (call.args.notes as string) || "Spracheingabe",
                    date: new Date(),
                    affectedAreas: [],
                    medicationsTaken: [],
                    documentIds: []
                });
            } else if (call.name === "createAppointment") {
                // Simple logic: if doctorId looks like a UUID, use it, otherwise we might need to create one (skip for now)
                // For MVP we assume Gemini picks a valid ID or we leave it empty/handle string match later.
                // If doctorId is NOT in our list, we might want to create a doctor first? 
                // For now, let's just save whatever Gemini sends.
                actionResult = await createAppointment({
                    date: new Date(call.args.date as string),
                    doctorId: (call.args.doctorId as string) || "unknown",
                    reason: call.args.reason as string,
                    type: (call.args.type as string) || "Untersuchung",
                    recommendations: [],
                    prescriptions: [],
                    documentIds: []
                });
            } else if (call.name === "createMedication") {
                actionResult = await createMedication({
                    name: call.args.name as string,
                    dosage: call.args.dosage as string,
                    frequency: (call.args.frequency as string) || "täglich",
                    startDate: new Date((call.args.startDate as string) || Date.now()),
                    route: "oral",
                    sideEffects: [],
                    isActive: true
                });
            } else if (call.name === "createDoctor") {
                actionResult = await createDoctor({
                    name: call.args.name as string,
                    specialty: call.args.specialty as string,
                    address: call.args.city ? { city: call.args.city as string } : undefined,
                    isActive: true
                });
            }

            return new Response(JSON.stringify({
                success: true,
                action: call.name,
                data: actionResult,
                message: "Eintrag erfolgreich erstellt."
            }), {
                status: 200,
                headers: { "Content-Type": "application/json" }
            });
        }

        // No function called
        return new Response(JSON.stringify({
            success: false,
            message: response.text() || "Ich konnte leider keine Aktion ableiten."
        }), {
            status: 200, // OK response, but no action
            headers: { "Content-Type": "application/json" }
        });

    } catch (error: any) {
        console.error("API Error:", error);
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
}
