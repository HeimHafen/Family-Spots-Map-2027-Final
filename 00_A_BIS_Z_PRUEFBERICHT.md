# FAMILY SPOTS MAP V5 – A–Z-Abnahmeprüfung

**Prüfdatum:** 11. November 2026  
**Prüfgrundlage:** vollständig vorliegendes lokales Paket `FSM_V5_NEUES_REPOSITORY_IMPORT.zip` sowie vorhandene freigegebene Designreferenz und letzte fachliche Vorgaben. **Keine direkte Prüfung des (noch nicht erstellten) V5-GitHub-Repositories, keine echte Safari-/TestFlight-Abnahme.**

## Entscheidung

**Web-/GitHub-Repository: technisch vorbereiteter Release Candidate, aber noch keine bestätigte Live-Abnahme.**

**Apple App Store: NO-GO für die unmittelbare Einreichung.** Ein nativer, signierter iOS-Build, vollständige rechtliche Angaben und echte Gerätetests fehlen. Das iOS-Vorbereitungsverzeichnis ist noch kein App-Store-Build.

Das ursprüngliche V4-Neu-Repository wurde **nicht verändert oder gelöscht**. Kein Force Push. Keine unerbetenen neuen Tagespakete, Waldtreffen oder Partnerfunktionen eingebaut.

## 1. Gesamtbestand und Freigabe

| Gegenstand | Ergebnis |
|---|---|
| Dateien im vollständig auditierten Quellpaket | 268 inkl. dieses Berichts |
| Spot-Datensätze | 173; **172 eigenständige Orte** wegen `same_place_as` Travemünde |
| Sprachen | Deutsch, Englisch, Dänisch; je 232 Übersetzungsschlüssel |
| Filterprüfungen | 2.458 erfolgreich |
| Familienradtouren im bestehenden Katalog | 2; Tourenwelt / vier Streckenlängen-Kacheln im UI-Code vorhanden |
| Kartenansicht / Spot-Detailansicht | lokaler Code geprüft; **kein Live-Pixeltest** |
| Windheimstraße | Bolzplätze, Skatepark und Pagalino verknüpft, Designreferenz erhalten |
| Mein Tag und Foto-/Kalender-Backups | Module und Regressionstests erfolgreich; reale iPhone-Wiederherstellung ausstehend |
| Treffen & Spielen | bestehender Pilot; `published_events` ist leer; keine aktive öffentliche Terminplattform |
| Spots Plus | lokale Entwickler-/Demofunktion; **keine sichere Bezahl- oder Partnerberechtigung** |
| Freigegebene Premium-Gestaltung | **bytegenau unverändert** gegenüber dem unmittelbar vorhergehenden V5-Paket – abgesehen von technisch nötigen Versionszeichenfolgen |

## 2. Durchgeführte Qualitätsprüfungen

- Sämtliche vorhandenen JS-Dateien und relevanten Module wurden statisch auf Syntax geprüft; CSS-Dateien wurden mit PostCSS geparst; drei HTML-Sprachversionen und lokale Ressourcenverknüpfungen geprüft.
- `node tools/check-project.mjs`: **0 Fehler**; Daten, Texte, Kategorien, Filter, Backups, Plus-Demozugriffe und Versions-Hashes.
- `node tools/check-release-assets.mjs`: **207** vorhandene lokale Dateiverweise geprüft, einschließlich HTML, Stylesheet-Bildern, Spotfotos, Manifest-Icons und übereinstimmender Release-Kennung.
- `node tools/check-hosting.mjs`: Hosting unter Root und GitHub-Pages-Unterordner, drei Sprachen, **264 Prüfungen** bestanden.
- `node tools/check-v5-scope.mjs`: Projekt-Pfade, drei Sprachen, Windheimstraße, 173 Datensätze, zwei Touren bestanden.
- `node tools/check-update-system.mjs`: Installations-Shell (5 Pflichtdateien), 152 deklarierte Offline-Ressourcen und Update-Vertrag bestanden.
- `node tools/test-update-worker.mjs`: **9/9** simulierte Service-Worker-Fälle bestanden, einschließlich defekter Assets, fehlender Bilder und Abgrenzung zur bisherigen V4-App.
- **70 Rastergrafiken:** Dateiformate/Lesbarkeit geprüft, **0 Defekte**. Bei 23 Bildern sind EXIF-Metadaten vorhanden; in den geprüften EXIF-Feldern wurden **keine GPS-Daten** gefunden. Bildrechte und ggf. weitere Metadaten sind getrennt zu prüfen.
- **Native statische Web-Vorbereitung:** lokaler Kopiervorgang erfolgreich; ein echtes iOS-Projekt oder IPA wurde nicht kompiliert.
- **GitHub-Actions-Ablauf lokal simuliert:** Release `20261111-commit-a1b2c3d4e5f6`, vollständige Tests, **217 öffentliche Dateien**, korrektes `release-info.json`, keine versehentlich veröffentlichten Dateien aus `native-ios/`.

## 3. Präzise Verbesserungen gegenüber vorherigem V5-ZIP

1. Bei **11 Fotos** aus Zinnober, Windheimstraße/Pagalino und Rethen die **tatsächlichen Pixelmaße** im Spotkatalog ergänzt. So reserviert die Galerie beim Laden korrekte Bildproportionen.
2. **5 fehlende Leaflet-Standardgrafiken** ergänzt (`marker-icon`, Retina, Schatten und Ebenenschaltflächen). Die gebrandeten Spotmarker bleiben unverändert.
3. Vorher veraltete Root-Versionsdatei `release-info.json` jetzt automatisch mit der Service-Worker-Version synchronisiert, inklusive beim nächsten Release-Vorbereitungslauf.
4. Den **neuen Dateiverweis- und Bildintegritätscheck** als eigenen verpflichtenden Schritt in GitHub Actions integriert.
5. Eine **native iOS-Vorbereitungsstruktur für Capacitor 8** ergänzt, getrennt von der Webveröffentlichung. Bundle-ID ist ausdrücklich Platzhalter, keine Build-/Review-Freigabe.
6. Die alte App-Store-Roadmap auf aktuelles Zielbild angepasst und eine **verbindliche Design-/Funktions-Abnahmematrix** sowie rechtliche Checkliste ergänzt.

**Besonders wichtig:** Die sechs aktiven HTML-/Stylesheet-/App-/Karten-Dateien sind nach Ersetzung der Versionskennung **inhaltlich exakt identisch** mit dem zuletzt zusammengestellten V5-Projekt. Sämtliche 173 Spotdatensätze sind bis auf die **11 gemessenen Foto-Dimensionspaare** identisch. Das freigegebene Windheimstraßen-Referenzbild ist bytegenau erhalten.

## 4. App-Store-Blocker – nicht durch Tests verschweigen

| Risiko | Erforderliche Maßnahme |
|---|---|
| Kein natives iOS-Projekt/Signatur | Auf Mac/Xcode 26+ Capacitor-Prototyp erzeugen, Bundle-ID und App-Store-Team hinterlegen, reale Tests und TestFlight |
| Apple Guideline 4.2 | Eigenständiger iOS-Nutzwert statt bloßer Website-Hülle nachweisen; funktionales WKWebView auf iPhone prüfen |
| Datenschutz und Impressum | korrekte verantwortliche Person/Anbieterangaben, Datenschutzerklärung **in App und App Store** und Verarbeitung durch Host, Karten, Fotos/Geo klären; im Paket bewusst keine erfundenen Angaben |
| Spots Plus | Lokale Entwicklercode-SHA-256-Datei ist **keine** sichere serverseitige Berechtigung und keine App-Store-konforme Lösung für bezahlte digitale Freischaltungen; ggf. StoreKit/IAP mit Restore |
| Community / Kinder | bei echten öffentlichen von Nutzern erstellten Treffen: Meldewege, Moderation, Sicherheit, Kontakt und Datenschutz vor Aktivierung |
| Kartendaten | OSM-Attribution und Kachelnutzungsregeln prüfen; **keine Offline-Prefetch-Funktion für OSM-Standardtiles** |
| Fotos und Inhalte | Foto-Einwilligungen/Lizenzen, Urheberrechte, Open-Source-Lizenzen, Quellen und reale Aktualität der 173 Datensätze prüfen |
| Gerätedaten | „Mein Tag“/Favoriten aus der alten PWA **exportieren**, anschließend Import, Foto-/ZIP-Backup, iOS-Files/Share, Berechtigungen auf echter Hardware testen |
| Store-Einreichung | App Store Connect-Metadaten, Altersfreigabe, Screenshots, Support-/Kontaktlinks, Review-Demozugang und Apple-Developer-Konto |

Aktuelle Quellen: [Apple App Review Guidelines](https://developer.apple.com/app-store/review/guidelines/), [Apple SDK/Xcode-Mindestanforderungen](https://developer.apple.com/news/upcoming-requirements/), [Capacitor 8 iOS](https://capacitorjs.com/docs/ios), [OSM Tile Usage Policy](https://operations.osmfoundation.org/policies/tiles/).

## 5. Offene Inhaltsangaben

**Quellenlink fehlt bei vier Datensätzen:** `vejby_klit_playground_neerlandiavej`, `plg_wasser_und_sand_lenningen`, `asp_berlin_seilfabrik`, `parkplatz_strandvejen_vrist`.

**Quellenprüfdatum fehlt bei fünf Datensätzen:** `vejby_klit_playground_neerlandiavej`, `plg_wasser_und_sand_lenningen`, `asp_berlin_seilfabrik`, `bolzplatz_festplatz_rethen`, `bolzplatz_uithuizermeedenweg_rethen`.

Bei allen weiteren Spots ist der technische Datenvertrag erfolgreich; die **aktuelle inhaltliche Wahrheit vor Ort** wurde damit nicht garantiert.

## 6. Verbindliche Freigabe vor dem neuen Repository

1. **Die vorherige V4-Neu-Version behalten.** Keine Dateien/Branches löschen; zuerst „Mein Tag“, Fotos und Favoriten über das bestehende Backup sichern.
2. Das **gesamte, separat bereitgestellte A–Z-ZIP** als Stammverzeichnis eines **leeren neuen** Repositories `HeimHafen/Family-Spots-Map-V5` importieren. Nicht die früheren V5-/V4-Reparaturpakete mischen.
3. In GitHub Pages **Source: GitHub Actions**, Branch `main`; nach dem ersten Push auf die Action warten und dann `https://heimhafen.github.io/Family-Spots-Map-V5/release-info.json` auf eine Commit-Version prüfen.
4. **Safari-Abnahme** mit der freigegebenen Windheimstraßen-Referenz, Filter, Tourenwelt (vier Kacheln), Tilla, Navigation, DE/EN/DA und „Mein Tag“/Backup prüfen; **erst dann** die neue PWA als technisch live abgenommen betrachten.
5. Die nativen iOS-Arbeiten bleiben ein **getrennter Schritt**, bis die App-Store-Sperrpunkte nachweislich beseitigt sind.

**Urteil:** Der Repo-Kandidat ist lokal nachprüfbar und deutlich besser abgesichert als das vorherige ZIP. Eine **100%-Garantie für reale Safari-Updates, rechtliche Vollständigkeit oder die Aufnahme in den App Store wäre falsch**. Genau deshalb sind Freigabekriterien, Quellenlücken und ausstehende Gerätetests ausdrücklich dokumentiert.
