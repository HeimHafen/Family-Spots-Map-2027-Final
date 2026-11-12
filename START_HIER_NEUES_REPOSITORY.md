# Family Spots Map 2027

1. GitHub: Unter HeimHafen ein leeres öffentliches Repository erstellen. Vorgeschlagener Name: Family-Spots-Map-2027. README, Lizenz und .gitignore bei der Erstellung weglassen.
2. iPhone: Das vollständige Projekt-ZIP in Dateien laden, teilen und in Working Copy als neues Repository importieren. index.html und .github/workflows/deploy.yml liegen direkt im Stammverzeichnis.
3. Working Copy: Im neuen lokalen Repository alle Dateien auf main committen. Zusammenfassung: „Family Spots Map 2027 – geprüfter Startstand“. Details: „Vollständige App mit einheitlichem Bikepacking-Fahrrad, drei Sprachen und vorbereitetem Pages-Workflow.“
4. Das neue Repository als Remote origin hinzufügen: https://github.com/HeimHafen/Family-Spots-Map-2027.git (bei abweichendem Namen entsprechend ändern). Source-Branch main, vorhandene oder neue Remote-Referenz refs/heads/main, Force Push aus.
5. Auf GitHub im neuen Repository Settings → Pages → Build and deployment → Source → GitHub Actions wählen. Falls der erste Lauf vor der Einrichtung gestartet ist, unter Actions den Workflow „Family Spots Map V5 — überprüfen und veröffentlichen“ auf main erneut starten.
6. Sobald build und deploy grün sind, die URL aus Settings → Pages öffnen. release-info.json an die URL anhängen und repository sowie commit mit dem neuen Repository und dem gepushten Commit vergleichen. Unter Touren → Touren filtern muss Bikepacking ein Fahrrad mit Gepäcktasche zeigen.

Der Workflow setzt die öffentlichen Seitenlinks auf die tatsächliche Pages-Adresse und erzeugt eine Release-Kennung aus dem Commit. Die neue Adresse ist ein eigener App-Pfad. Vorhandene Erinnerungen bei Bedarf in der bisherigen App exportieren und in der neuen App importieren.
