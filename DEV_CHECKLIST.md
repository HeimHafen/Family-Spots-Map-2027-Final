# Checkliste für Änderungen an FSM V5

1. Neue Änderung nur in der V5-Arbeitskopie vornehmen.
2. Designreferenz `FSM_DESIGNSTANDARD_FREIGABE_20261110.md` beachten: warmes helles Layout, dezentes Oliv/Orange, ruhige 44-px-Aktionen, keine Dark-Mode-Elemente.
3. Inhaltliche Änderungen an `data/spots.json` gegen Originalquelle und Quellenprüfung kontrollieren. Keine erfundenen Öffnungszeiten oder Zugänglichkeitsangaben.
4. Lokal `node tools/check-project.mjs`, `node tools/check-update-system.mjs` und `node tools/check-hosting.mjs` ausführen, bevor `main` geändert wird.
5. In Working Copy committen; `main` → `origin/main`; Force Push aus.
6. Nach GitHub Actions `release-info.json` mit neuem Commit prüfen; erst dann App in Safari testen.
7. Bei einem Fehlschlag: Actions-Protokoll untersuchen, **nicht** auf Verdacht alte Dateien löschen oder Service-Worker-Versionen manuell ändern.
8. Vor der nächsten Änderung persönliche Eingaben/Fotos ggf. separat in der App exportieren.
