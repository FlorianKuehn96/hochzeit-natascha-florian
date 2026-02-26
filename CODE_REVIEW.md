# Code Review & Optimierungen - Hochzeit Website

## 🔍 Gefundene Issues

### 🔴 KRITISCH
1. **RSVP Form speichert Daten nicht** (RSVP.tsx:20)
   - Form submittet, aber Daten gehen verloren
   - Keine Backend-Integration
   - Keine Validierung

2. **Trauzeugen-Kontakte sind Platzhalter** (Location.tsx:119-140)
   - E-Mail Adressen sind: frederike@natascha-florian-hochzeit.de (unrealistisch)
   - Müssen mit echten Kontakten ausgetauscht werden

### 🟡 WICHTIG
1. **Keine Error Handling** 
   - Gallery Bilder haben keine Fehlerbehandlung
   - Kaputte Bilder-Links zeigen leere Boxes

2. **Accessibility Issues**
   - Navigation Links haben keine aria-labels
   - Buttons ohne Keyboard-Navigation auf Mobile-Menu
   - Lightbox nicht mit Tastatur navigierbar

3. **Performance**
   - Gallery lädt 14 Bilder unkomprimiert
   - Keine next/image Optimierung
   - 16MB wedding-website.zip im Repo (sollte gelöscht werden)

### 🟢 MINOR
1. **Code Quality**
   - Magic numbers (e.g., "2026-09-19T15:00:00", "15. Juli 2026")
   - Keine Konstanten für Datumsangaben
   - Duplizierten Tailwind-Klassen

---

## ✅ Was gut ist
- ✨ Schöner Design & Animations
- 📱 Responsive Layout
- ♿ Grundlegende Struktur OK
- 🎨 Konsistentes Color Scheme
- 🚀 Next.js 15 + TypeScript Best Practices

---

## 🚀 Optimierungen (werden jetzt implementiert)

### 1. Constants extrahieren
- Wedding-Daten zentralisieren
- Konfigurierbar machen

### 2. Gallery Image Optimization
- next/image verwenden
- WebP Format
- Lazy Loading

### 3. RSVP Backend Mock
- localStorage Integration
- Validierung
- Error Handling

### 4. Accessibility Verbesserungen
- ARIA Labels
- Keyboard Navigation
- Focus Management

### 5. Cleanup
- wedding-website.zip löschen
- Typedefs verbessern
