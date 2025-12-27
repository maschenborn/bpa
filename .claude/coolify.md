# Coolify Deployment Guide

Anleitung für das Deployment neuer Projekte zu Coolify bei team:orange.

## Übersicht

- **Coolify Dashboard:** https://coolify.teamorange.dev
- **Server IP:** 157.90.19.138
- **GitLab:** gitlab.teamorange.dev (SSH Port: 29418)

---

## Neues Projekt deployen

### Variante A: Öffentliches Repository (einfach)

Wenn das Repository öffentlich ist, reicht die HTTPS-URL:

```
https://gitlab.teamorange.dev/teamorange/projekt-name.git
```

### Variante B: Privates Repository (Standard bei uns)

Für private Repositories gibt es zwei Optionen:

#### Option 1: HTTPS mit Access Token (empfohlen)

**Einmalig pro Team/Organisation:**
1. GitLab → User Settings → Access Tokens
2. Neuen Token erstellen mit Scope `read_repository`
3. Token sicher speichern (z.B. in 1Password)

**Pro Projekt:**
- Repository-URL im Format:
  ```
  https://oauth2:<TOKEN>@gitlab.teamorange.dev/teamorange/nerds/projekt-name.git
  ```

**Vorteile:**
- Kein SSH-Key-Management nötig
- Ein Token kann für mehrere Projekte genutzt werden
- Einfache Einrichtung

**Nachteile:**
- Token im Klartext in Coolify gespeichert
- Bei Token-Rotation müssen alle Apps aktualisiert werden

#### Option 2: SSH Deploy Key (sicherer)

**Pro Projekt in Coolify:**
1. Keys & Tokens → Private Keys → Add New
2. Neuen SSH-Key generieren
3. Public Key kopieren

**Pro Projekt in GitLab:**
1. Projekt → Settings → Repository → Deploy Keys
2. Public Key einfügen
3. "Grant write permissions" nur wenn nötig

**Repository-URL Format:**
```
ssh://git@gitlab.teamorange.dev:29418/teamorange/nerds/projekt-name.git
```

⚠️ **Wichtig:** Der SSH-Port 29418 muss in der URL stehen!

**Vorteile:**
- Sicherer (Key pro Projekt)
- Keine Tokens die rotieren

**Nachteile:**
- Mehr Aufwand pro Projekt
- Key-Management in zwei Systemen

---

## Schritt-für-Schritt: Neues Projekt

### 1. Projekt in GitLab erstellen

```bash
# Lokal
mkdir mein-projekt && cd mein-projekt
git init
# ... Code schreiben ...
git add -A
git commit -m "Initial commit"
git remote add origin ssh://git@gitlab.teamorange.dev:29418/teamorange/nerds/mein-projekt.git
git push -u origin main
```

### 2. DNS-Record erstellen

A-Record anlegen:
```
mein-projekt.teamorange.dev → 157.90.19.138
```

### 3. Application in Coolify erstellen

**Via Dashboard:**
1. Projects → Projekt wählen → Add New Resource
2. Application → Public/Private Repository
3. Repository-URL eintragen
4. Branch: `main`
5. Build Pack: `Nixpacks` (für Next.js, Node, etc.)
6. Port: entsprechend der App (z.B. 3000 für Next.js)
7. Domain: `https://mein-projekt.teamorange.dev`
8. Deploy klicken

**Via API/MCP:**
```bash
# Mit dem Coolify MCP Server in Claude:
> Erstelle eine neue Application für https://gitlab.teamorange.dev/teamorange/nerds/mein-projekt.git
> mit Domain mein-projekt.teamorange.dev
```

### 4. Erstes Deployment

- Automatisch nach Erstellung (wenn "Instant Deploy" aktiviert)
- Oder manuell: Deploy Button klicken
- SSL-Zertifikat wird automatisch von Let's Encrypt geholt

---

## Wichtige Einstellungen pro App

| Einstellung | Wert | Beschreibung |
|-------------|------|--------------|
| Build Pack | `nixpacks` | Automatische Erkennung für Next.js, Node, Python, etc. |
| Port | App-abhängig | Next.js: 3000, Python: 8000, etc. |
| Domain | `https://...` | HTTPS für automatisches SSL |
| Branch | `main` | Oder `develop` für Staging |

### Next.js spezifisch

In `next.config.js`:
```javascript
const nextConfig = {
  output: 'standalone',  // Wichtig für Docker!
}
```

---

## Wer muss was machen?

### Einmalig (Admin)

- [ ] Coolify Server aufsetzen
- [ ] Domain `coolify.teamorange.dev` konfigurieren
- [ ] GitLab Access Token erstellen (für HTTPS-Variante)
- [ ] API-Token für MCP Server erstellen

### Pro Projekt (Entwickler)

- [ ] Code zu GitLab pushen
- [ ] DNS-Record erstellen (oder Admin bitten)
- [ ] Application in Coolify anlegen
- [ ] Bei SSH-Variante: Deploy Key einrichten

### Pro Mitarbeiter

- [ ] Zugang zum Coolify Dashboard (Admin erstellt Account)
- [ ] Optional: Lokale MCP-Server Konfiguration für Claude

---

## MCP Server Konfiguration

Der MCP Server ermöglicht die Steuerung von Coolify direkt aus Claude heraus.

Wir nutzen das öffentliche npm-Paket [coolify-mcp-server](https://www.npmjs.com/package/coolify-mcp-server).

### 1. API-Token in Coolify erstellen

1. Coolify Dashboard öffnen: https://coolify.teamorange.dev
2. Keys & Tokens → API tokens → Create New Token
3. Token kopieren (Format: `3|abc...xyz`)

⚠️ **Jeder Mitarbeiter braucht seinen eigenen API-Token!**

### 2. Claude Desktop konfigurieren

**Datei:** `~/Library/Application Support/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "coolify": {
      "command": "npx",
      "args": ["-y", "coolify-mcp-server"],
      "env": {
        "COOLIFY_TOKEN": "3|dein-token-hier",
        "COOLIFY_BASE_URL": "http://157.90.19.138:8000"
      }
    }
  }
}
```

**Wichtig:**
- Token einsetzen (eigenen Token aus Schritt 1)
- Claude Desktop neu starten
- Node.js 18+ muss installiert sein

### 3. Testen

Nach dem Neustart von Claude Desktop sollten folgende Befehle funktionieren:

```
> Zeige alle Coolify Applications
> Deploye die App hello-coolify
> Was ist der Status vom letzten Deployment?
```

### Verfügbare MCP-Befehle

| Befehl | Beschreibung |
|--------|--------------|
| `coolify_list_servers` | Server auflisten |
| `coolify_list_projects` | Projekte auflisten |
| `coolify_list_applications` | Alle Apps anzeigen |
| `coolify_get_application` | App-Details abrufen |
| `coolify_deploy` | Deployment starten |
| `coolify_get_deployment_status` | Deployment-Status prüfen |
| `coolify_list_deployments` | Letzte Deployments |
| `coolify_start_app` | App starten |
| `coolify_stop_app` | App stoppen |
| `coolify_restart_app` | App neustarten |

---

## Häufige Probleme

### SSL-Zertifikat wird nicht generiert

1. DNS-Record prüfen: `nslookup app.teamorange.dev`
2. Ports 80/443 müssen offen sein
3. Proxy neustarten: Server → Restart Proxy
4. Falls nötig: `rm /data/coolify/proxy/acme.json` auf Server

### Deployment schlägt fehl

1. Logs prüfen im Coolify Dashboard
2. Bei SSH: Deploy Key in GitLab hinzugefügt?
3. Bei HTTPS: Token noch gültig?
4. Branch existiert?

### App startet nicht

1. Port-Einstellung prüfen
2. Build-Logs checken
3. Health Check deaktivieren zum Testen

---

## Nützliche Befehle

### Via MCP Server (in Claude)

```
> Zeige alle Applications
> Deploye die App hello-coolify
> Starte die App XYZ neu
> Was ist der Status vom letzten Deployment?
```

### Via API (curl)

```bash
# Server auflisten
curl -H "Authorization: Bearer <TOKEN>" \
  http://157.90.19.138:8000/api/v1/servers

# Deployment starten
curl -H "Authorization: Bearer <TOKEN>" \
  "http://157.90.19.138:8000/api/v1/deploy?uuid=<APP-UUID>"
```

---

## Ressourcen

- [Coolify Dokumentation](https://coolify.io/docs)
- [Coolify API Reference](https://coolify.io/docs/api-reference)
- Interner MCP Server: `/mcp-server/` in diesem Repository
