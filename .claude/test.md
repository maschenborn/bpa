# Voice Assistant Test Report

> **Datum**: 2025-12-27
> **Model**: `gemini-3-flash-preview`
> **Testumfang**: 20 realistische Sprachprompts

---

## Testplan

### Kategorien
- **Ärzte** (4 Prompts)
- **Termine** (6 Prompts)
- **Medikamente** (4 Prompts)
- **Status** (6 Prompts)

### Variationen
- Vollständig vs. unvollständig
- Vergangenheit, Gegenwart, Zukunft
- Formell vs. umgangssprachlich

---

## Testergebnisse

### Runde 1: Initiale Tests

#### Ärzte (4/4 erfolgreich)

| # | Prompt | Erwartung | Ergebnis | Status |
|---|--------|-----------|----------|--------|
| 1 | "Ich brauche eine neue Ärztin, Dr. Martina Schneider, Neurologin in der Charité Berlin" | Doctor mit name, specialty, city | `{ name: 'Dr. Martina Schneider', specialty: 'Neurologin', city: 'Charité Berlin' }` | ✅ |
| 2 | "Neuer Arzt Dr. Weber, Zahnarzt" | Doctor mit name, specialty | `{ name: 'Dr. Weber', specialty: 'Zahnarzt' }` | ✅ |
| 3 | "Leg mir Krause als Orthopäde in München an" | Doctor mit name, specialty, city | `{ name: 'Krause', specialty: 'Orthopäde', city: 'München' }` | ✅ |
| 4 | "Bitte speichere Dr. Fischer als HNO-Arzt" | Doctor mit name, specialty | `{ name: 'Dr. Fischer', specialty: 'HNO-Arzt' }` | ✅ |

**Erkenntnisse:**
- Alle Doctor-Prompts wurden korrekt erkannt
- "Dr." wird korrekt als Teil des Namens übernommen
- Fachgebiet wird zuverlässig extrahiert
- Stadt/Klinik wird korrekt als `city` gemappt

---

#### Termine (5/6 erfolgreich + 1 intelligente Rückfrage)

| # | Prompt | Erwartung | Ergebnis | Status |
|---|--------|-----------|----------|--------|
| 5 | "Termin am fünfzehnten Januar um zehn bei Dr. Schneider zur Kontrolle" | Appointment 15.01.2026 10:00 | `{ date: '2026-01-15T10:00:00', doctorId: 'Dr. Schneider', reason: 'Kontrolluntersuchung' }` | ✅ |
| 6 | "Morgen Nachmittag um halb drei zum Zahnarzt wegen Zahnschmerzen" | Appointment morgen 14:30 | `{ date: '2025-12-28T14:30', doctorId: 'Zahnarzt', reason: 'Zahnschmerzen' }` | ✅ |
| 7 | "Ich war gestern bei doc123, er hat gesagt ich soll mich schonen" | Vergangener Termin | `{ date: '2025-12-26T10:00', doctorId: 'doc123', reason: 'Besprechung (Empfehlung: Schonen)' }` | ✅ |
| 8 | "Heute um vier in die Radiologie zum MRT" | Appointment heute 16:00 | `{ date: '2025-12-27T16:00', doctorId: 'Radiologie', reason: 'MRT' }` | ✅ |
| 9 | "Termin nächste Woche" | Unvollständig → Rückfrage | Keine Function, sondern Rückfrage | ℹ️ |
| 10 | "Vorgestern war ich beim Arzt, leichte Entzündung" | Vergangener Termin 25.12. | `{ date: '2025-12-25T10:00', doctorId: 'doc_001', reason: 'leichte Entzündung' }` | ✅ |

**Erkenntnisse:**
- Relative Zeitangaben ("morgen", "heute", "gestern", "vorgestern") werden korrekt interpretiert
- "um halb drei" wird korrekt zu 14:30
- Intelligentes Verhalten: Bei zu vagen Angaben (Test 9) fragt das Modell nach statt zu raten
- `doctorId` nutzt nicht die echten UUIDs aus dem Kontext - verwendet stattdessen Namen/Bezeichnungen

**Verbesserungspotenzial:**
- [ ] doctorId sollte auf existierende Arzt-UUIDs gemappt werden
- [ ] Vergangene Termine sollten evtl. anders behandelt werden (Status statt Appointment?)

---

#### Medikamente (3/4 erfolgreich + 1 intelligente Rückfrage)

| # | Prompt | Erwartung | Ergebnis | Status |
|---|--------|-----------|----------|--------|
| 11 | "Neues Medikament: Ibuprofen 600mg dreimal täglich bei Bedarf" | Medication mit name, dosage, frequency | `{ name: 'Ibuprofen', dosage: '600mg', frequency: 'dreimal täglich bei Bedarf', startDate: '2025-12-27' }` | ✅ |
| 12 | "Amoxicillin 1000 morgens und abends" | Medication mit name, dosage, frequency | `{ name: 'Amoxicillin', dosage: '1000mg', frequency: 'morgens und abends', startDate: '2025-12-27' }` | ✅ |
| 13 | "Tabletten gegen Schmerzen" | Zu unvollständig → Rückfrage | Keine Function, sondern Rückfrage | ℹ️ |
| 14 | "Ich nehme seit letzter Woche Pantoprazol 40mg jeden Morgen" | Medication mit startDate in Vergangenheit | `{ name: 'Pantoprazol', dosage: '40mg', frequency: 'jeden Morgen', startDate: '2025-12-20' }` | ✅ |

**Erkenntnisse:**
- Dosierung wird zuverlässig extrahiert (auch "1000" wird zu "1000mg" ergänzt)
- Einnahmehäufigkeit wird im Freitext korrekt erfasst
- "seit letzter Woche" wird korrekt auf ~7 Tage zurück berechnet
- Intelligentes Verhalten: Bei "Tabletten gegen Schmerzen" wird nachgefragt

**Verbesserungspotenzial:**
- [ ] prescribingDoctorId wird nicht erfasst (könnte aus Kontext ableitbar sein)

---

#### Status (6/6 erfolgreich)

| # | Prompt | Erwartung | Ergebnis | Status |
|---|--------|-----------|----------|--------|
| 15 | "Heute geht es mir richtig schlecht, Schmerzen Stufe 8, starke Kopfschmerzen, Übelkeit und Erschöpfung" | Status mit painLevel 8, symptoms, mood | `{ painLevel: 8, symptoms: ['starke Kopfschmerzen', 'Übelkeit', 'Erschöpfung'], mood: 'schlecht' }` | ✅ |
| 16 | "Geht so, Schmerzen bei fünf" | Status mit painLevel 5 | `{ painLevel: 5 }` | ✅ |
| 17 | "Mir ist den ganzen Tag übel und der Kopf brummt, so Stufe sieben" | Status mit painLevel 7, symptoms, notes | `{ painLevel: 7, symptoms: ['Übelkeit', 'Kopfschmerzen'], notes: 'Mir ist den ganzen Tag übel...' }` | ✅ |
| 18 | "Heute war ein guter Tag, Schmerzen nur bei 2, bin gut drauf" | Status mit painLevel 2, mood | `{ painLevel: 2, mood: 'gut drauf', notes: 'Heute war ein guter Tag.' }` | ✅ |
| 19 | "Gestern Abend plötzlich starke Kieferschmerzen, Stufe 9" | Status mit painLevel 9, symptoms, notes | `{ painLevel: 9, symptoms: ['starke Kieferschmerzen'], notes: 'Gestern Abend traten die Schmerzen plötzlich auf.' }` | ✅ |
| 20 | "Nach dem Ibuprofen vorhin sind die Schmerzen von 7 auf 4 runter" | Status mit painLevel 4, notes | `{ painLevel: 4, notes: 'Ibuprofen vorhin eingenommen. Schmerzen haben sich von Stufe 7 auf 4 verbessert.' }` | ✅ |

**Erkenntnisse:**
- Schmerzlevel wird auch aus Text ("fünf", "sieben") extrahiert
- Stimmung wird zuverlässig erkannt ("schlecht", "gut drauf")
- Symptome werden als Array korrekt strukturiert
- Kontextinformationen ("nach dem Ibuprofen") werden in notes übernommen
- Zeitangaben ("gestern Abend") werden in den Kontext integriert

**Hervorragend:**
- Die Status-Erkennung funktioniert am zuverlässigsten
- Umgangssprachliche Ausdrücke werden verstanden
- Numerische und textuelle Schmerzangaben werden korrekt interpretiert

---

## Zusammenfassung Runde 1

### Erfolgsrate

| Kategorie | Erfolgreich | Rückfrage | Fehlgeschlagen | Rate |
|-----------|------------|-----------|----------------|------|
| Ärzte | 4 | 0 | 0 | 100% |
| Termine | 5 | 1 | 0 | 100%* |
| Medikamente | 3 | 1 | 0 | 100%* |
| Status | 6 | 0 | 0 | 100% |
| **Gesamt** | **18** | **2** | **0** | **100%** |

*Rückfragen bei zu vagen Eingaben sind gewünschtes Verhalten.

### Stärken

1. **Datumserkennung** - Relative Zeitangaben (morgen, gestern, vorgestern, letzter Woche) werden korrekt interpretiert
2. **Schmerzlevel** - Funktioniert mit Zahlen und Worten
3. **Symptom-Extraktion** - Zuverlässige Array-Erstellung aus Freitext
4. **Intelligente Rückfragen** - Bei unvollständigen Daten wird nachgefragt statt geraten
5. **Umgangssprache** - "Geht so", "bin gut drauf", "der Kopf brummt" werden verstanden

### Verbesserungspotenzial

1. **doctorId-Mapping** - Arzt-Namen sollten auf existierende UUIDs gemappt werden
2. **prescribingDoctorId** - Wird bei Medikamenten nicht erfasst
3. **Vergangene Termine** - Könnten evtl. anders behandelt werden

---

## Nächste Schritte

- [ ] System Prompt erweitern für besseres doctorId-Mapping
- [ ] Test mit echten Arzt-IDs aus dem Kontext
- [ ] Edge Cases testen (Dialekt, Rechtschreibfehler bei Voice Recognition)
