# Svenska trender – webbgränssnitt

Detta projekt är ett Vite-baserat React/TypeScript-gränssnitt som läser in den exporterade rapportdatan från Excel-filen *Svenska trender 1986–2024*. Layouten efterliknar PDF-versionens vänsternavigering och ton i färger och typografi, men är responsiv och interaktiv.

## Struktur

- `scripts/export_report_data.py` – Python-skriptet som plockar ut alla diagram och strukturerar dem.
- `data/report-data.json` – den exporterade datan. Kopieras vid build till `web-report/public/data/report-data.json`.
- `web-report/src` – React-koden (vänstermeny, huvudytan och Recharts-diagram).

## Daglig uppdatering

1. **Placera årets Excel-fil** (ersätt den gamla `3. Svenska trender 1986-2024.xlsm` eller uppdatera flaggan `--workbook`).
2. **Kör exporten** från repo-roten:
   ```powershell
   python scripts/export_report_data.py --workbook "3. Svenska trender 1986-2024.xlsm"
   ```
   Det skriver om `data/report-data.json` och syncar automatiskt till `web-report/public/data/report-data.json`.
3. **Starta dev-servern** (för förhandsgranskning):
   ```powershell
   cd web-report
   npm install        # Endast första gången
   npm run dev
   ```
4. **Bygg produktion** när du vill publicera:
   ```powershell
   npm run build
   ```
   Output hamnar i `web-report/dist/`. Ladda upp mappen (inklusive `data/report-data.json`) till valfri webbserver eller lägg bakom din CMS-lösning.

## Anpassning

- **Logo**: Lägg den kombinerade logotypen (SOM-institutet och Göteborgs Universitet) som `web-report/public/header-logo.png`. Bilden visas automatiskt i topphuvudet. Om filen saknas döljs logotypen automatiskt utan fel. **Viktigt**: Efter att du lagt till logotypen, starta om dev-servern (`npm run dev`) för att se ändringen.
- **Navigation & färger** styrs i `src/App.css`. Variablerna följer PDF:ens mörka vänsterkolumn och ljusa innehållsytor.
- **Typografi** sätts i `src/index.css` (Inter/Segoe-stack). Ändra till byråns profilfont om ni har licens.
- **Diagram** renderas med [Recharts](https://recharts.org/). Alla serier och årtal kommer direkt från Excel-exporten, så inga hårdkodade värden behövs.
- **Rubrik**: Exporteraren extraherar automatiskt "Rubrik" från varje Excel-ark och använder den som titel i sidofältet och huvudytan. Om "Rubrik" saknas används Excel-arkets namn istället.
- **Fråga & Kommentar**: Exporteraren extraherar automatiskt "Fråga" och "Kommentar" från varje Excel-ark och visar dem under diagrammen. Om dessa fält saknas i Excel döljs de automatiskt.
- **Tabeller**: För att visa en tabell istället för diagram, lägg till en rad i Excel-arket med "Typ" i en cell och "Tabell" i nästa cell. Exporteraren extraherar automatiskt tabell-data när "Typ" = "Tabell". Tabellerna visar endast data (år och värden), inte metadata-rader som "Rubrik", "Fråga", etc.

## Tips

- Vill du lägga rapporten på en annan domän mapp? Uppdatera `fetch('/data/report-data.json')` i `App.tsx` till en absolut URL.
- Stödet för fler diagramtyper finns redan i exporten (line/bar/pie/etc.). Lägg till en enkel komponent-switch i `App.tsx` om du behöver andra visualiseringar.
- Om Excel-strukturen ändras (nya blad, serier) behöver du bara köra exportskriptet igen – frontenden läser allt dynamiskt.
