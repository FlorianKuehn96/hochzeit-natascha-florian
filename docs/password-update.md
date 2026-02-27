# Password Update Feature (Dokumentation)

Dieses Dokument beschreibt den Ablauf zum Ändern des Admin-Passworts über die API und die UI.

1) Ziel
- Konsistente Aktualisierung des Admin-Passworts in Redis (Upstash) und dem In-Memory-Fallback.
- UI-Flow über /admin/change-password
- Validierung, Fehlerbehandlung und Feedback an den User

2) Endpunkt
- POST /api/admin/change-password
- Felder: oldPassword, newPassword
- Authorization: Bearer <Admin-Token>
- Antworten: 200 mit Message bei Erfolg oder 4xx/5xx bei Fehler

3) Client-Seite (UI)
- /admin/change-password
- Felder: Aktuelles Passwort, Neues Passwort, Passwort bestätigen
- Validierung: mind. 8 Zeichen, neue != alte, neue == bestätigtes Passwort
- Feedback: Fehler- und Erfolgsmeldungen
- Nach Erfolg: Redirect zurück zum Admin-Dashboard

4) Backend-Logik
- Validierung des alten Passworts via DB-Wrapper (Redis+Memory)
- Hashen des neuen Passworts mit bcrypt
- Konsistente Aktualisierung in Redis und Memory
- Fehlerfälle behandeln (falsches altes Passwort, etc.)

5) Sicherheit
- Token-basierte Authentifizierung, Schutz gegen Replay
- Admin-Only-Access-Control

6) Troubleshooting
- Redis-Verbindung prüfen; Falls Redis ausfällt, Fall-Back auf Memory
- Tokens in LocalStorage prüfen
- Clearing von Sessions bei Passwortwechsel

7) QA & Tests (Hinweis)
- Manuelle End-to-End-Tests der UI-Flow
- API-Tests für Success/Failure-Pfade

