## Scope and Objectives
- Perform a read-only, full-repo audit against "Nijjara ERP Implementation Guidelines.md"
- Produce a comprehensive status report (completion metrics, discrepancies, root causes, impacts)
- Prepare precise remediation steps with file paths/lines, config updates, tests, and QA plan

## Immediate Remediation Steps
1. Consolidate API router
- Remove legacy `doPost` and retain the enhanced router
- Normalize endpoint names to dedicated API facades (`apiGetBootstrapData`, `apiGetModuleData`, `apiSaveRecord`, `apiUpdateRecord`, `apiDeleteRecord`, `apiPerformSmartSearch`)
- Ensure all API endpoints return JSON via `ContentService`

2. Align Frontend-Backend Data Contracts
- Adjust backend responses to match UI expectations: flat arrays for `forms`, `views`, `buttons`, `dropdowns`
- Confirm field naming alignment (e.g., `columnPointer`, `fieldType`, `smartState`, `dynLink`)

3. Remove Hardcoded API URL
- Inject the published Web App URL from `doGet` into `Dashboard.html` template
- Refactor `API_BASE` usage to use injected value

4. Strengthen Access and Security
- Update `appsscript.json` to restrict `webapp.access` (domain-only or authenticated users)
- Remove any credential artifacts from the frontend (demo hashes, stored salts)
- Enforce server-side auth and session validation consistently

5. Initialize Version Control
- Initialize `.git` in the project root
- Add standard `.gitignore` for Apps Script/Node artifacts
- Commit current state and set up CI for tests and deployment

6. Frontend UI Completeness
- Ensure UI control coverage for `Attachment_Area`, `Related_View`, and advanced SmartForm types
- Add `Sidebar.html` template for maintainable admin sidebar

## Validation & Testing
1. Unit/API Validation
- Verify `login`, `getBootstrap`, `getModuleData`, `performSmartSearch`, CRUD endpoints return valid JSON and 200 status

2. End-to-End Tests (Playwright)
- Update selectors for login and navigation
- Validate HRM and PRJ grids render with real data

3. Configuration and Setup
- Wire `seedMasterConfiguration` to guarded first-run bootstrap (run once, then disable)
- Confirm `CONFIG` script properties are set (SHEET_ID fallback removed when properties exist)

## Quality Assurance Plan
- Static analysis: ESLint (GAS-compatible) and duplication checks
- Security scan: review of auth/session flows, webapp access policy, PII handling, Drive file access
- Performance benchmarks: paging/sorting latency, smart search throughput, allocation engine runtime
- Compliance checklist: OWASP ASVS basics, Google Apps Script security best practices

## Delivery Artifacts
- Human-readable report with evidence and code references
- Machine-readable JSON and XML summaries
- Prioritized action list with owners and timelines

## Request for Confirmation
- Approve the plan to proceed with implementing the above remediation and validation steps, then deliver updated code, tests, and final QA results.