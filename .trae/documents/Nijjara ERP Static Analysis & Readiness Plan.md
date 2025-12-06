## Current System Status
- Backend API layer: 70% complete — auth/session, pagination/sort/search, CRUD, dropdowns, audit logs, file upload; missing role permissions and stricter validation.
- Engine wiring: 60% complete — ID validations and schema helpers exist; 3-row protocol enforcement and canonical headers need standardization.
- Frontend SPA: 30% complete — UI shell present, lacks SmartGrid/SmartForm, login, module routing, Arabic label rendering from engines.
- Config & Manifest: 80% complete — IDs/timezone/runtime consistent; scopes and execution context adjustments pending.

## Critical Issues
- Role/permission checks missing across mutations
  - Impact: Unauthorized actions by authenticated users.
  - Files: `src/Code.js:883-1163` (save/update/delete), `src/Code.js:1842-1992` (uploadFileAPI).
  - Fix: Introduce `checkPermission_(userId, action, entity)` against `SYS_Role_Permissions` and gate all mutating endpoints.
- ID protocol fallback violates guidelines
  - Impact: Inconsistent structured IDs; data integrity risks.
  - Files: `src/Code.js:1651` (UUID fallback).
  - Fix: Fail fast if `_ID` column missing; optionally auto-create canonical `_ID` column per engine schema; remove `Utilities.getUuid()` fallback for entity rows.
- Frontend session/token handling absent
  - Impact: No secure UI flow; protected endpoints unusable.
  - Files: `src/Dashboard.html:1-174`.
  - Fix: Implement `Login.html` with secure token lifecycle (in-memory), pass token via `google.script.run`, add logout/revoke.
- Engine-driven UI not implemented
  - Impact: Guidelines require SmartGrid/Form consuming engines.
  - Files: `src/Code.js:253-546` (views), `src/Code.js:714-802` (forms).
  - Fix: Build `SmartGrid` and `SmartForm` on frontend to consume `getModuleData` and `getFormDefinition`.

## High Issues
- 3-row protocol inconsistencies
  - Impact: Potential inclusion of row 3 flags or skipping first data rows.
  - Files: `src/Code.js` (range utilities, `insertRowByHeaders_` starting row), `src/Setup.js` (engine-specific row handling).
  - Fix: Standardize: Row1 headers, Row2 Arabic, Row3 flags, Row4+ data. Enforce `startRow = 4` for data ops; maintain engine exceptions explicitly.
- Permissive default buttons when `VIEW_ID` absent
  - Impact: UI exposes actions not allowed/defined.
  - Files: `src/Code.js:getViewButtons_` (around `src/Code.js:546-713`).
  - Fix: Require `VIEW_ID` mapping and role filtering; default should be empty.
- File uploads lack validation and restrictive permissions
  - Impact: Unsafe files or unintended sharing.
  - Files: `src/Code.js:1842-1992`.
  - Fix: Validate `mimeType`/size, sanitize filenames, set folders/files to restricted access; log to `SYS_Documents`.

## Medium Issues
- No caching for engines/dropdowns
  - Impact: Repeated full-range reads degrade performance.
  - Files: `src/Code.js` (views/forms/dropdowns).
  - Fix: Add `CacheService` for view definitions, dropdowns; range-bound reads; consider Sheets Advanced Service batch calls.
- Dropdown label heuristics fragile
  - Impact: Wrong labels for non-standard tables.
  - Files: `src/Code.js:getDropdownOptionsFromTable_` (`src/Code.js:804-881`).
  - Fix: Resolve via `ENG_Forms` `DYN_Link` or dedicated `ENG_Dropdowns` mapping to explicit ID/Label columns.
- Audit logging minimal fields
  - Impact: Limited forensics.
  - Files: `src/Code.js:1165-1185`.
  - Fix: Add `USR_Name`, `AUD_Scope`, `AUD_Sheet_ID`, `AUD_Sheet_Name`, `IP_Address` per schema.
- Mandatory field enforcement inconsistent
  - Impact: Incomplete validation on create.
  - Files: `src/Code.js:714-802` (form defs), `src/Code.js:883-1163` (CRUD).
  - Fix: Use `Is_Mandatory` from `ENG_Forms` on both add and update.

## Low Issues
- Manifest scopes and advanced services misaligned
  - Impact: Clasp deployments cleaner with explicit scopes; advanced services currently unused.
  - Files: `src/appsscript.json:1-23`.
  - Fix: Add explicit `oauthScopes` or remove unused advanced entries; or adopt Advanced Services consistently.
- Webapp execution context
  - Impact: Permission/audit mismatch.
  - Files: `src/appsscript.json:1-23`.
  - Fix: Set `webapp.executeAs` to `USER_ACCESSING` when role checks are enforced.
- Canonical engine header naming
  - Impact: Maintenance friction.
  - Files: `src/Setup.js` and `src/Code.js` (header fallbacks).
  - Fix: Normalize headers to guideline canonical names across engines.

## Integration Points Validation
- Google Sheets: Uses `SpreadsheetApp.openById(CONFIG.SHEET_ID)` consistently; aligns with single master sheet and 3-row model; files `src/Config.js:1-16`, `src/Code.js`.
- Google Drive: Folder/file helpers implemented; tighten permissions in uploads; `src/Code.js:1842-1992`.
- Advanced Services: Manifest lists `Sheets` and `Drive` but code uses standard services; align usage.

## Configuration Consistency
- Sheet ID: Consistent between `src/Config.js:1-16` and Script Properties.
- Manifest: `timeZone` Cairo, V8 runtime, domain access configured; scopes and `executeAs` need tuning; `src/appsscript.json:1-23`.
- Engines: Headers defined in `src/Setup.js` match guideline engines; standardize naming.

## Required Adjustments (File-Referenced)
- Add `checkPermission_` and gate mutations: `src/Code.js:883-1163`, `src/Code.js:1842-1992`.
- Remove UUID fallback and enforce `_ID`: `src/Code.js:1651`.
- Standardize data row start to 4+: `src/Code.js` range utils; confirm in `src/Setup.js`.
- Implement `Login.html`, `SmartGrid`, `SmartForm`: new frontend files; wire to `getModuleData`, `getFormDefinition`.
- Add caching: `src/Code.js` engine/dropdown fetchers.
- Harden uploads: `src/Code.js:1842-1992`.
- Expand audit log fields: `src/Code.js:1165-1185`.
- Manifest adjustments: `src/appsscript.json:1-23` (`executeAs`, scopes), and remove unused advanced services if not used.

## Roadmap to 100% Production Readiness
- Phase 1 — Security & Schema (High Impact, Low Dependency)
  - Implement role-based authorization gates (`src/Code.js`), switch `executeAs` to `USER_ACCESSING` (`src/appsscript.json`).
  - Enforce `_ID` rules; remove UUID fallback (`src/Code.js:1651`).
  - Standardize 3-row protocol across data operations (Row4+ data).
- Phase 2 — Engine & Backend Hardening
  - Mandatory field validation on create/update; normalize engine header names (`src/Setup.js`, `src/Code.js`).
  - Expand audit logging; tighten file upload validation and permissions (`src/Code.js`).
  - Add caching for engine lookups/dropdowns.
- Phase 3 — Frontend SPA Enablement
  - Build `Login.html` with secure token handling.
  - Implement `SmartGrid` and `SmartForm` consuming backend endpoints; Arabic-first RTL UI.
  - Module routing and buttons filtered by role/view; remove permissive defaults.
- Phase 4 — Performance & Observability
  - Batch and range-bound reads; consider Advanced Services for heavy ops.
  - Add debug toggles; structured error payloads; improve audit/metrics.
- Phase 5 — Finalization & Deployment
  - Manifest cleanup; explicit scopes; domain access verification.
  - End-to-end tests (auth, CRUD, uploads), load testing on large sheets.
  - Security review, CSRF-like nonce, session expiry handling; staging → production rollout.

## Prioritized Action Items
- Implement role-based authorization gates and `USER_ACCESSING` execution.
- Enforce structured `_ID` and strict 3-row protocol.
- Build login, SmartGrid, SmartForm; wire to engines.
- Add caching and range-bound reads for performance.
- Harden uploads and expand audit logging.
- Normalize engine headers; clean manifest scopes and services.

## Verification Plan
- Unit tests for permission gates, validation, ID enforcement.
- Integration tests for SmartGrid/Form flows with engine data.
- Load tests on pagination/search with large datasets; verify caching effectiveness.
- Security tests: token lifecycle, logout/revoke, uploads restrictions, audit trail completeness.

## Key File References
- `src/Code.js:16-53`, `src/Code.js:75-193` (auth/session).
- `src/Code.js:195-251`, `src/Code.js:1165-1185` (debug/audit logs).
- `src/Code.js:253-546` (views), `src/Code.js:714-802` (forms).
- `src/Code.js:804-881` (dropdowns), `src/Code.js:883-1163` (CRUD).
- `src/Code.js:1647-1734` (ID helpers), `src/Code.js:1842-1992` (files).
- `src/Config.js:1-16` (Sheet ID), `src/appsscript.json:1-23` (manifest).
- `src/Dashboard.html:1-174` (UI shell), `src/Setup.js` (engine headers & extractors).