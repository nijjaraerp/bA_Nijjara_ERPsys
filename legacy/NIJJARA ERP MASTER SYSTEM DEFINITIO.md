NIJJARA ERP: MASTER SYSTEM DEFINITION & IMPLEMENTATION BLUEPRINT
Version: 1.0 (FINAL CONSOLIDATED) Date: 2025-12-03 Status: PRODUCTION READY

1.0 DOCUMENT OVERVIEW
1.1 Purpose
This document defines every technical, functional, and logical aspect of the Nijjara ERP System. It consolidates all architectural decisions, database schemas, and engine protocols into a single implementation bible.

1.2 Audience
Expert Engineers: Use this for clean architecture, file structure, and algorithmic logic.

Beginners ("Donkeys"): Follow the step-by-step implementation roadmap to build the system from zero.

1.3 Scope
Backend: Google Apps Script (Serverless, Stateless).

Database: Google Sheets (Single File acting as Relational DB + Config Engine).

Frontend: HTML5/CSS3/JS (Single Page Application - SPA).

UI/UX: Dark Mode, Glassmorphism, 3D/Glossy effects, Arabic-First.

2.0 SYSTEM ARCHITECTURE & VISION
2.1 Core Philosophy: "Convention Over Configuration"
The system is Metadata-Driven. We do not write code for specific forms (e.g., createEmployeeForm). Instead, we write a generic Smart Engine that reads configuration from Google Sheets (ENG_ tabs) and renders the UI dynamically.

2.2 Technical Stack & Environment
Platform: Google Workspace (Apps Script + Sheets).

Project Name: bA_Nijjara_ERPsys

GCP Project ID: ba-nijjara-erp-sys (Project #: 1018155449304)

Sheet ID: 1anq5RkM_vEIyYtMpakE69kXP2XWQkPlxdfYgvmVF3ls

Script ID: 1rbUrcbgaRTdnJUkU_79apv8KaVL9cxILuFZj8eF-DYvXvc7vVHfa1idI

2.3 High-Level Components
The Database (Google Sheet): Contains Data Sheets (HRM_, SYS_) and Engine Sheets (ENG_).

The Backend (Apps Script): Handles API requests (doGet, runFunction), Authentication, and Engine parsing.

The Frontend (SPA): A static HTML shell that loads views dynamically via JSON payloads from the backend.

3.0 THE "SMART HEADER" PROTOCOL (The 3-Row Rule)
CRITICAL: This is the foundation of data handling. Every Data Sheet MUST follow this structure.

3.1 Row Structure
Row #	Name	Logic & Purpose	Mutability
1	SYSTEM_KEY	English ID (e.g., emp_id). Used by code to map JSON.	IMMUTABLE
2	UI_LABEL	Arabic Label (e.g., كود الموظف). Used for Form Labels & Table Headers.	MUTABLE
3	VIEW_FLAG	Visibility Flag. If "SHOW", it appears in List Views. If Empty, it is hidden.	MUTABLE
4+	DATA	Actual data records start strictly from Row 4.	Dynamic

Export to Sheets

3.2 List View Generation Logic
When the Frontend requests a list (e.g., Employee List):

Backend reads ENG_Views to find the source sheet.

Backend scans the Source Sheet.

It selects ONLY columns where Row 3 contains "SHOW".

It uses Row 2 (Arabic) as the Table Header.

It fetches data starting from Row 4.

4.0 SMART ENGINE V2: METADATA PROTOCOL
The ENG_ sheets control the application behavior.

4.1 ENG_Forms (The Form Builder)
Defines what fields appear in a form.

FORM_ID: Unique key (e.g., FORM_HRM_AddUser).

TAB_Section: Groups fields into tabs (e.g., "Personal Info", "Financials").

Column_Pointer: The Magic Link. Matches SYSTEM_KEY (Row 1) in the Data Sheet.

Field_Type:

Text, Number, Date, Boolean: Standard inputs.

Dropdown: Requires DYN_Link.

Smart_Lookup: Triggers a search bar (e.g., search Employee by Name/Mobile).

Attachment_Area: Creates a file upload dropzone.

Smart_State:

EDITABLE: Writable in Add & Edit modes.

LOCKED_ON_EDIT: Writable in Add, Read-Only in Edit (e.g., IDs).

READ_ONLY: Always view-only.

DYN_Link:

DD_...: Static list from ENG_Dropdowns.

DYN_...: Dynamic list from a Data Sheet (e.g., DYN_CLIENTS).

4.2 ENG_Settings (The Mapper)
Maps the Form ID to the specific Storage Sheet.

Key: FORM_MASTER:[FORM_ID] (e.g., FORM_MASTER:FORM_SYS_AddUser)

Value: [Target_Sheet_Name] (e.g., SYS_Users)

4.3 ENG_Buttons (Actions)
Defines actions beyond standard Save/Cancel.

ROW_ACTION: Icon inside a table row (e.g., "Reset Password").

BULK_ACTION: Button above table for multiple selections (e.g., "Activate Selected").

FORM_ACTION: Button inside a form (e.g., "Approve Leave").

5.0 GOOGLE SHEETS ERP SCHEMA
5.1 Global Naming Conventions
Sheet Prefixes: SYS_, HRM_, PRJ_, FIN_, ENG_, DBUG_.

ID Format: [PREFIX]-[SEQ] (e.g., HRM-1001). No UUIDs.

Font: Cairo (Arabic/English).

5.2 MODULE: SYSTEM (SYS)
SYS_Users: USR_ID, EMP_ID (Link), Username (Auto: 2 chars + Last Name), Password_Hash, Role_ID, Is_Active.

SYS_Roles: ROL_ID, ROL_Name, ROL_Description.

SYS_Permissions: PRM_ID, PRM_Key, PRM_Description.

SYS_Role_Permissions: Mapping table.

SYS_Sessions: SESS_ID, USR_ID, Token, Start_Time, End_Time, IP.

SYS_Documents: DOC_ID, DOC_Entity (e.g. HRM_Employees), DOC_Entity_ID, DOC_Label, DOC_Drive_URL.

SYS_Audit_Log: AUD_ID, Timestamp, Actor, Action, Target_Entity, Payload.

SYS_Dashboard: Metrics for the Home Page.

5.3 MODULE: HR (HRM)
HRM_Employees: EMP_ID, Full_Name_AR, Full_Name_EN, Job_Title, DEPT_ID, Basic_Salary, Join_Date, Status.

HRM_Attendance: ATT_ID, EMP_ID, Date, Check_In, Check_Out, Status (Late/Present).

HRM_Leave: LV_ID, EMP_ID, Type, Start_Date, End_Date, Status (Pending/Approved).

HRM_Advances: ADV_ID, EMP_ID, Amount, Date, Is_Settled.

HRM_Dashboard: HR Metrics.

5.4 MODULE: PROJECTS (PRJ)
PRJ_Main: PRJ_ID, PRJ_Name, CLI_ID, Status (New/Active/Hold/Closed), Budget, Start_Date, End_Date.

PRJ_Tasks: TSK_ID, PRJ_ID, Title, Assigned_To (EMP_ID), Status.

PRJ_Clients: CLI_ID, Name, Phone, Email.

PRJ_Allocated_Costs: ALLOC_ID, PRJ_ID, Source_Expense_ID, Amount, Method (Time/Value).

PRJ_Materials: Acts as a Price List. MAT_ID, Name, Unit, Unit_Price.

5.5 MODULE: FINANCE (FIN)
FIN_DirectExpenses: EXP_ID, PRJ_ID, Amount, Date, Pay_Method (Cash/Bank/Custody), Custody_EMP_ID.

FIN_Indirect_Time: IND_ID, Name, Amount, Start_Date, End_Date. (Triggers Allocation Algorithm).

FIN_Indirect_Fixed: IND_ID, Name, Amount, Date. (Triggers Budget-based Allocation).

FIN_Revenue: REV_ID, PRJ_ID, Amount, Date, Invoice_Ref.

FIN_Custody: CSTD_ID, EMP_ID, Amount, Date, Type (Debit/Credit).

6.0 APPLICATION LOGIC & WORKFLOWS
6.1 The "Living" Home Page
Navigation: Floating Sidebar + Floating Action Button (FAB) for sub-modules.

Content: Not empty. Pulls last rows from SYS_Dashboard, HRM_Dashboard, etc., to show Widgets (e.g., "Active Projects: 5").

6.2 System Administration (SYS) Logic
Smart User Creation: FORM_SYS_AddUser uses Smart_Lookup.

User types "Ahmed" -> System finds Employee.

Auto-fills Name/Email (Read Only).

Auto-generates Username (First 2 chars + Last Name).

Quick Actions:

"Reset Password" button in List View (sends email).

"Bulk Activate/Deactivate" buttons above the grid.

6.3 Finance Allocation Algorithms (Background Engine)
Type 1: Time-Based (e.g., Rent)

Input: Start_Date, End_Date, Amount.

Logic: Find all ACTIVE projects intersecting this range.

Formula: (Project_Overlap_Days / Total_Overlap_Days_All_Projects) * Amount.

Output: Write rows to PRJ_Allocated_Costs.

Type 2: Fixed/Budget-Based (e.g., Equipment Purchase)

Input: Date, Amount.

Logic: Find all ACTIVE projects on this date.

Formula: (Project_Budget / Total_Portfolio_Budget) * Amount.

Output: Write rows to PRJ_Allocated_Costs.

6.4 Attachments Workflow
User drops file in Attachment_Area.

Backend uploads to Drive Folder (named by Module).

Backend creates record in SYS_Documents linked to the Entity ID.

View Mode auto-fetches these links and displays them.

7.0 CODEBASE STRUCTURE (Apps Script)
Do not use a single Code.gs. Split files by responsibility.

appsscript.json: Manifest / Oauth scopes.

Config.gs: Constants (Sheet IDs, Colors, Folder IDs).

Router.gs: doGet(e) - Serves HTML and handles routing.

Auth.gs: Login, Session validation, Permission checks.

Engine_Core.gs: Functions to parse ENG_ sheets (getFormConfig, getViewConfig).

Engine_IO.gs: Generic CRUD (saveRecord, fetchGridData, deleteRecord).

Setup.js (Special): The ONLY file allowed to modify Sheet Structure. Contains createNewTab(), addSystemColumns().

Module_SYS.gs: Specific logic for User creation / Auth.

Module_FIN.gs: Allocation algorithms logic.

Logger.gs: "Extreme Logging" implementation.

8.0 LOGGING & DEBUGGING STRATEGY ("Extreme Logs")
8.1 Principles
Log EVERYTHING: Button clicks, API calls, DB writes, Errors.

Never fail silently. Catch errors, log them, return clean JSON to frontend.

8.2 Log Sheets (Internal)
DBUG_AppLog: Info level. "User X logged in", "Project Y created".

DBUG_WarnLog: Warning level. "Failed login attempt", "Validation error".

DBUG_ErrorLog: Critical. Stack traces, script failures.

8.3 Standard Log Format
TIMESTAMP | LEVEL | ACTOR (User ID) | ACTION | COMPONENT | ENTITY_ID | PAYLOAD/MSG

9.0 IMPLEMENTATION ROADMAP
Phase 1: Foundation (The Skeleton)
Initialize GCP Project & Apps Script.

Create Setup.js and run it to generate all SYS_, ENG_, DBUG_ sheets.

Implement Router.gs and Basic Auth (Login Screen).

Implement Logger.gs and connect it to DBUG sheets.

Phase 2: The Smart Engine (The Brain)
Build Engine_Core.gs: Read Row 1/2/3 logic.

Build Engine_IO.gs: Generic Save/Load functions.

Populate ENG_Forms and ENG_Settings with SYS and HRM basics.

Build the Frontend FormRenderer.js and GridRenderer.js.

Phase 3: Modules & Logic (The Muscle)
SYS: Implement Smart User Lookup & Auto Username.

HRM: Implement Employee 360 View & Attendance logic.

PRJ: Implement Project Dashboard & Attachments logic.

FIN: Implement the Allocation Algorithms (Time vs Fixed).

Phase 4: UI Polish (The Skin)
Apply Glassmorphism CSS.

Implement Floating Sidebar & FAB.

Build the "Living" Home Page Widgets.

10.0 STEP-BY-STEP FOR BEGINNERS (The "Donkey" Guide)
Step 1: Setup

Create a new Google Sheet named bA_Nijjara ERP sys.

Open Extensions > Apps Script.

Paste the Code Structure defined in Section 7.0.

Step 2: Database Creation

Do NOT manually add columns.

Write a function in Setup.js: createSheet("SYS_Users", ["USR_ID", ...]).

Run the function.

Go to the Sheet.

Row 1: Leave as is (English IDs).

Row 2: Type Arabic Labels (e.g., "اسم المستخدم").

Row 3: Type "SHOW" under columns you want to see in the list.

Step 3: Engine Configuration

Go to ENG_Settings. Add row: FORM_MASTER:FORM_SYS_AddUser -> SYS_Users.

Go to ENG_Forms. Add rows defining the fields for FORM_SYS_AddUser (use Column_Pointer matching Row 1 of SYS_Users).

Step 4: Frontend

Create index.html.

Write JS to call google.script.run.getFormConfig('FORM_SYS_AddUser').

When data comes back, render HTML inputs dynamically.

Step 5: Testing

Deploy as Web App.

Log in.

Try adding a user. Check SYS_Users row 4. Check DBUG_AppLog.

11.0 APPENDIX: ENGINE ID CATALOG (APPROVED)
Form IDs:

FORM_SYS_AddUser, FORM_SYS_AddRole, FORM_SYS_AddDocument

FORM_HRM_AddEmployee, FORM_HRM_AddLeave, FORM_HRM_AddAdvance

FORM_PRJ_AddMain, FORM_PRJ_AddTask, FORM_PRJ_AddMaterial

FORM_FIN_AddDirectExpense, FORM_FIN_AddInDirectExpense_Time, FORM_FIN_AddInDirectExpense_NoTime

View IDs:

VIEW_SYS_Users, VIEW_HRM_Employees, VIEW_PRJ_Main, VIEW_FIN_DirectExpenses

Dynamic Dropdown Keys:

DYN_EMPLOYEES, DYN_ROLES, DYN_PROJECTS, DYN_CLIENTS

END OF MASTER DOCUMENT