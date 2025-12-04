# Project Onboarding – Logging Acknowledgement (Mandatory)

All team members must acknowledge the project’s aggressive logging policy before access is granted.

## Policy Summary
- Full‑stack logging is active at all times (frontend, backend, API, engine/state).
- Log levels: DEBUG, INFO, WARN, ERROR. All entries include ISO timestamps.
- Persistent logs stored in Google Sheets tab `DBUG` (fallback `DBUG_AppLog`).
- No one may disable or circumvent logging.

## Required Written Confirmation
By signing below, I confirm:
1. I understand the aggressive logging policy and system architecture.
2. I will maintain logging standards in all code I author.
3. I will not disable, bypass, or weaken logging mechanisms.

Name: ______________________  Email: ______________________  Date: __________
Signature: ________________________________________________________________

## Verification Process
- Acknowledgements are recorded in Sheet `SYS_Dev_Ack` with columns:
  `DEV_Email`, `DEV_Name`, `Ack_Read`, `Ack_Signed_At`, `Verified_By`
- Access is granted only after `Ack_Read = TRUE` and `Ack_Signed_At` is set.
- Backend helpers:
  - `isDeveloperAcknowledged(email)` – returns `{ acknowledged: true|false }`
  - `recordDeveloperAcknowledgement(email, name)` – writes signed record
   - `ensureAgentCompliance(agentId, agentName, agentEmail)` – enforces No Code Manager protocol for AI Agents

## Example Log Output
```
2025-12-03T10:15:12.345Z | level=INFO | actor=USR-17 | action=CLICK | component=UI | id=app-hrm :: User clicked on app-hrm
2025-12-03T10:15:13.102Z | level=DEBUG | actor=USR-17 | action=FUNC_START | component=login | :: begin
2025-12-03T10:15:13.620Z | level=INFO | actor=USR-17 | action=FUNC_END | component=login | id=SYS-204 :: success
2025-12-03T10:15:14.005Z | level=ERROR | actor=USR-17 | action=API | component=getModuleData | :: Server error: AUTH_REQUIRED
```

## Troubleshooting Guidelines
- Filter by `actor` to trace user activity.
- Use `FUNC_START`/`FUNC_END` with `elapsed_ms` to detect performance issues.
- Inspect `ERROR` lines first, then the preceding `DEBUG` context.

## Retention & Analysis
- Retain 90 days in `DBUG`; archive monthly.
- Weekly analysis of error/warn distribution and slow functions.
## No Code Manager Protocol Implementation
- All AI Agent interactions MUST:
  1. Perform `clasp push --force` prior to any summary response
  2. Verify No Code Manager protocol compliance
  3. Confirm compliance document acknowledgement
- The process is fully automated; no manual steps by the No Code Manager are required.
