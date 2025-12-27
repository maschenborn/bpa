# Mission: BPA - Bines Patientenakte

## Hintergrund

Bine ist seit 10 Wochen mit den Folgen einer verpatzten Zahnbehandlung beschäftigt:
- Verschiedene Ärzte aufgesucht
- Unterschiedliche Medikamente erhalten
- Zustand verbessert sich nicht
- Eventuell steht noch ein Klinikaufenthalt bevor

## Zweck der Anwendung

1. **Ärzte briefen** - Vollständige Behandlungshistorie auf einen Blick
2. **Dokumentation** - Für potenzielle Haftungsfragen
3. **Übersicht behalten** - Filterbares Logbuch aller Ereignisse

## Was protokolliert wird

| Entität | Beispiele |
|---------|-----------|
| **Ärzte** | Name, Fachgebiet, Klinik, Kontakt |
| **Termine** | Datum, Arzt, Befund, Empfehlungen |
| **Medikamente** | Name, Dosierung, Zeitraum, Wirkung/Nebenwirkungen |
| **Tagesstatus** | Schmerzlevel (0-10), Symptome, Allgemeinzustand |
| **Dokumente** | Befunde, Röntgenbilder, Rechnungen, Überweisungen |

## Kernfunktionen

### Phase 1 (MVP)
- [ ] Timeline-Ansicht aller Einträge
- [ ] CRUD für alle Entitäten
- [ ] Dokument-Upload
- [ ] Filter nach Datum, Typ, Arzt

### Phase 2
- [ ] Druckbare Export-Ansicht für Arzt-Briefing
- [ ] Suche über alle Einträge

### Phase 3 (Später)
- [ ] Gemini-Chat für natürlichsprachliche Eingabe
  - "Heute morgen Schmerzstufe 7, Schwellung hat zugenommen"
  - → Automatisch strukturierter Status-Eintrag

## Nicht-Ziele

- Keine Multi-User-Funktionalität
- Keine Cloud-Synchronisation
- Keine medizinische Beratung
- Kein Kalender-Integration (vorerst)

## Erfolg

Die App ist erfolgreich, wenn Bine:
1. Schnell einen neuen Eintrag erfassen kann
2. Einem Arzt in 2 Minuten die gesamte Historie zeigen kann
3. Bei Bedarf alle relevanten Dokumente griffbereit hat
