# iOS-Vorbereitung – getrennt von der PWA

**Kein App-Store-Build.** Dieses Verzeichnis ist eine Vorbereitung für einen späteren nativen iOS-Prototypen mit Capacitor 8. Die Web-App und das GitHub-Pages-Deployment bleiben unverändert.

Voraussetzungen: macOS, Xcode 26+, Node.js 22+, gültiger Apple-Developer-Zugang. App-ID `de.example.familyspotsmap` ist **ein Platzhalter**, vor einer echten Registrierung ersetzen.

```sh
cd native-ios
npm install
npm run build:web
npx cap add ios
npx cap sync ios
npx cap open ios
```

Der Web-Inhalt wird in `www/` kopiert; `service-worker.js` wird bewusst **nicht** in das native Paket übernommen. In einer nativen App kommen Updates über einen geprüften, signierten App-Store-Build, nicht aus GitHub Pages. Die tatsächlichen Funktionen (Lokalisierung, Geolocation, iOS-Export/Share, Datei-/Fotopicker, Kalender, In-App-Käufe, sichere Backups und VoiceOver) benötigen eigene Tests und ggf. native Adapter. Die Web-App darf nicht einfach unverändert als Website im WebView eingereicht werden (Apple-Richtlinie 4.2).

Vor der Veröffentlichung: Bundle-ID/Team, App-Icons/Launch-Screen, Standortberechtigungstexte, Datenschutz/Impressum, Altersfreigabe, IAP statt Freischaltcodes, Lizenz-/Bildrechte, Community-Sicherheit und TestFlight-Abnahme.

Dokumentation: https://capacitorjs.com/docs/ios und https://developer.apple.com/app-store/review/guidelines/
