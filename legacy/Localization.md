<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&family=Noto+Sans+Arabic:wght@400;600;700&display=swap" rel="stylesheet">
<style>
  html, body { font-family: "Inter","Noto Sans Arabic",system-ui,-apple-system,"Segoe UI",Roboto,Arial,sans-serif; line-height: 1.65; font-size: 16px; color: #1d1d1f; }
  h1,h2,h3,h4,h5,h6 { font-weight: 700; letter-spacing: 0.2px; }
  code, pre { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono","Courier New", monospace; font-size: 0.95em; }
</style>

# Localization Policy

## Overview
This project enforces English-only display for Google Sheets UI while preserving full Arabic support in ERP core (Row 2 labels, engines, and data flows).

## UI Language Separation
- Sheets UI Language: English (`ERP_UI_LANG=EN`)
- Backend/Core Language: Arabic remains unchanged for display metadata and processing.

## Implementation
- Property `ERP_UI_LANG` controls menu strings; default is `EN`.
- `onOpen` calls `enforceEnglishUi_()` and builds menu via `getUiStrings_()`.
- Dialog titles and messages use English strings from `getUiStrings_()`.

## Testing Procedures
- Open the spreadsheet; confirm menu labels are English.
- Run each menu item; confirm dialogs are English.
- Verify `getViewData` still returns Arabic headers from Row 2.
- Ensure no changes to data processing or engines.

## Separation Boundaries
- UI strings (menu, alerts) are isolated in `getUiStrings_()`.
- Row 2 Arabic labels and engine tabs (`ENG_*`) remain untouched.

## Notes
- Keep all API contracts and data formats unchanged.
