# Migration Plan: Local File System -> Firebase Realtime Database

## Überblick

**Ziel:** Wechsel von der lokalen Dateispeicherung (`src/content/*.json`) zur **Firebase Realtime Database**.
**URL:** `https://bpa-app-2026-default-rtdb.europe-west1.firebasedatabase.app/`
**Warum RTDB statt Firestore?**
- Für diese Datenmenge absolut ausreichend.
- Extrem schnell (Latenz).
- Einfaches JSON-Datenmodell passt perfekt zu unserer aktuellen Struktur.
- Einfachere "Realtime"-Updates für spätere Features.

## Phase 1: Vorbereitung & Setup

### 1.1 Abhängigkeiten
```bash
npm install firebase-admin firebase
```

### 1.2 Konfiguration
- Erstelle Service Account in der Firebase Console.
- Lade `service-account.json` herunter (NIEMALS ins Git!).
- Setze `.env`-Variablen:
  ```env
  FIREBASE_DATABASE_URL=https://bpa-app-2026-default-rtdb.europe-west1.firebasedatabase.app/
  FIREBASE_PROJECT_ID=bpa-app-2026
  # Entweder Pfad zum Key-File oder Private Key direkt (in Produktion besser)
  FIREBASE_SERVICE_ACCOUNT_KEY=./service-account.json
  ```

### 1.3 Firebase Service Initialisierung
Erstelle `src/lib/firebase/server.ts`:
- Initialisiert die Firebase Admin App (nur serverseitig in Astro nutzen!).
- Exportiert die `db` (Database) Instanz.

## Phase 2: Datenmodell-Mapping

Das Modell bleibt flach, ähnlich den Ordnern:

```json
{
  "doctors": {
    "uuid-1": { "name": "Dr. Müller", ... },
    "uuid-2": { "name": "Klinikum Nord", ... }
  },
  "appointments": {
    "uuid-a": { "date": "...", "doctorId": "uuid-1", ... }
  },
  "medications": { ... },
  "status": {
    "uuid-s": { "painLevel": 5, "content": "..." } // Markdown content wird String-Feld
  },
  "documents": { ... }
}
```

> [!NOTE]
> Astro Content Collections (`src/content`) sind "build-time" optimiert. Mit Firebase werden wir diese **komplett ersetzen** müssen oder zumindest die "Source of Truth" ändern.
> ** Strategie-Entscheidung:** Wir behalten vorerst die Typen aus `config.ts`, entfernen aber die `defineCollection` Logik, da Astro Collections statische Dateien erwarten. Wir laden Daten nun dynamisch (SSR) oder per Client-Fetch.

## Phase 3: Refactoring des Data-Layers (`fileOperations.ts`)

Wir schreiben `src/lib/data/fileOperations.ts` komplett um. Die Funktionssignaturen (`getAllDoctors`, `createDoctor`) bleiben **identisch**, aber die Implementierung wechselt.

**Beispiel Alt:**
```typescript
export async function getAllDoctors() {
  const files = await listJsonFiles(dir);
  return files.map(...)
}
```

**Beispiel Neu (Firebase):**
```typescript
import { db } from '../firebase/server';

export async function getAllDoctors() {
  const snapshot = await db.ref('doctors').once('value');
  const val = snapshot.val();
  if (!val) return [];
  return Object.values(val); // Convert {id: obj} map to array
}
```

## Phase 4: Datenmigration

Einmaliges Skript `scripts/migrate-to-firebase.ts`:
1. Liest alle lokalen JSON/MD-Dateien mit der "alten" Logik.
2. Schreibt sie per Admin SDK in die RTDB.
3. Validierung: Check in der Firebase Console.

## Phase 5: Anpassung der Astro-Pages

Da Astro Content Collections (`getCollection`) nicht mehr funktionieren, müssen alle Pages, die `getCollection('doctors')` nutzen, auf unsere (neue) `getAllDoctors()` Funktion umgestellt werden.

- **Vorteil:** Die App wird dadurch "echt" dynamisch (SSR - Server Side Rendering).
- **Änderung:** In `astro.config.mjs` sicherstellen, dass `output: 'server'` aktiviert ist (oder hybrid), damit API-Keys sicher bleiben und Daten aktuell sind.

## Risiko-Analyse & Fallback
- **Datenverlust:** Wir behalten die lokalen Dateien als Backup git-committed.
- **Offline:** Ohne Internet keine App mehr (außer wir bauen komplexes PWA Caching). Für Realtime DB aber okay.
- **Kosten:** Free Tier von Firebase ist für diesen Use-Case mehr als ausreichend.

## Nächste Schritte
1. Credentials besorgen.
2. `firebase.md` Plan bestätigen.
3. Migration Script schreiben & ausführen.
4. `fileOperations.ts` umschreiben.
