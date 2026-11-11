# V5 – Technische Konsolidierung, Schritt 1

Erster Architektur-Schritt statt weiterer CSS-Überlagerungen: Die Navigation bezieht Reihenfolge, Übersetzungen und SVGs aus gemeinsam genutzten Modulen. Alte navigationsbezogene Override-Blöcke wurden aus `fsm-spot-unity.css` entfernt. Ein abschließendes Navigationsstylesheet ist jetzt die einzige verbindliche Stelle für Farben und aktiven Zustand. GitHub Actions verhindert erneut auseinanderlaufende Dateien.

**Nicht verändert:** 173 Spot-Datensätze, Bilder, private Speicherung, Tourenplanung, Kalenderdaten, Plus-Berechtigungen, Spot-Detailfreigabe.

**Offen:** echte iOS/Safari-Geräteprüfung, komplette Konsolidierung der historischen CSS-Schichten, App-Store-Datenschutz/Native/Plus-Abnahme. Diese Fassung ist eine professionelle, überprüfbare Teilkonsolidierung – keine endgültige App-Store-Freigabe.
