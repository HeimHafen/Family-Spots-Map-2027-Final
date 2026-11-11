# Family Spots Map V5 – verbindliche Qualitätsmatrix 11.11.2026

## Ziel
Orte entdecken. Menschen verbinden. Erinnerungen schaffen. Karte bleibt die Bühne; keine überladene Social-App.

## In diesem Update umgesetzt (ausgehend von V5 NAV)
- Navigation: unverändert **Karte / Filter / Spots / Mein Tag / Spots Plus**; Karte orange als Symbol, **alle Texte dunkelbraun**, kein Aktivkasten.
- Schattenhierarchie: gezielt deutlicher nur für Orange-Hauptaktionen; Grün sekundär; Karten zurückhaltend; Nav-Items flach.
- Filter: Theme-Kacheln ohne automatische Silbentrennung, auch auf schmalen Displays.
- Spotliste: zuschaltbare kompakte Übersicht; Details, Favoriten und Kartenaktionen bleiben erreichbar.
- Kalender: „Heute“ bezeichnet nur das ausgewählte heutige Datum; auf anderen Tagen ist der Sprung korrekt „Zu heute“ (DE/EN/DA).
- Tourenwelt: bestehende Touren und explizit als Entwurf gekennzeichnete Planung bleiben erhalten; gezielte typografische Politur und Aktionsschatten.
- Startseite/Tilla: sehr kleine Abstandsstraffung, keine Änderung der Bild- oder Header-Assets.
- Mein Tag, Spotdetails, Treffen & Spielen, Plus-Dialoge und Über-Seite: dieselbe zurückhaltende Karten-/Dialog-/Schattensprache, ohne Daten- oder Backendänderung.
- Update: neue CSS-Datei im Offline-Manifest, alle Release-Kennungen und Hashes zusammengeführt; zusätzlicher CI-Test.

## Vor Live verbindlich kontrollieren
- iPhone Safari 320 / 375 / 390 / 430 CSS-Pixel, Querformat und größere Schrift; Tastatur/VoiceOver.
- Hauptkarte, Vollbildkarte, Tourenwelt, Kalender, Spots, Plus und Mein Tag: fünf Symbole gleiche Reihenfolge, kein farbiger Auswahlkasten.
- Primärer Schatten muss auch unter Tillas orangefarbener Pseudo-Buttonfläche sichtbar sein, ohne doppelte Schattenkante.
- Filterbegriffe dürfen bei normalen Geräten nicht mitten im Wort gebrochen werden.
- Spotliste: „Kompakte Ansicht“ und „Ausführliche Ansicht“ umschalten; alle Buttons weiterhin bedienen; kein Verlust von Favoriten.
- Kalender: fremder Tag zeigt „Zu heute“, heutiger Tag „Heute“. Auswahl und Erinnerungsspeicherung testen.
- Rückkehr aus Dialogen, Deep Links, Suche und Wechsel DE/EN/DA.
- Daten/Erinnerungen auf dem Gerät mit vorhandener Exportfunktion separat sichern; keine PWA-Domain wechseln.

## Verbindlich offen – nicht als fertig verkaufen
1. App Store: natives iOS-Build/Signing, TestFlight, VoiceOver-/Geräteabnahme, Datenschutz-/Impressumsangaben sowie Apple-konforme Plus-Zahlungen.
2. Plus/Partnerzugänge: Entwicklungsmodus, keine produktionsreife Serverprüfung oder Bezahlschnittstelle.
3. Tourenwelt: privater Entwurf **ohne** Routing oder Navigation. Kein Routenalgorithmus erfunden.
4. Community: keine echte geprüfte öffentliche Terminplattform; keine öffentlichen Kinderprofile.
5. Spot-Kuration: vier fehlende Quellenlinks und fünf fehlende Quellenprüfdaten im letzten Audit; vor Verifikation nicht mit erfundenen Daten schließen.
6. Neue Tagespakete, Waldtipis, Partnerangebote sind Ideen; ohne Funktionsfreigabe und Datengrundlage nicht neu eingebaut.
7. Live-GitHub/Safari: Browserstart in dieser Laufzeit blockiert. Daher **keine** behauptete Pixel- oder Gerätefreigabe.

## Entwicklungsregel
Designreferenzen nicht ersetzen. Zuerst Backup, dann branchweise testen, erst nach echten Live-Screenshots committen/pushen; Force Push aus.
