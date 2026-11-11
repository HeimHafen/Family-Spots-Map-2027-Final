# Family Spots Map V5

**Orte entdecken. Menschen verbinden. Erinnerungen schaffen.**

Neu aufgebautes eigenständiges Repository auf Grundlage des freigegebenen Family-Spots-Map-V4-Projektstands vom 11.11.2026. Der Quellcode, die Daten und das Design werden vollständig in diesem Repository gepflegt; frühere Repositories werden nicht benötigt und bleiben unverändert.

## Erreichbarkeit nach der Veröffentlichung

- Website: https://heimhafen.github.io/Family-Spots-Map-V5/
- Quellcode: https://github.com/HeimHafen/Family-Spots-Map-V5
- Versionsnachweis: https://heimhafen.github.io/Family-Spots-Map-V5/release-info.json
- Sprachen: Deutsch (`/`), Englisch (`/en/`), Dänisch (`/da/`)

## Verbindlicher Funktionsstand

173 Spotdatensätze; Filterlogik mit 2.458 verifizierten Prüfungen; Kartenansicht; Tourenwelt und Familienradtouren; Spot-Detailansichten (einschließlich Windheimstraße / „Direkt daneben“); Treffen & Spielen; private Ausflugsplanung; Mein Tag, Erinnerungen und lokale Foto-/Backup-Funktionen; Spots Plus (lokale Demofunktion, keine serverseitige Zugangsprüfung); Tilla; dreisprachige Oberfläche; warmes Premium-Design ohne Dark Mode.

Die neuen **Tagesideen/„Gemeinsam los“**, zusätzliche Waldtreffen und kommunale Partnerverträge sind **Ideen**, keine als fertig behaupteten Funktionen.

## Erstveröffentlichung – genau einmal einrichten

1. Auf GitHub ein **leeres öffentliches** Repository mit exakt dem Namen `Family-Spots-Map-V5` unter `HeimHafen` erstellen. **Kein README, keine Lizenz, kein .gitignore** automatisch erzeugen.
2. Alle Dateien und Ordner dieses ZIP **direkt in das Stammverzeichnis** des neuen Repositories importieren (nicht als zusätzlichen Ordner). Insbesondere `.github/workflows/deploy.yml`, `.nojekyll`, `index.html`, `service-worker.js`, `assets`, `css`, `data`, `en`, `da`, `js` und `vendor` müssen auf oberster Ebene liegen.
3. In GitHub **Settings → Pages → Build and deployment → Source: GitHub Actions** einstellen.
4. In Working Copy `main` auf `refs/heads/main` des **neuen** Remote pushen. Force Push **aus**. Der Workflow prüft die App und veröffentlicht sie automatisch. Falls Pages erst nach dem ersten Push aktiviert wird, `Actions → Family Spots Map V5 — überprüfen und veröffentlichen → Run workflow` auf `main` ausführen.
5. Unter `https://heimhafen.github.io/Family-Spots-Map-V5/release-info.json` muss dann eine Kennung vom Typ `YYYYMMDD-commit-xxxxxxxxxxxx` erscheinen. Erst dann ist das **GitHub-Release** bestätigt.

Bei jedem späteren Push auf `main` erstellt GitHub Actions selbst eine neue zusammenhängende Release-Version. **Keine manuellen Versionsänderungen, keine Cache-Löschung und keine Ersatz-TXT-Dateien nötig.**

## Persönliche Daten sichern

Die Inhalte unter „Mein Tag“, Fotos und Favoriten können im Browser/App-Speicher liegen; sie werden **nicht mit dem GitHub-Repository übertragen**. Vor der Umstellung die App-eigenen Export-/Backup-Funktionen verwenden. Die neue App hat eine andere URL/PWA-Scope; ein automatischer Umzug persönlicher Daten ist nicht zugesichert.

## Qualitätsprüfungen

```sh
node tools/prepare-release.mjs 20261111-v5-bootstrap-1  # bei Initialkopie bereits ausgeführt
node tools/check-project.mjs
node tools/check-update-system.mjs
node tools/check-hosting.mjs
```

Während der GitHub-Action wird die Version automatisch aus dem Commit abgeleitet. Bei Änderungen an appweiten CSS/JS-Elementen erscheinen korrespondierende Prüfsummen im generierten Service Worker; fehlerhafte Releases werden nicht veröffentlicht.

## Update-Verhalten

Der Service Worker blockiert einen Versionswechsel nur bei fehlenden **fünf grundlegenden HTML-/Manifest-Dateien**; optionales Spotmaterial behindert keine Installation mehr. App-Dateien werden bei Netzverbindung zuerst vom Server geladen; Offline-Kopien dienen als Rückfall. Ein neuer Service Worker kann sicher übernehmen, und offene ungespeicherte „Mein Tag“-Entwürfe sollen vor dem Neuladen geschützt bleiben.

**Wichtig:** Dieser Code ist lokal geprüft; ein erfolgreicher GitHub-Pages-Release und das Verhalten auf dem echten iPhone müssen nach der Einrichtung einmal anhand der Versionsdatei und einer Safari-Probe bestätigt werden.

**Prüfdetails:** `PRUEFBERICHT_20261111.md` – einschließlich dokumentierter Einschränkungen, offener Quellenprüfungen und Freigabebedingungen.

**Offizielle Working-Copy-Importanleitung:** https://workingcopy.app/manual.html – ZIP kann über die Teilen-Funktion als neues Repository importiert werden.

## Ergänzende Qualitäts- und iOS-Abnahmedokumente (11.11.2026)

- `V5_FREIGABE_DESIGN_UND_FUNKTIONEN.md`: Verbindlicher aktueller UX-Stand und unveränderte Designziele.
- `APP_STORE_FREIGABEMATRIX_20261111.md`: App-Store-Readiness mit ausdrücklich offenem NO-GO; nicht mit der Web-Freigabe verwechseln.
- `RECHTLICHE_DATEN_VOR_APP_STORE.md`: erforderliche echte Angaben vor einer Store-Veröffentlichung.
- `native-ios/`: Getrennte Capacitor-8-Vorbereitung, noch kein signiertes iOS-Projekt.
- `tools/check-release-assets.mjs`: zusätzliche Integritätsprüfung (Dateiverweise, CSS-Bilder, Spotfotos, PWA-Icons).

**Hinweis:** 173 Datensätze entsprechen wegen eines dokumentierten `same_place_as`-Paares 172 eigenständigen Orten. Die aktuelle Web-PWA darf nicht als bereits App-Store-zugelassen bezeichnet werden.
