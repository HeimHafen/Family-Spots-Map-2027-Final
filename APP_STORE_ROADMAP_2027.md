# Family Spots Map – Weg in den Apple App Store

**Aktualisiert 11.11.2026.** Ziel 2027, aber keine App-Store-Freigabe zum heutigen Datum.

**Grundprinzip:** Eine App, die Familien von der Karte zu realen Erlebnissen führt, nicht bloß eine Web-Ansicht und keine überladene Social-App. Die Web-PWA mit DE/EN/DA bleibt eigenständig; ein natives iOS-Projekt wird getrennt vorbereitet.

## Phasen

1. **Web-Freigabe:** 173 Spotdatensätze, Filter, Tourenwelt, Mein Tag, Plus-Demo, Treffen & Spielen als Pilot und Premium-Design gegen echte iPhone-/Safari-Referenzbilder testen. GitHub Pages auf `main` ausschließlich über Actions.
2. **Qualität:** Offline-Rückfall, Kartenkacheln/OSM-Nutzungsbedingungen, echte Daten-/Foto-Backup-Wiederherstellung, Quellenprüfungen, Kontraste, 44px-Touchziele und VoiceOver. Keine weiteren Features auf Verdacht hinzufügen.
3. **Native iOS-Entwicklung:** Capacitor 8 mit Xcode 26+, iOS-15+-Deployment, eigener Bundle-ID und signiertem Projekt. Vorbereitendes Gerüst unter `native-ios/`. Alle Browser-Funktionen müssen bei Kamera/Dateien/Geolocation/Kalender im echten WKWebView neu getestet werden.
4. **Sicherheit und Recht:** reale Datenschutzerklärung/Impressum, Copyright/Fotoeinwilligung, Store-Metadaten, Community-Meldemechanismen, Plus-Backend und Apple-konforme Käufe. Der vorhandene Entwicklercode ist keine Produktionsberechtigung.
5. **TestFlight/Store:** Live-Gerätetests und Barrierefreiheit, Bugfixes, App Store Connect, Screenshots, Review-Demo, Altersfreigabe, Veröffentlichung erst nach bestandenem Freigabegate.

**Nicht tun:** V4-Vergangenheit löschen, ungetestete Styles/Panels neu erfinden, Erinnerungen ungesichert migrieren, native iOS-Dateien im laufenden Web-Release veröffentlichen oder mit einem unbelegten „garantiert App-Store-fähig“ werben.

Detailnachweise und Blocker: `APP_STORE_FREIGABEMATRIX_20261111.md`.
