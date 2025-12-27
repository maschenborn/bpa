# Gemini Voice Assistant Integration

> **Status**: In Bearbeitung (Gemini arbeitet parallel)

## Ziel

Voice-basierter Chat-Assistent mit **Gemini 1.5 Flash** für CRUD-Operationen via natürlicher Sprache.

---

## User Flow

1. User klickt Mikrofon-Icon
2. User spricht (z.B. "Ich habe heute starke Kopfschmerzen, Stufe 8")
3. App konvertiert Speech zu Text (Web Speech API)
4. Text → `/api/assistant`
5. Gemini analysiert Text + DB-Kontext (z.B. Ärzte-Liste)
6. Gemini ruft passende Function (z.B. `createStatus`)
7. App bestätigt Aktion oder fragt nach Details

---

## Änderungen

### Konfiguration & Dependencies

| Datei | Aktion | Beschreibung |
|-------|--------|--------------|
| `.env` | NEU | `GOOGLE_API_KEY` (aus `.mcp.json` übernehmen) |
| `package.json` | ÄNDERN | `@google/generative-ai` hinzufügen |

### Backend

| Datei | Aktion | Beschreibung |
|-------|--------|--------------|
| `src/pages/api/assistant.ts` | NEU | Gemini Endpoint mit Function Calling |

**API Endpoint Details:**
- POST `{ message: string }`
- Context laden: Ärzte, Medikamente (für ID-Mapping)
- Gemini konfigurieren mit System Prompt ("Du bist ein medizinischer Assistent für Bine...")
- Tools definieren:
  - `createStatus(painLevel, symptoms, ...)`
  - `createAppointment(date, doctorId, reason)`
  - `createMedication(name, dosage)`
  - `createDoctor(name, specialty)`
- Function Call ausführen via `fileOperations.ts`

### Frontend

| Datei | Aktion | Beschreibung |
|-------|--------|--------------|
| `src/components/Assistant/VoiceButton.tsx` | NEU | FAB mit Mikrofon, Speech Recognition |
| `src/components/Assistant/AssistantBubble.tsx` | NEU | Feedback-UI für Konversation |
| `src/layouts/BaseLayout.astro` | ÄNDERN | VoiceButton global einbinden |

**VoiceButton Features:**
- Floating Action Button (FAB) mit Mikrofon-Icon
- `window.SpeechRecognition` / `webkitSpeechRecognition`
- Visuelles Feedback: "Höre zu...", "Verarbeite...", "Erledigt"

**AssistantBubble Features:**
- Minimale UI für Konversations-Feedback
- "Ich habe einen Statuseintrag für dich erstellt."

---

## Verifikation

### Automatisierte Tests

```bash
curl -X POST http://localhost:4321/api/assistant \
  -H "Content-Type: application/json" \
  -d '{"message": "Neuer Status, Schmerzlevel 6, Kopfschmerzen"}'
```

### Manuelle Tests

1. **Speech Test**:
   - Mikrofon klicken
   - Sagen: "Neuer Status, Schmerzen 5, mir ist übel"
   - Prüfen: Neue `.md` in `src/content/status/`

2. **Kontext Test**:
   - Sagen: "Termin bei Dr. [Name eines existierenden Arztes] morgen"
   - Prüfen: Korrekte Doctor ID wird aufgelöst

---

## API Key Setup

Key aus `.mcp.json` → `.env` kopieren:

```bash
# .env (Projektroot)
GOOGLE_API_KEY=AIzaSyAx6Sm9c7nf9Aqvd4ntvQuQhfBdl9ws7uk
```

**Wichtig**: `.env` ist in `.gitignore` - Key nicht committen!

---

## Technische Details

### Gemini Model

- **Model**: `gemini-3-flash-preview` (neuestes, intelligentestes Flash-Model)
- **SDK**: `@google/generative-ai`
- **Fallback-Alternativen**:
  - `gemini-2.5-flash` (stable, falls Preview instabil)
  - `gemini-2.5-pro` (höchste Qualität, langsamer)

### Web Speech API

```typescript
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();
recognition.lang = 'de-DE';
recognition.continuous = false;
recognition.interimResults = false;
```

### Function Calling Schema

```typescript
const tools = [
  {
    name: 'createStatus',
    description: 'Erstellt einen neuen Tagesstatus-Eintrag',
    parameters: {
      type: 'object',
      properties: {
        painLevel: { type: 'number', minimum: 0, maximum: 10 },
        symptoms: { type: 'array', items: { type: 'string' } },
        generalCondition: { type: 'string' },
        mood: { type: 'string' },
        notes: { type: 'string' }
      },
      required: ['painLevel']
    }
  },
  // ... weitere Tools
];
```
