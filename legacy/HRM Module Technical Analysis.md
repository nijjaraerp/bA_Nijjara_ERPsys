<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&family=Noto+Sans+Arabic:wght@400;600;700&display=swap" rel="stylesheet">
<style>
  html, body { font-family: "Inter","Noto Sans Arabic",system-ui,-apple-system,"Segoe UI",Roboto,Arial,sans-serif; line-height: 1.65; font-size: 16px; color: #1d1d1f; }
  h1,h2,h3,h4,h5,h6 { font-weight: 700; letter-spacing: 0.2px; }
  code, pre { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono","Courier New", monospace; font-size: 0.95em; }
</style>

# HRM Module — Technical Analysis and Architecture

Version: Nijjara-OS v1.0
Environment: Google Apps Script (Backend) + HTML/JS (Frontend), Sheet ID `1anq5RkM_vEIyYtMpakE69kXP2XWQkPlxdfYgvmVF3ls`, Script ID `1rbUrcbgaRTdnJUkU_79apv8KaVL9cxILuFZj8eF-DYvXvc7vVHfa1idI`
Dependencies: `google.script.run` bridge, Cairo font (UI), structured IDs `AAA-N`

---

## 1. Code Analysis (HRM)

### Frontend (Dashboard.html)
- HRM app launcher icon and dock item
  - `src/Dashboard.html:788-801` — `#icon-hrm` symbol definition
  - `src/Dashboard.html:1001-1007` — HRM dock element `id="app-hrm"`
- HRM module open and data grid rendering
  - `src/Dashboard.html:1472-1491` — `loadModule("HRM")` calls backend `getModuleData("VIEW_HRM_EMP")`
  - `src/Dashboard.html:1494-1525` — `renderGrid(res)` builds table headers from Row 2 and rows from Row ≥3
- HRM FAB actions and form flow
  - `src/Dashboard.html:1596-1602` — HRM FAB with `add-employee` and `search-employee`
  - `src/Dashboard.html:1779-1783` — `openForm(formId)` backend call
  - `src/Dashboard.html:1527-1594` — `renderForm(res)` builds dynamic form, saves via `saveEngineRecord(res.formId||"FORM_HRM_EMP", payload)` then reloads HRM
- Global state elements and UX wrappers
  - `src/Dashboard.html:1188-1225` — login bridge using `google.script.run.login`
  - `src/Dashboard.html:1234-1255` — clock; `sessionStorage` used for token `erp_token`
  - Window manager and FAB manager provide container UI for views and forms: `src/Dashboard.html:1268-1362`, `1680-1742`

### Backend (Code.js)
- View Engine (HRM Employees)
  - `src/Code.js:242-295` — `getModuleData(viewId)` reads `ENG_Views`, resolves `Source_Sheet`, applies "Row 2" inclusion logic, returns `{ headers, data }`
- Form Engine
  - `src/Code.js:343-378` — `getFormDefinition(formId)` reads `ENG_Forms`, builds fields (type, mandatory, dropdown options via `getDropdownOptions_`)
  - `src/Code.js:380-441` — Dropdown providers from `ENG_Dropdowns` and table sheets; sorted and filtered by `DD_Is_Active`
- Save Engine (writes to HRM_Employees)
  - `src/Code.js:485-632` — `saveEngineRecord(formId, payload)` maps form fields to target columns, validates mandatory, generates structured ID `AAA-N`, writes from Row 3, logs outcomes
- Data layer helpers (row policies and IDs)
  - `src/Code.js:191-197` — `insertRowByHeaders_` writes at `max(3, lastRow+1)`
  - `src/Code.js:212-239` — `generateStructuredIdForColumn_` builds `AAA-N` per sheet module
  - `src/Code.js:218-220` — `isValidStructuredId_` regex validator
- Logging
  - `src/Code.js:9-39` — `appendDebugRow` + `logInfo_/logWarn_/logError_` wired into login/logout/save

Notes: The specific HRM configuration for `VIEW_HRM_EMP` and `FORM_HRM_EMP` is defined in Sheets and seeded via `src/Setup.js:737-746` (views) and `src/Setup.js:775-842` (forms).

---

## 2. System Architecture (Frontend ↔ Backend)

### Data Flow
1. User clicks HRM dock → Frontend `loadModule("HRM")` → Backend `getModuleData("VIEW_HRM_EMP")`
2. Backend reads `ENG_Views` to resolve HRM source (`HRM_Employees`), applies Row 2 inclusion, returns headers (Arabic) + data rows
3. Frontend renders grid from response
4. User triggers add-employee via FAB → Frontend `openForm("FORM_HRM_EMP")` → Backend `getFormDefinition`
5. Backend builds field schema from `ENG_Forms`, enriches dropdowns via `ENG_Dropdowns`, returns form definition
6. Frontend renders dynamic form; on save → Backend `saveEngineRecord(formId, payload)`
7. Backend validates, maps to `Target_Sheet`/`Target_Column`, generates ID `HRM-N`, writes at row ≥3, logs; Frontend reloads HRM view

### API Endpoints and Triggers
- `login(username, password)` — Trigger: Login button; stores token; writes session `SYS_Sessions` (`src/Dashboard.html:1178-1225`, `src/Code.js:9-77`)
- `getModuleData(viewId)` — Trigger: `loadModule("HRM")` (`src/Dashboard.html:1472-1491`, `src/Code.js:242-295`)
- `getFormDefinition(formId)` — Trigger: `openForm("FORM_HRM_EMP")` (`src/Dashboard.html:1779-1783`, `src/Code.js:343-378`)
- `saveEngineRecord(formId, payload)` — Trigger: Form save click (`src/Dashboard.html:1566-1579`, `src/Code.js:485-632`)
- `logout(token)` — Trigger: Shutdown dock button (`src/Dashboard.html:1668-1677`, `src/Code.js:137-179`)

### State Management
- Session token persisted client-side using `sessionStorage("erp_token")` (`src/Dashboard.html:1208-1210`)
- Window/FAB managers maintain UI state for open views/forms (`src/Dashboard.html:1258-1460`, `1680-1742`)
- No global Redux-like store; transient state is DOM-driven with event dispatch and per-window datasets

---

## 3. Engine Tabs — Technical Specification

Components: `ENG_Views`, `ENG_Forms`, `ENG_Dropdowns`

### Location and Definition
- Metadata lives in Google Sheet tabs; seeded by `src/Setup.js`
  - Views: `src/Setup.js:737-746` (`VIEW_HRM_EMP`) → `Source_Sheet: HRM_Employees`, columns `Source_Columns`
  - Forms: `src/Setup.js:775-842` (`FORM_HRM_EMP`) with fields (labels, types, mandatory, DD links)
  - Dropdowns: `src/Setup.js:702-735` (e.g., `DD_DEPT`, `DD_GENDER`)

### Configuration Parameters
- Views: `VIEW_ID`, `View_Title`, `Source_Sheet`, `Source_Columns`
- Forms: `FORM_ID`, `Field_ID`, `Field_Label`, `Field_Type`, `Is_Mandatory`, `DD_ID`, `Target_Sheet`, `Target_Column`
- Dropdowns: `DD_ID`, `DD_EN`, `DD_AR`, `DD_Is_Active`, `DD_Sort_Order`

### Lifecycle
1. Open HRM → Read `ENG_Views` → Build list grid (Row 2 filter)
2. Action (Add Employee) → Read `ENG_Forms` & `ENG_Dropdowns` → Render form
3. Save → Map fields to `Target_*` → Write to `HRM_Employees` with structured IDs → Log
4. Refresh view → Display updated data

---

## 4. Functional Roles — Engine Tabs

- New Form Creation Workflow
  - Defined in `ENG_Forms`; frontend requests definition; backend returns typed fields; frontend constructs modal form
  - Ref: `src/Dashboard.html:1779-1783`, `src/Code.js:343-378`

- Data Entry and Validation
  - Mandatory fields enforced in backend; dropdown options loaded from `ENG_Dropdowns`
  - Ref: `src/Code.js:532-551`, `src/Code.js:380-441`

- Single Record Display
  - Current implementation focuses on list rendering; single-record view can reuse form with `Field_Can_Edit=false` for read-only display (config-driven)

- List View Generation and Pagination
  - List built from `ENG_Views` metadata; pagination not implemented; table renders full dataset
  - Ref: `src/Dashboard.html:1494-1525`, `src/Code.js:242-295`

- Data Filtering and Sorting
  - Filtering: implicit via Row 2 Arabic labels (only included columns are visible)
  - Sorting: not implemented at frontend; dropdowns sorted by `DD_Sort_Order`
  - Ref: `src/Code.js:270-289` (ENG dropdowns sort), `src/Code.js:268-279` (Row 2 filter)

---

## 5. Code References (Direct)

- Tab Initialization
  - View seed (HRM Employees): `src/Setup.js:737-746`
  - Form seed (Add Employee): `src/Setup.js:775-842`

- Form Building Logic
  - Backend form definition: `src/Code.js:343-378`
  - Frontend form render: `src/Dashboard.html:1527-1594`

- Data Binding
  - View data retrieval: `src/Code.js:242-295`
  - Grid render: `src/Dashboard.html:1494-1525`
  - Form submit and save: `src/Dashboard.html:1566-1579`, `src/Code.js:485-632`

- View Rendering
  - HRM module open: `src/Dashboard.html:1472-1491`
  - Row 2 column inclusion: `src/Code.js:268-279`

---

## 6. Diagrams

### HRM View Lifecycle (Text Diagram)

Frontend HRM Click → loadModule("HRM") → getModuleData("VIEW_HRM_EMP") → [Backend] Resolve ENG_Views → Apply Row2 → Return {headers,data} → Render Grid

### HRM Form Lifecycle (Text Diagram)

FAB add-employee → openForm("FORM_HRM_EMP") → [Backend] Read ENG_Forms + ENG_Dropdowns → Return Form Schema → Render Modal → Save → saveEngineRecord → Validate + ID (HRM-N) + Insert Row ≥3 → Log → Reload HRM View

---

## 7. Version & Dependencies

- Version: v1.0
- Backend: Google Apps Script; `google.script.run` bridge methods
- UI Font: Cairo (Arabic-first)
- Data Rules: Row 1 headers (EN), Row 2 labels (AR), module writes start at Row 3
- ID Format: `AAA-N` (e.g., `HRM-1`) with validation and auto-increment

---

## 8. Considerations & Extensions

- Pagination & Sorting: Add client-side pagination and sortable headers for large HRM datasets
- Single-record view: Configure `ENG_Forms` with read-only fields for detail modals
- Permissions: Integrate `SYS_Role_Permissions` to toggle FAB actions per role

