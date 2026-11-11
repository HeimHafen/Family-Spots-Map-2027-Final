# Family Spots Map – App-Store-Freigabematrix (11.11.2026)

**Ergebnis: NO-GO für eine direkte App-Store-Einreichung.** Das neue Repository ist eine technisch vorbereitete PWA und eine Basis für einen künftigen nativen Prototyp. Ein nativer iOS-Build, TestFlight- und Apple-Freigabe sind nicht enthalten.

| Kriterium | Status | Nachweis / noch nötig |
|---|---|---|
| PWA-Grunddaten, DE/EN/DA, Spots, Filter | lokal bestanden | Projektprüfung; keine echte Nutzer-/Geräteabnahme |
| Einheitliche UI / 44px / VoiceOver | offen | Freigabebild liegt bei; echte Safari/iPhone/iPad-Prüfung erforderlich |
| Offline-Start und Update | teilweise bestanden | 9 SW-Simulationen; kein echter iPhone-Test; externe OSM-Tiles nicht offline; Offline-Erstinstallation mit 5 Shell-Dateien ist **noch keine voll funktionsfähige Offline-App** |
| Native iOS-App | offen | Capacitor-8-Vorbereitung unter `native-ios/`; echte `ios/`-Projektdateien / signierte IPA fehlen |
| Apple 4.2 Mindestfunktion | offen | native Mehrwerte und On-device Review nötig, reine WKWebView-Hülle kann abgelehnt werden |
| Datenschutz + Anbieterkennzeichnung | blockiert | vollständige, echte Kontaktdaten, Rechtsgrundlagen, erreichbare URL und Darstellung in App fehlen; `Lizenz` ist nur technische Notiz |
| Foto-/Karten-/Bibliotheksrechte | blockiert | Lizenz-, Einwilligungs-, Bildrechte, Namens-/Attributionsprüfung aller Medien einschließlich möglicher Kinderfotos |
| Spots Plus / Partnercodes | blockiert | öffentlicher SHA-256-Entwicklercode ist keine Server-Autorisierung; bezahlte digitale Freischaltungen erfordern korrekte IAP-Regeln, Secure Entitlements und ggf. Restore-Käufe |
| Treffen & Spielen | offen | aktuell Vorschau, veröffentlichte Ereignisse leer; reale Veranstaltungen, Jugendschutz/Meldewege/Moderation bei UGC vor Aktivierung prüfen |
| Accounts + Datenspeicherung | offen | kein Accountzwang; Gerätewechsel/Browser-zu-Native-Migration, Backups, Datenlöschung und Kontorechte testen |
| Store-Unterlagen | blockiert | Apple-Developer-Konto, Bundle-ID, Altersfreigabe, Store-Datenschutzangaben, Screenshots, Support-Link und Review-Zugriff |
| iOS-Technik | offen | Xcode 26+ mit aktuellem iOS-SDK, iOS-Geräte/TestFlight; iOS 15+ nach Capacitor-8-Anforderungen; Info.plist-Berechtigungstexte |
| Spotquellen | offen | fehlerfreie Datenstruktur, aber Quellen-/Datums-Lücken und reale Ortsangaben nicht aktuell nachrecherchiert |

**Offizielle Quellen:**
- https://developer.apple.com/app-store/review/guidelines/ (insb. 1.2, 2.1, 3.1, 4.2, 5.1)
- https://developer.apple.com/news/upcoming-requirements/ (Xcode 26 / SDK 26 seit 28.04.2026)
- https://capacitorjs.com/docs/ios (Capacitor 8, Xcode, iOS 15+)
- https://operations.osmfoundation.org/policies/tiles/ (kein Bulk-/Offline-Prefetch von OSM-Tiles)

**Bitte nicht:** Entwicklungscode als echte Partner-/Kaufberechtigung anpreisen, ohne echte Berechtigungsprüfung. Keine fremden oder Kinderfotos ohne Rechtsklärung veröffentlichen. Fehlende Anbieterdaten nicht erfinden.
