# Prüfnachweis – neues Family Spots Map V5 Repository

**Datum:** 11.11.2026  
**Grundlage:** zuletzt vorliegender vollständiger lokaler V4-Neu-Stand inklusive Windheimstraßen-Detailgestaltung, Tourenwelt, einheitlicher Navigation und Update-Reparatur.  
**Neuer Repository-Name:** `HeimHafen/Family-Spots-Map-V5`  
**Altes Repository:** unangetastet; kein Löschen, kein Force Push.

## Bestand und aktuelle Freigabe

- 173 Spot-Datensätze; darunter Bolzplätze Windheimstraße, direkt benachbarter Skatepark und Pagalino-Palettengarten mit realen `related_spot_ids`-Verweisen.
- DE/EN/DA, jeweils 232 durch die App-Prüfung überprüfte Übersetzungsschlüssel.
- 2 vorhandene Familienradtouren im Katalog; die Tourenwelt und die Filter sind integriert.
- Filter-Regressionen: 2.458 erfolgreich geprüfte Bedingungen.
- „Mein Tag“, Fotofunktionen und persönliche Exporte/Backups: vorhandene Module und statische Regressionstests bestanden. Der tatsächliche Speicher auf dem iPhone wurde nicht getestet.
- „Treffen & Spielen“, private Ausflugsplanung, Spots Plus, Tilla und einheitliche Navigation sind im Bestand vorhanden.
- Warme Premium-Gestaltung ohne Dark Mode bleibt unverändert; verbindliche Referenz liegt unter `designfreigaben/`.

## Technische Korrekturen des neuen Repositories

1. Alle Canonical-, Open-Graph-, Sitemap-, Robot-, Daten- und Testadressen auf `Family-Spots-Map-V5` umgestellt. Eine veraltete strukturierte Angabe mit nicht verbindlich bestätigtem Plus-Preis entfernt.
2. **Ein** GitHub-Actions-Workflow statt konkurrierender Veröffentlichungswege. Jeder Commit auf `main` bekommt automatische neue Versionskennung und Datei-Prüfsummen.
3. `release-info.json` als öffentlich abrufbaren Nachweis der tatsächlich bereitgestellten Release-Version eingerichtet.
4. Service Worker: Installation benötigt nur fünf Grunddateien statt zuvor 111. Andere App-Dateien werden online frisch geladen und für Offline-Nutzung nach Möglichkeit gespeichert. Dazugehörige Caches sind pro Repository-Pfad isoliert; die vorherige V4-App wird nicht bereinigt.
5. Der Service Worker versucht bei Netzproblemen auf bereits gültige lokale Kopien zurückzufallen, ohne diese durch fehlgeschlagene Anfragen zu ersetzen. Offene Eingaben bleiben beim automatischen Neuladen durch die bestehende Entwurfsprüfung geschützt.
6. Veralteten V88-Prüfcode nicht in das neue Repository übernommen. Alte historische Daten-Snapshots sind nicht Teil des öffentlichen Pages-Artefakts.

## Prüfungen und Ergebnisse

- `node tools/check-project.mjs`: 173 Spots, DE/EN/DA, 2.458 Filterprüfungen, vollständige Konsistenzprüfungen – **bestanden**.
- `node tools/check-hosting.mjs`: 264 lokale Ressourcenprüfungen, dreisprachige Pages-Subpfade – **bestanden**.
- `node tools/check-v5-scope.mjs`: Hostname, neue URLs, PWA-Scopes, Windheimstraße-Verknüpfungen und Tourenkatalog – **bestanden**.
- `node tools/check-update-system.mjs`: fünf Pflichtdateien, 152 Offline-Ressourcen, Versionscheck, Schutz offener Entwürfe – **bestanden**.
- `node tools/test-update-worker.mjs`: **9 von 9** simulierten Aktualisierungs-/Fehlerfällen bestanden.
- 64 Rasterbilder geprüft, 6 SVG-Dateien als XML geprüft, 19 JSON/Webmanifest-Dateien geparst – **keine Formatfehler**.
- GitHub-Actions-Build in einer separaten Arbeitskopie simuliert: Commit-Version `20261111-commit-a1b2c3d4e5f6`, **95** kontrollierte SHA-256-Prüfsummen, **212** öffentliche Dateien, **152/152** Offline-Ressourcen im Ausgabeverzeichnis – **bestanden**.
- ZIP-Archivintegrität und Verzeichnisstruktur werden bei der Archivierung separat geprüft.

## Offen / bewusst nicht behauptet

- Vier Spots haben weiterhin keinen `source_urls`-Eintrag; bei fünf Spots fehlt `source_checked_at`. Diese Angaben dürfen nicht geraten werden und brauchen reale Recherche.
- Die Inhalte/Öffnungszeiten aller 173 realen Ausflugsorte wurden in diesem Durchlauf **nicht vor Ort überprüft**.
- Eine echte Safari-/iPhone-Probe war hier nicht möglich. Der lokale Browser versagte den Zugriff aufgrund einer administrativen Sperre (`ERR_BLOCKED_BY_ADMINISTRATOR`). Daher ist eine pixelgenaue Live-Garantie unzulässig.
- Das neue GitHub-Repository ist **noch nicht** angelegt; damit sind dessen GitHub Pages-Einstellungen, tatsächliche Action-Logs und die öffentliche URL **noch nicht live geprüft**.
- Nicht freigegeben oder nicht vollständig umgesetzt: neue „Gemeinsam los“-Tagespakete, Waldtipi-Treffen, Kommunalpartnerschaften mit serverseitiger Codeverwaltung. Diese sind Ideen/Später-Aufgaben, keine versprochenen Live-Funktionen.
- Statische Partnercodes/Plus-Logik sind keine sichere serverseitige Abrechnung oder Authentifizierung. Die öffentliche App darf keine vertraulichen Codes/privaten Daten enthalten.
- `Mein Tag` und persönliche Bilder liegen potenziell in lokalem Browser-/PWA-Speicher. Vor dem Wechsel muss ein App-interner Datenexport erfolgen, weil der Umzug in eine neue PWA-Installation nicht garantiert ist.

## Abnahme nach erstem Push

1. GitHub Pages Source im neuen Repository auf **GitHub Actions** einstellen.
2. Erfolgreichen Deploy-Workflow mit grünem Haken prüfen.
3. `https://heimhafen.github.io/Family-Spots-Map-V5/release-info.json` auf Commit-Kennung prüfen.
4. Neue Webseite frisch im Safari öffnen, DE/EN/DA, Spot Windheimstraße, Tourenwelt und „Mein Tag“ prüfen.
5. Vor dem Verwerfen eines alten Home-Screen-Icons unbedingt Export und Fotosicherung bestätigen; altes Repository nicht löschen.
