import type { APIRoute } from 'astro';
import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';

export const prerender = false;
import {
    createStatus,
    createAppointment,
    createMedication,
    createDoctor,
    updateStatus,
    updateAppointment,
    updateMedication,
    updateDoctor,
    getAllDoctors,
    getDoctorById,
    getAppointmentById,
    getMedicationById,
    getStatusById
} from '../../lib/data/fileOperations';

export const POST: APIRoute = async ({ request }) => {
    try {
        const data = await request.json();
        const userMessage = data.message;
        const context = data.context || {};

        if (!userMessage) {
            return new Response(JSON.stringify({ error: 'Message is required' }), { status: 400 });
        }

        const apiKey = import.meta.env.GOOGLE_API_KEY;
        if (!apiKey) {
            return new Response(JSON.stringify({ error: 'API key not configured' }), { status: 500 });
        }

        // --- 1. Load Data for Context ---
        const doctors = await getAllDoctors();
        const doctorList = doctors.map(d => `- "${d.name}" (${d.specialty}): ID="${d.id}"`).join('\n');

        let interactionContext = "";

        // Analyze current URL context
        if (context.pathname) {
            const parts = context.pathname.split('/').filter(Boolean);
            // Expected format: /doctors/[id], /appointments/[id], etc.
            if (parts.length === 2) {
                const [entityType, id] = parts;
                try {
                    if (entityType === 'doctors') {
                        const doc = await getDoctorById(id);
                        if (doc) interactionContext += `User betrachtet gerade den Arzt: "${doc.name}" (ID: ${doc.id}, Fachgebiet: ${doc.specialty}).\n`;
                    } else if (entityType === 'appointments') {
                        const app = await getAppointmentById(id);
                        if (app) interactionContext += `User betrachtet gerade den Termin am ${new Date(app.date).toLocaleString()} (ID: ${app.id}, Grund: ${app.reason}).\n`;
                    } else if (entityType === 'medications') {
                        const med = await getMedicationById(id);
                        if (med) interactionContext += `User betrachtet gerade das Medikament: "${med.name}" (ID: ${med.id}, Dosis: ${med.dosage}).\n`;
                    } else if (entityType === 'status') {
                        const stat = await getStatusById(id);
                        if (stat) interactionContext += `User betrachtet den Status-Eintrag vom ${new Date(stat.date).toLocaleDateString()} (ID: ${stat.id}).\n`;
                    }
                } catch (e) {
                    console.log("Could not resolve context entity", e);
                }
            }
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({
            model: "gemini-3-flash-preview",
            systemInstruction: `Du bist ein medizinischer Assistent für Bine. Deine Aufgabe ist es, Bines gesprochene Eingaben in strukturierte Daten umzuwandeln und in der Datenbank zu speichern.

KONTEXT-INFORMATIONEN:
${interactionContext ? "ACHTUNG: " + interactionContext + "Wenn der User 'diesen', 'den aktuellen' oder 'hier' sagt, beziehe dich auf die oben genannte ID.\n" : "Der User befindet sich auf keiner spezifischen Detailseite.\n"}

VERFÜGBARE ÄRZTE:
${doctorList || '(Keine Ärzte in der Datenbank)'}

REGELN:
1. Verwende bei Updates IMMER die ID des Eintrags. Wenn du im Kontext eine ID hast und der User "bearbeite diesen Arzt" sagt, nimm diese ID.
2. Wenn du einen neuen Termin bei einem bekannten Arzt anlegst, nutze dessen UUID.
3. Sei proaktiv: Wenn Informationen fehlen (z.B. Uhrzeit), rate sinnvoll (z.B. morgens = 09:00), aber bevorzuge explizite Angaben.
4. Formatierung: Datumsangaben immer als ISO String (YYYY-MM-DDTHH:MM:SS) oder YYYY-MM-DD.
5. Heutiges Datum: ${new Date().toISOString().split('T')[0]}
6. Aktuelle Uhrzeit: ${new Date().toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}
`,
            tools: [
                {
                    functionDeclarations: [
                        {
                            name: "createStatus",
                            description: "Erstellt einen neuen Tagesstatus-Eintrag.",
                            parameters: {
                                type: SchemaType.OBJECT,
                                properties: {
                                    painLevel: { type: SchemaType.NUMBER, description: "Schmerzlevel 0-10" },
                                    symptoms: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING }, description: "Symptome" },
                                    mood: { type: SchemaType.STRING },
                                    notes: { type: SchemaType.STRING }
                                },
                                required: ["painLevel"]
                            }
                        },
                        {
                            name: "updateStatus",
                            description: "Aktualisiert einen existierenden Status.",
                            parameters: {
                                type: SchemaType.OBJECT,
                                properties: {
                                    id: { type: SchemaType.STRING, description: "ID des Status" },
                                    painLevel: { type: SchemaType.NUMBER },
                                    symptoms: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
                                    mood: { type: SchemaType.STRING },
                                    notes: { type: SchemaType.STRING }
                                },
                                required: ["id"]
                            }
                        },
                        {
                            name: "createAppointment",
                            description: "Erstellt Termin.",
                            parameters: {
                                type: SchemaType.OBJECT,
                                properties: {
                                    date: { type: SchemaType.STRING },
                                    doctorId: { type: SchemaType.STRING },
                                    reason: { type: SchemaType.STRING },
                                    type: { type: SchemaType.STRING }
                                },
                                required: ["date", "reason"]
                            }
                        },
                        {
                            name: "updateAppointment",
                            description: "Aktualisiert Termin.",
                            parameters: {
                                type: SchemaType.OBJECT,
                                properties: {
                                    id: { type: SchemaType.STRING },
                                    date: { type: SchemaType.STRING },
                                    doctorId: { type: SchemaType.STRING },
                                    reason: { type: SchemaType.STRING },
                                    type: { type: SchemaType.STRING }
                                },
                                required: ["id"]
                            }
                        },
                        {
                            name: "createMedication",
                            description: "Erstellt Medikament.",
                            parameters: {
                                type: SchemaType.OBJECT,
                                properties: {
                                    name: { type: SchemaType.STRING },
                                    dosage: { type: SchemaType.STRING },
                                    frequency: { type: SchemaType.STRING },
                                    startDate: { type: SchemaType.STRING }
                                },
                                required: ["name", "dosage"]
                            }
                        },
                        {
                            name: "updateMedication",
                            description: "Aktualisiert Medikament.",
                            parameters: {
                                type: SchemaType.OBJECT,
                                properties: {
                                    id: { type: SchemaType.STRING },
                                    name: { type: SchemaType.STRING },
                                    dosage: { type: SchemaType.STRING },
                                    frequency: { type: SchemaType.STRING },
                                    endDate: { type: SchemaType.STRING, description: "Absetzdatum falls das Medikament abgesetzt wird" },
                                    isActive: { type: SchemaType.BOOLEAN }
                                },
                                required: ["id"]
                            }
                        },
                        {
                            name: "createDoctor",
                            description: "Erstellt Arzt.",
                            parameters: {
                                type: SchemaType.OBJECT,
                                properties: {
                                    name: { type: SchemaType.STRING },
                                    specialty: { type: SchemaType.STRING },
                                    city: { type: SchemaType.STRING }
                                },
                                required: ["name", "specialty"]
                            }
                        },
                        {
                            name: "updateDoctor",
                            description: "Aktualisiert Arzt.",
                            parameters: {
                                type: SchemaType.OBJECT,
                                properties: {
                                    id: { type: SchemaType.STRING },
                                    name: { type: SchemaType.STRING },
                                    specialty: { type: SchemaType.STRING },
                                    city: { type: SchemaType.STRING }
                                },
                                required: ["id"]
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
            const args = call.args as any;
            let actionResult;
            let message = "Aktion ausgeführt.";

            console.log("Function Call:", call.name, args);

            if (call.name === "createStatus") {
                actionResult = await createStatus({
                    painLevel: args.painLevel as number,
                    symptoms: (args.symptoms as string[]) || [],
                    mood: (args.mood as string) || undefined,
                    content: (args.notes as string) || "Spracheingabe",
                    date: new Date(),
                    affectedAreas: [],
                    medicationsTaken: [],
                    documentIds: []
                });
                message = "Status erstellt.";
            } else if (call.name === "updateStatus") {
                actionResult = await updateStatus(args.id as string, {
                    painLevel: args.painLevel as number | undefined,
                    symptoms: args.symptoms as string[] | undefined,
                    mood: args.mood as string | undefined,
                    content: args.notes as string | undefined,
                });
                message = "Status aktualisiert.";
            } else if (call.name === "createAppointment") {
                actionResult = await createAppointment({
                    date: new Date(args.date as string),
                    doctorId: (args.doctorId as string) || "unknown",
                    reason: args.reason as string,
                    type: (args.type as string) || "Untersuchung",
                    recommendations: [],
                    prescriptions: [],
                    documentIds: []
                });
                message = "Termin angelegt.";
            } else if (call.name === "updateAppointment") {
                actionResult = await updateAppointment(args.id as string, {
                    date: args.date ? new Date(args.date as string) : undefined,
                    doctorId: args.doctorId as string | undefined,
                    reason: args.reason as string | undefined,
                    type: args.type as string | undefined,
                });
                message = "Termin aktualisiert.";
            } else if (call.name === "createMedication") {
                actionResult = await createMedication({
                    name: args.name as string,
                    dosage: args.dosage as string,
                    frequency: (args.frequency as string) || "täglich",
                    startDate: new Date((args.startDate as string) || Date.now()),
                    route: "oral", sideEffects: [], isActive: true
                });
                message = "Medikament angelegt.";
            } else if (call.name === "updateMedication") {
                actionResult = await updateMedication(args.id as string, {
                    name: args.name as string | undefined,
                    dosage: args.dosage as string | undefined,
                    frequency: args.frequency as string | undefined,
                    endDate: args.endDate ? new Date(args.endDate as string) : undefined,
                    isActive: args.isActive as boolean | undefined
                });
                message = "Medikament aktualisiert.";
            } else if (call.name === "createDoctor") {
                actionResult = await createDoctor({
                    name: args.name as string,
                    specialty: args.specialty as string,
                    address: args.city ? { city: args.city as string } : undefined,
                    isActive: true
                });
                message = "Arzt angelegt.";
            } else if (call.name === "updateDoctor") {
                actionResult = await updateDoctor(args.id as string, {
                    name: args.name as string | undefined,
                    specialty: args.specialty as string | undefined,
                    address: args.city ? { city: args.city as string } : undefined
                });
                message = "Arzt aktualisiert.";
            }

            return new Response(JSON.stringify({
                success: true,
                action: call.name,
                data: actionResult,
                message: message
            }), {
                status: 200,
                headers: { "Content-Type": "application/json" }
            });
        }

        return new Response(JSON.stringify({
            success: false,
            message: response.text() || "Ich konnte leider keine Aktion ableiten."
        }), {
            status: 200,
            headers: { "Content-Type": "application/json" }
        });

    } catch (error: any) {
        console.error("API Error:", error);
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
}
