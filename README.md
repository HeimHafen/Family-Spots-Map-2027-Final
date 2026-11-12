# BLOCKWELT V27 – Netherfestung auf der Großen Wiese

## Status: TESTVERSION – WebGL/iPhone-Abnahme ausstehend

Die Netherfestung ist **echte Spielgeometrie**, keine als Kulisse eingeblendete Grafik. Sie basiert auf Blockwelt V26 mit getrennten Welten. Die generierte Festung lehnt sich gestalterisch an die gezeigte fantastische Netherfestungs-Vorlage an. Eine **pixelgenaue 1:1-Übereinstimmung mit der KI-Konzeptgrafik ist nicht gegeben**: Beleuchtung, Modellkomplexität und Texturqualität bleiben durch die aktuelle Blockwelt-Engine begrenzt.

### Inhalt

- Zwei Welten bleiben vorhanden: Abenteuerwelt und Große Wiese.
- Auf der **Großen Wiese** steht eine gewaltige Netherfestung (Außenabmessungen etwa **149 × 79 Felder**, höchster Block auf Höhe **52**).
- Großer, breiter Zugang mit begehbaren Stufen, Haupttor, Innenhof, Bergfried, mehreren Etagen, seitlichen Wehrgängen, erhöhten Verbindungsbrücken, sechs Türmen und Aussichtsplattform.
- Eigens generierte, dunkle Netherziegel, Dunkelstein, dunkle Zierränder, Wappengold und Glutstein. Alles sind bearbeitbare Spielblöcke; eigene Texturen, keine Minecraft-Dateien.
- **Schnellreise** „🔥 Zur Netherfestung reisen“ im Menü der Großen Wiese.
- Die Festung erscheint bereits aus der Entfernung als vereinfachtes, sparsam gerendertes Modell und wechselt beim Herankommen zu den echten, texturierten Blöcken.
- Im Baumaterialmenü stehen fünf neue Nether-Blöcke zur Auswahl.
- Der Bauplan ist deterministisch und wird bei Bedarf in 16×16-Chunks gestreamt, nicht als tausende einzelne separate Meshes erstellt.
- 40.000+ feste Voxel an circa 38 Chunkpositionen. Die exakte Zahl steht in der technischen Geometrieprüfung.

### Schutz der vorhandenen Welten

- Die Abenteuerwelt wurde in Terrain- und Bau-Generator, alten Save-Schlüsseln und Werkstattfunktionen gegenüber V26 **nicht verändert**.
- Der vorhandene Wiesen-Speicherschlüssel bleibt `blockwelt-grosse-wiese-v26`.
- Die Festung wird **vor** eigenen gesetzten/abgebauten Blöcken erzeugt. Eigene Änderungen haben deshalb Vorrang und werden weiterhin gespeichert.
- Falls du vorher mitten in der späteren Festungsfläche selbst gebaut hast, kann die neue Festung um die alten Bauwerke herum erscheinen. **Bitte vorher beide Welten sichern.**
- Bestehende Wiesen-Sicherungen mit `version: 8, world: 'wiese'` bleiben importierbar; die fünf neuen Materialien werden vom Import erkannt.

### Bedienung

1. Spiel öffnen, im Menü „Große Wiese“ wählen.
2. „🔥 Zur Netherfestung reisen“ drücken, danach den Spielstart.
3. Dem breiten Weg und der Treppe zum Haupttor folgen.
4. Durch den Innenhof zum Bergfried gehen; der westliche Treppenaufgang führt auf den ersten Wehrgang und weiter nach oben.
5. Mit „Abbauen“ und „Setzen“ kannst du die Festung nach eigenen Vorstellungen verändern. Nutze den Flugmodus zum freien Betrachten, für den Hauptweg ist er nicht notwendig.
6. Bei schwächeren Geräten „Grafik: Flüssig“ aktivieren. Die Sichtweite im Test kann dabei geringer sein, die Blockwelt und Bauwerke bleiben dieselben.

### Technische Prüfung

- JavaScript-Syntax kontrolliert.
- Originalfunktionen für Terrain, Dörfer, Sehenswürdigkeiten, Welt-Aufbau, Laden und Speichern gegen V26 unverändert.
- Eigenständige 3D-Block-Wegsuche: von der Wiese durch das Tor und den Hof, in den Bergfried, auf den oberen Wehrgang, auf die Dachterrasse, bis zum Turmdach sowie in beide vorderen und beide Außen-Türme.
- Gemeinsame Geometrie an Chunkgrenzen; alle Festungsblöcke innerhalb der 192×192-Welt und unter y=70.
- IDs der HTML-Steuerung und Syntax geprüft.
- Darstellung des Menüs bei drei Bildschirmgrößen (375×667, 393×852, 844×390) kontrolliert.
- Alternative 3D-Codeansichten erstellt (keine echten Safari-/Three.js-Screenshots).

**Noch nicht geprüft:** End-to-End-WebGL-Rendering mit Three.js im Browser, iOS-Safari-Framerate, längerfristige Speicherbelastung auf dem Handy, exakte visuelle Entsprechung des Konzeptbildes. V27 deshalb bitte zunächst in einem **separaten Testbranch** testen und noch nicht als fertige Premium-Version veröffentlichen.

### Dateien

- `index.html` – Startmenü, Weltenwahl, Bauen und Schnellreise
- `styles.css` – Spieloberfläche, Buttons und neue Material-Symbole
- `game.js` – Welten, Bauplan, Rendering, Wegbegehbarkeit, Materialien und Spielstandlogik
- `README.md` – diese Anleitung

### GitHub-Commit

**Zusammenfassung:** `Blockwelt V27 – begehbare Netherfestung auf der Großen Wiese (Test)`

**Remote-Referenz für Working Copy:** `refs/heads/test/blockwelt-v27-netherfestung`

**Force Push:** Aus
