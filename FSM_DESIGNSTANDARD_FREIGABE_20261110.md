# Family Spots Map – verbindlicher Design- und Iconstandard

**Datum:** 10. November 2026  
**Status:** Freigegebener visueller Zielstand; technische Umsetzung als isolierter Integrationskandidat.  
**Referenzbild:** `/Family Spots Map/Designreferenzen/Spotdetails_Windheimstrasse_FREIGABE_BRAUNES_ICON_2026-11-10.png`  
**SHA-256 des Referenzbildes:** `a46fc800b63ee7b123a7dce7588dd3c6544e52e6bc4550d9c741ec2dd4c686bd`

## Unveränderliche Designvorgaben

- Warme, ruhige Cremeflächen. Keine neuen dekorativen Pflanzen oder überflüssigen Rahmen.
- Hauptaktion orange mit **dunkelbrauner Beschriftung und dunkelbraunem Personensymbol**.
- Sekundäraktion helloliv mit dunkelgrünem Kalendersymbol und Text.
- Der Fotobutton bleibt leicht und unaufdringlich mit **braunem Kamera-Icon**.
- „Direkt daneben“ erhält ausschließlich einen orangefarbenen Standort-Pin. Einzelne Spots darunter erhalten grüne, inhaltlich passende Piktogramme.
- „Parken & Fußweg“: gedämpft-blauer runder Parkplatzmarker mit weißem **P**; Blau bleibt ein sachliches Verkehrssymbol, keine weitere Hauptfarbe.
- Navigation: Karte (oranges Symbol, brauner Text, kein Aktivkasten), Filter (grünes Regler-Icon), Spots (oranger Pin), Mein Tag (gefülltes grünes Herz), Spots Plus (orange Krone). Reihenfolge und Abstände unverändert.
- Kein alternativer Dark Mode; keine Änderungen an Speicherung, Tracking, Routen, Favoriten oder Offline-Datenlogik.

## Design-Tokens in der technischen Testfassung

| Rolle | Token | Wert |
| --- | --- | --- |
| Dunkelbrauner Standardtext | `--fsm-unit-ink` | `#3D2918` |
| Zurückhaltender Sekundärtext | `--fsm-unit-ink-soft` | `#665746` |
| Papierfläche | `--fsm-unit-paper` | `#FFFAF2` |
| Feine Linien | `--fsm-unit-line` | `#E1D3BE` |
| Orange Hauptaktion | `--fsm-unit-orange` | `#F58B20` |
| Orange Karten-Auswahl | `--fsm-unit-orange-strong` | `#FF880B` |
| Grün Kategorien | `--fsm-unit-green` | `#2F632B` |
| Grün hinterlegte Sekundärfläche | `--fsm-unit-green-soft` | `#EBF0DF` |
| Gedämpftes Parkblau | `--fsm-unit-blue-parking` | `#4F90B7` |
| Einheitliche Bedienflächen | `--fsm-unit-target` | `44px` |
| Standard-Piktogramme | `--fsm-unit-icon` | `20px` |
| Abstandsraster | `--fsm-unit-space-1/2/3/4/6` | `4/8/12/16/24px` |
| Rundung Hauptbuttons | `--fsm-unit-radius-button` | `14px` |
| Rundung Inhaltsgruppen | `--fsm-unit-radius-section` | `16px` |

Die Werte sind technische Design-Tokens für die Annäherung an die freigegebene Referenz, keine unbewiesene pixelgenaue Farbmessung des Renderings.

## Gemeinsamer Icon-Satz

Die einzige Quelle für Kategorie-/Spotart-Piktogramme ist `js/ui/category-icons.js` (`categoryIcon`). Filter, Spot-Karten, Typ-Chips und die benachbarten Spots benutzen die gleichen SVG-Pfade. Für Skatepark und Gemeinschaftsgarten gelten die vom Nutzer freigegebenen Symbole „Rampe“ und „Pflanze“. Das SVG-Koordinatensystem ist 24 × 24, die Konturstärke 1,8, und die Darstellung richtet sich nach dem semantischen Farbtoken.

## Veröffentlichung und Prüfkriterien

- Freigegebenes Bild **unverändert lassen**. Jeder neue Code-Stand muss visuell mit diesem Bild verglichen werden.
- Standardablauf in Working Copy: `refs/heads/main` → `refs/heads/main`; Force Push aus; vor Austausch aktuellen Stand sichern.
- Erst die gewünschte Testfassung prüfen, anschließend Veröffentlichung bewusst entscheiden. Ein lokaler Browsertest ersetzt keinen iPhone-Safari-Test oder Live-GitHub-Abgleich.
- Bei künftigen Updates immer Freigabereferenz, Dateiliste, Versionsnummer und Testbericht mitliefern.
