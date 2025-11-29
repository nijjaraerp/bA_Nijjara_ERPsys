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
