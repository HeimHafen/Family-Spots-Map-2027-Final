# Family Spots Map – verbindliche V5-Abnahmebasis

**Produktleitgedanke:** Orte entdecken. Menschen verbinden. Erinnerungen schaffen.

Die Karte bleibt visuelles Zentrum und Startpunkt. Ziel ist eine hochwertige, ruhige und warme Familien-App, keine überladene Social-Plattform. Keine unbestätigten neuen Funktionen.

## Freigegebene visuelle Leitlinien

- Heller Premium-Auftritt, Creme/Sand, Dunkelbraun/Taupe, Salbei/Oliv und warmes Orange; **kein Dark Mode**.
- Tilla und gemeinsamer Landschafts-Header; kompakt, obere Schwingung, unten gerader Übergang zur Karte, dreizeiliger Leitsatz.
- Einheitliche, flache Navigationsleiste **Karte · Filter · Spots · Mein Tag · Spots Plus**, **ohne Aktivhintergrund**, alle fünf Labels im gleichen FSM-Braun. Treffen & Spielen bleibt im Menü/Spot, nicht in der unteren Leiste.
- Orange Hauptaktionen mit brauner Schrift/Symbolik, grüne sekundäre Aktionen, konturierte Info-Icons und einheitliche Schließen-X; markante Features nicht durch neue Designs ersetzen.
- Wiedererkennbares **gefülltes grünes Herz** in Navigation/Spotkarten. Keine frühere Herz-Neuinterpretation.
- 44-px-Aktionshöhen als Richtgröße, barrierefreie Ziele ohne dominierende Kästen; die tatsächliche iPhone-Rendergröße bleibt auf dem Gerät zu testen.
- Spotdetails Windheimstraße: brauner Serifentitel, orangener „Treffen & Spiele ansehen“-Button, grüner „Ausflug privat planen“-Button, „Bilder ansehen“, „Direkt daneben“ mit Skatepark und Pagalino, Parken & Fußweg. Freigegebenes Bild in `designfreigaben/`.
- Tourenwelt: vier Streckenlängen-Kacheln, cremefarbener Filterdialog, braune Beschriftung „Touren anzeigen“; Öffnen von Familienradtouren **ohne ungewolltes Filter-Pop-up**.
- Filter: korrekte, übersetzte Kategorien und Unterkategorien; Wasserbezeichnungen konsistent, 2.458 Vertrags-/Regressionstests.

## Vorhandene Funktionen – kein vollständiger Gerätetest

- 173 Spot-Datensätze für **172 eigenständige Orte** (ein `same_place_as`-Paar in Travemünde); Spot-Verknüpfungen, Kategorien, Fotos, Parkplatz-/Fußweginfos und externe Navigation.
- DE/EN/DA; Tourenwelt mit zwei vorhandenen Touren; Filter, Favoriten, Mein Tag/Fotos/ZIP-Backup; private Ausflugsplanung; Treffen & Spielen als bestehende Pilot-/Vorschaufunktion; Spots Plus als **nicht bezahlte Entwicklerfunktion**.
- Aktive PWA mit GitHub-Actions-Release, 5-Dateien-Installations-Shell, online-first und Offline-Rückfall. Kartentiles von OSM dürfen nicht zur Offline-Flächenkarte vorab geladen werden.

## Bewusst nicht behauptet / nicht stillschweigend eingebaut

- „Gemeinsam los“-Tagespakete, zusätzliche Waldtipi-Treffen, kommunale Partnerabos: Ideen, keine freigegebenen fertigen Module.
- Keine reale öffentliche Community-Termin-Datenbank oder sicherer Zahlungs-/Partnerserver.
- Keine native App-Store-Binärdatei, kein fertiger iOS-Kauf, keine Safari- oder TestFlight-Abnahme.

Änderungen am Design dürfen erst nach Bild-/Geräteabnahme und ggf. gesonderter Freigabe in `main` erfolgen.
