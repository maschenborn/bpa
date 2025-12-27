# BPA - Bines Patientenakte

## Projektbeschreibung

Medizinische Dokumentations-Webanwendung zur Protokollierung einer Behandlungshistorie.

## Tech Stack

- **Astro** ^5.16.6 - Framework mit Content Collections
- **React** ^19.2.3 - UI-Komponenten
- **MUI** ^7.3.6 - Material UI Design-System
- **Node** 22.x LTS - Runtime

## MUI-Konventionen (v7.2+)

```tsx
// RICHTIG:
import Grid from '@mui/material/Grid';
<Grid size={{ xs: 12, md: 6 }}>

// FALSCH:
import Grid2 from '@mui/material/Grid2';  // Veraltet!
<Grid xs={12} md={6}>                     // Alte Syntax!

// Container brauchen width:
<Container sx={{ width: '100%' }}>
```

## Brand

- Primary-Farbe: `#fa5f46` (team:orange)
- UI-Sprache: Deutsch
- Code-Kommentare: Englisch

## Datenstruktur

Alle Daten file-basiert in `/src/content/`:
- `doctors/*.json` - Ärzte
- `appointments/*.json` - Termine
- `medications/*.json` - Medikamente
- `status/*.md` - Tagesstatus (Markdown mit Frontmatter)
- `documents/*.json` - Dokument-Metadaten

Hochgeladene Dokumente in `/public/documents/YYYY-MM/`.

## Git

- Lokales Repository
- Commit nach jeder wesentlichen Änderung
- Kein Remote im ersten Schritt
- NIEMALS `git add .` - Dateien einzeln hinzufügen

## MCP-Tools

- `mui-mcp` - MUI-Dokumentation
- `astrojs-mcp` (Docker MCP) - Astro-Hilfe
- `claude-in-chrome` - Browser-Tests (bevorzugt)
- `chrome-devtools-mcp` - Browser-Tests (Fallback)

## Wichtige Pfade

- `/src/content/config.ts` - Zod-Schemas
- `/src/lib/data/fileOperations.ts` - CRUD-Operationen
- `/src/theme/theme.ts` - MUI Theme
- `/src/pages/api/` - REST-API Endpoints
