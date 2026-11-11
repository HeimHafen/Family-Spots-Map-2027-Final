# Verbindlicher Navigationsvertrag – Family Spots Map V5

**Freigabe:** 11. November 2026. Die tatsächliche Live-Abnahme auf iPhone/Safari steht noch aus.

- Fünf Ziele, genau diese Reihenfolge: `Karte · Filter · Spots · Mein Tag · Spots Plus`.
- Karte: orange Umrisskarte, **Beschriftung wie alle anderen in FSM-Braun `#3D2918`**, keine gefüllte aktive Kachel.
- Filter: grüne Regler. Spots: orange Standortmarkierung. Mein Tag: gefülltes grünes Herz. Spots Plus: orange Krone **ganz rechts**.
- Ein gemeinsames cremefarbenes Navigationsband; keine einzelnen Auswahlkästen und keine Einzelschaltflächen-Schatten. Tastaturfokus nur bei `:focus-visible`.
- Dieselben Symbole, Labels, Farben und Reihenfolge auf Start, Filter/Spots-Dialog, Vollbildkarte, Kalender und Tourenwelt.
- **Technische Quelle:** `js/ui/navigation-spec.js` (Reihenfolge und Sprachen), `js/ui/navigation-icons.js` mit `map-toolbar.js` (SVG), `css/fsm-navigation-system.css` (Darstellung). Unterschiedliche Klick-/Speicherlogiken der Bereiche bleiben getrennt.
- **Prüfung:** `node tools/check-navigation-contract.mjs` als GitHub-Actions-Gate. Nach jeder Änderung iPhone-Safari-Ansichten gegen die freigegebene Referenz prüfen.

Nicht aus diesem Vertrag ableiten: eine garantierte App-Store-Freigabe, geprüfte Realgeräte-Darstellung oder produktive Plus-Käufe. Das sind getrennte Abnahmen.
