# User Management Requirements

## 🎯 Anforderungen

### 1. **Guest Access (personalisierte Links)**
- Jeder Gast bekommt einen **eindeutigen Code** (z.B. `guest_abc123xyz`)
- URL mit Code: `/guest/abc123xyz`
- **Oder:** Login mit Code (kein Passwort nötig)
- Code bleibt immer gültig (bis zur Hochzeit)
- **Was sehen Gäste:** Gesamte Website + einsehen der eigenen RSVP

### 2. **Admin Access**
- Admin Login mit **E-Mail + Passwort**
- Separate Seite: `/admin`
- **Admin Dashboard mit:**
  - 📊 RSVP Statistiken (Zusagen/Absagen, Gästezahl, Dietary)
  - 👥 Gästeliste mit allen Codes
  - ✏️ Gäste editieren/hinzufügen
  - 📧 RSVP Export (CSV/PDF)
  - 🔑 Codes generieren/verwalten
  - 🔐 Admin-Passwort ändern

### 3. **Unauthenticated Access**
- `/` → Redirect zu `/login` wenn nicht authentifiziert
- Kein öffentlicher Zugriff zur Website

---

## 🗄️ Datenstruktur

### Gäste (Guests)
```typescript
{
  id: string
  name: string
  email: string
  code: string (eindeutig)
  rsvp: {
    status: 'pending' | 'attending' | 'declined'
    guests: number
    accommodation: 'needed' | 'not-needed'
    dietary: string
    message: string
    submittedAt: string | null
  }
  createdAt: string
}
```

### Admin
```typescript
{
  email: string
  password: string (bcrypt gehashed)
  createdAt: string
}
```

---

## 🛠️ Tech Stack

- **NextAuth.js** oder **Custom JWT** für Session Management
- **SQLite / Firestore / Supabase** für Daten (lokal oder Cloud)
- **bcryptjs** für Password Hashing
- **React Context** für Auth State

---

## 📋 Implementation Plan

1. ✅ Auth System (JWT + Middleware)
2. ✅ Guest Login (Code-based)
3. ✅ Admin Login (Password-based)
4. ✅ Admin Dashboard
5. ✅ Guest List Management
6. ✅ RSVP Daten mit Auth verknüpfen
7. ✅ Export Functionality

---

## ❓ Fragen für Florian

1. **Wo sollen Daten gespeichert sein?**
   - SQLite (lokal auf Vercel)
   - Supabase/Firebase (Cloud)
   - CSV File (einfach)

2. **Admin Accounts:**
   - Nur du + Natascha? (2 Accounts)
   - Oder auch Trauzeugen? (Frederike + Robert)

3. **Guest Codes Format:**
   - Einfach: `NATASCHA2026` (lesbar)
   - Sicher: `abc123xyz789` (zufällig)
   - QR-Code kompatibel?

4. **Gästeliste:**
   - Hast du schon eine Liste?
   - Oder sollen wir die gemeinsam erstellen?

5. **RSVP Export:**
   - CSV reicht?
   - Oder schönes PDF-Report?
