# Nijjara ERP: System Overview & Architecture
## Table of Contents
- 【 CONCEPT 】
- [1.0 MASTER GOOGLE SHEET STRUCTURE]
- [2.0 TECHNOLOGY STACK]
- [3.0 CORE ARCHITECTURE & LOGIC]
- [4.0 GOOGLE SHEETS ERP SCHEMA (THE DATABASE)]
- [5.0 SYSTEM ENGINES (ENG_)]
- [6.0 WALK-THROUGH EXAMPLE]
- [7.0 The 3 DBUG Tabs]
	━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
━━━━━━━━━━━━
【 CONCEPT 】
━━━━━━━━━━━━
This document outlines the architecture for the Nijjara ERP, a custom, serverless, web-based platform. It is designed as a Single-Page Application (SPA) to provide a fast, dynamic, and responsive user experience without page reloads.
The system's primary function is to centralize and manage all core business operations across four main modules:
- Project Management (PRJ)
- Finance (FIN)
- Human Resources (HRM)
- System Administration (SYS)
============================================================
1.0 MASTER GOOGLE SHEET STRUCTURE
============================================================
We use **one Google Sheet only** named:
```
bA_Nijjara_ERPsys
```
All modules live inside this file as **tabs**, NOT separate sheets.
Tabs are grouped and named using prefixes:
- HR_...
- FIN_...
- PRJ_...
- SYS_...
- ENG_...
- DBUG_
This keeps everything consistent and easy for Setup.js.
============================================================
2.0 TECHNOLOGY STACK
============================================================
The entire system is built on the Google Workspace platform, leveraging its integrated, serverless environment.
- **BACKEND**: Google Apps Script (.js)
  o---|Code.js|---o One file Handles all server-side logic, data processing, authentication, permission handling, and database communication.
- **FRONTEND**: HTML / CSS / JavaScript (.html)
  o---|Dashboard.html|---o One html file serves as the SPA container. All UI components (HTML), styling (CSS), and client-side interactivity (JavaScript) are  present in this file.
- **DATABASE**: Google Sheets
  o---|bA_Nijjara_ERPsys|---o One Google sheet acts as the full Database for the system, where each tab (e.g., `SYS_Users`) acts as a database table. This model provides a transparent and auditable data store.
============================================================
3.0 CORE ARCHITECTURE & LOGIC
============================================================
The system's core principle is a **Metadata-Driven UI**. The frontend is not static; it is dynamically built at runtime based on configurations defined in the `ENG_` sheets.
--------------------------------------------------------------------
# 3.1 Smart Header Protocol (3‑Row Rule)
--------------------------------------------------------------------
**CRITICAL:** This is the foundation of the entire data handling layer. Every Data Sheet (e.g., `HRM_Employees`, `PRJ_Main`) **MUST** adhere to this structure.
### **3.1.1 Header Structure (Rows 1-3)**
| Row Number | Technical Name | Logic & Purpose | Mutability |
| :--- | :--- | :--- | :--- |
| **Row 1** | `SYSTEM_KEY` | The internal unique identifier for the column (e.g., `emp_id`, `full_name_ar`). Used by the API/Code to map JSON keys. | **IMMUTABLE** (Never change after code deployment). |
| **Row 2** | `UI_LABEL` | The Arabic label shown in the UI (e.g., `معرّف الموظف`, `الاسم بالكامل`). The system **MUST** read this string to render Form Labels and Table Headers. | **MUTABLE** (Can be changed anytime by the admin). |
| **Row 3** | `VIEW_FLAG` | Controls visibility in the "List View" (Grid). | **MUTABLE** (Admin controls visibility). |
### **3.1.2 Data Ingestion Rule (Row 4+)**
* **SKIP ROW 3:** The system must strictly ignore Row 3 when reading/writing data.
* **START AT ROW 4:** All actual data records (Create/Read/Update/Delete) **MUST start from Row 4**.
* **Reasoning:** Row 3 is reserved for Configuration Flags (e.g., "SHOW"), not data.
### **3.1.3 Logic for `VIEW_FLAG` (Row 3)**
* **IF** Cell contains `"SHOW"` (case-insensitive) → **THEN** Include this column in the Data Grid / List View.
* **IF** Cell is `Empty` → **THEN** Exclude this column from the Data Grid (Hidden from list, but accessible in Detailed View Forms).
### **3.1.4 Example Implementation**
*Sheet: `HRM_Employees`*
| Row | Col A | Col B | Col C | Col D |
| :--- | :--- | :--- | :--- | :--- |
| **1** | `emp_id` | `full_name` | `phone_num` | `basic_salary` |
| **2** | `كود الموظف` | `الاسم بالكامل` | `رقم الهاتف` | `الراتب الأساسي` |
| **3** | `SHOW` | `SHOW` | `SHOW` | *(Empty)* |
| **4** | `HRM-1001` | `Ahmed Ali` | `010xxxx` | `5000` |
* **UI Result:** The "Employees List" page will automatically generate a table with 3 columns using the **Arabic Headers from Row 2**: *كود الموظف, الاسم بالكامل, رقم الهاتف*.
--------------------------------------------------------------------------
# 3.2 THE 3-FILE ARCHITECTURE (DETAILED SPECS)
--------------------------------------------------------------------------
The entire system runs on exactly THREE files. No more, no less.
   -----------------------------------------------------------------------------
   3.2.1 > Code.gs (The Backend Core)
   -----------------------------------------------------------------------------
   * PURPOSE: Serves the HTML, handles API requests, parses Engine Metadata,
     and executes business logic.
   * STRUCTURE (Functions):
     1. [ HTTP ROUTING ]
        - doGet(e)          : Returns Dashboard.html.
        - include(filename) : Helper to inject CSS/JS if needed later.
     2. [ AUTHENTICATION ]
        - login(user, pass) : Hashes password, checks SYS_Users, creates Session.
        - checkSession(token): Validates token against SYS_Sessions.
     3. [ ENGINE CORE (The Brain) ]
        - getFormConfig(formId) :
          a. Reads 'ENG_Forms' for field definitions.
          b. Reads Target Sheet Row 1 & 2 for Labels.
          c. Returns JSON object for Frontend rendering.
        - getViewConfig(viewId) :
          a. Reads 'ENG_Views' for Source Sheet.
          b. Scans Row 3 for "SHOW".
          c. Returns Headers (Row 2) and Data (Row 4+).
     4. [ I/O LAYER (CRUD) ]
        - saveRecord(formId, data):
          a. Maps Form ID to Sheet via 'ENG_Settings'.
          b. Matches JSON keys to Row 1 Headers.
          c. Appends row to the bottom.
        - updateRecord(formId, recId, data): Finds ID, updates row.
        - performSmartSearch(query, linkID):
          a. If linkID == 'DYN_EMPLOYEES', scans HRM_Employees.
          b. Returns {id, label} pairs for dropdowns.
     5. [ LOGIC MODULES ]
        - runAllocations(expenseData):
          a. Triggered by Finance Forms.
          b. Calculates Time/Budget ratios.
          c. Writes to 'PRJ_IndirExp_Alloc'.
     6. [ LOGGER ]
        - logEvent(level, actor, action, details): Writes to DBUG_AppLog.
   -----------------------------------------------------------------------------
   3.2.2 > Dashboard.html (The Frontend SPA)
   -----------------------------------------------------------------------------
   * PURPOSE: The user interface. Contains HTML Shell, CSS Styles, and
     Vue.js/Vanilla JS Application Logic.
   * STRUCTURE:
     1. [ HTML SHELL ]
        - <head>: Imports Cairo Font, TailwindCSS (CDN), Vue.js (CDN).
        - <body>: Contains <div id="app"> which is the Root Component.
     2. [ CSS STYLES (<style>) ]
        - Dark Mode Variables (--bg-color: #1a1a1a).
        - Glassmorphism Classes (.glass-panel).
        - Animations (fade-in, slide-up).
     3. [ JS APPLICATION (<script>) ]
        - STATE MANAGEMENT: Stores 'currentUser', 'currentView', 'activeModule'.
        - COMPONENTS:
          a. <Navbar>: Floating Sidebar with icons (SYS, HRM, PRJ, FIN).
          b. <ModuleHub>: Floating Action Button (FAB) showing sub-menus.
          c. <SmartForm>:
             - Receives JSON config.
             - Renders Inputs (Text, Date, Smart_Lookup).
             - Handles Validation & Submit.
          d. <SmartGrid>:
             - Receives Headers/Data.
             - Renders Table with Sort/Filter.
             - "Edit" button triggers Form.
        - API HANDLER:
          - Wraps 'google.script.run' in Promises.
          - Handles Loading Spinners & Error Toasts.
   -----------------------------------------------------------------------------
   3.2.3 > Setup.js (The Database Architect)
   -----------------------------------------------------------------------------
   * PURPOSE:
     The exclusive interface for Database Management. It injects a GUI Menu
     into the Google Sheet, allowing the admin to execute complex maintenance
     tasks (Wiping, Seeding, Resetting) via a Smart Sidebar.
   * USER INTERFACE (UI) FLOW:
     1. Menu Item: "Nijj_Interaction_Sys" appears in Toolbar.
     2. Dropdown : Click "Run System".
     3. Sidebar  : Opens "Nijjara Orchestrator" on the right.
     4. Input    : User selects Checkboxes (Multi-Select):
                   [ ] Wipe ENG Data (Keep Headers)
                   [ ] Wipe SYS Data (Keep Headers)
                   [ ] Delete All HRM Sheets
                   [ ] Seed Master Config (ENG)
                   [ ] Seed Demo Data (SYS/HRM)
     5. Action   : User clicks [ EXECUTE ].
     6. Feedback : A Status Report Popup appears upon completion.
   * CORE FUNCTIONS & ARCHITECTURE:
     1. [ UI TRIGGERS ]
        - onOpen() : Creates 'Nijj_Interaction_Sys' menu on sheet load.
        - showSidebar() : Renders the HTML Sidebar (embedded string) with
          checkboxes.
     2. [ THE ORCHESTRATOR (BRAIN) ]
        - processSidebarQueue(taskList) :
          a. Receives array of selected task IDs.
          b. **SMART SEQUENCING**: Reorders tasks to prevent conflicts.
             Priority: DELETE Sheets > WIPE Data > SCHEMA Create > SEED Data.
             (e.g., If user selects "Seed" and "Delete", it Deletes first).
          c. Executes tasks sequentially.
          d. Accumulates logs for the Report.
          e. Returns Status Object {success: true, log: "..."}.
     3. [ DESTRUCTIVE ACTIONS (The Erasers) ]
        - deleteGroupSheets(prefix) :
          Deletes entire tabs starting with prefix (e.g., "HRM_").
          Used for Hard Reset.
        - wipeGroupData(prefix) :
          Clears content from Row 4 downwards (Preserves Headers).
          Used for "Soft Reset" or "Data Flushing".
     4. [ CONSTRUCTIVE ACTIONS (The Builders) ]
        - buildGroupSchema(prefix) :
          Creates Tabs + Headers (Rows 1-3) + Formatting for the group.
        - seedGroupData(prefix) :
          Injects default/demo rows (e.g., Admin User, Basic Roles)
          into the target group.
     5. [ REPORTING ]
        - generateReport(results) :
          Constructs a clean summary string:
          "SUCCESS: Wiped 5 Sheets.
           SUCCESS: Seeded 12 Config Rows.
           FAILED: HRM_Employees not found."
          Displayed via Browser.msgBox().
   * EXAMPLES OF SEQUENCING LOGIC:
     - Input : ["Seed ENG", "Wipe ENG"]
     - Logic : Script reorders to -> [1. Wipe ENG, 2. Seed ENG].
     - Result: Clean install, no duplicate rows.
--------------------------------------------------------------------
# 3.3 BOOTSTRAP & DYNAMIC RENDERING
--------------------------------------------------------------------
1. **AUTHENTICATION**: User logs in via `Login.html`. The backend `Code.js` verifies credentials against the `SYS_Users` sheet.
2. **BOOTSTRAP**: On success, the backend gathers ALL metadata into a single "bootstrap object" from the `ENG_` sheets.
3. **RENDERING**: This object is sent to the frontend. Client-side JavaScript parses it to build the *entire* UI.
--------------------------------------------------------------------
# 3.4 UI/UX & FONT REQUIREMENTS
--------------------------------------------------------------------
- All user-facing text, labels, buttons, and headers **must** be displayed in **Arabic**.
- The entire interface **must** use the **Cairo Family font**.
- Smart Attachments (`SYS_Documents`)**
* **Logic:** Forms can include an "Attachment Area".
* **Process:**
    1.  User drops files.
    2.  System uploads to Google Drive.
    3.  System saves a record in `SYS_Documents` linked to the `Entity_ID` (e.g., The Project ID).
* **Viewing:** When viewing a record (e.g., Project Details), the system auto-fetches related files from `SYS_Documents`.
---
--------------------------------------------------------------------
# 3.5 DATA INTEGRITY & AUTOMATION RULES
--------------------------------------------------------------------
### **3.5.1 Smart ID Generation (No Random Strings)**
The system must generate Clean, Sequential, Readable IDs. Random UUIDs (e.g., `a1-b2-x9`) are **FORBIDDEN** for user-facing IDs.
* **Format:** `[PREFIX]-[NUMBER]`
* **Logic:**
    1.  Read the last ID in the column (starting from Row 4).
    2.  Extract the number.
    3.  Increment by 1.
    4.  Format with the module prefix.
* **Examples:**
    * `SYS_Users` → `SYS-1001`, `SYS-1002`
    * `HRM_Employees` → `HRM-1001`
    * `PRJ_Main` → `PRJ-5001`
### **3.5.2 Smart Search & Lookups**
* Any form field defined as `Smart_Lookup` in the Engine must trigger a live search against the target sheet.
* **User Experience:** User types "Ahmed" → System searches Name/Email/Phone in `HRM_Employees` → User selects "Ahmed Ali" → System captures `EMP_ID` hiddenly.
---
================================================================================
 4.0  >>  GOOGLE SHEETS ERP SCHEMA (THE DATABASE)
================================================================================
   Managed by Setup.js.
[ 1. SYSTEM CORE (SYS) ]
    SYS_Analysis        : SYS_ANA_ID, SYS_ANA_Date, SYS_ANA_Start, SYS_ANA_End, SYS_ANA_Item1, SYS_ANA_Item2, SYS_ANA_Item3, SYS_ANA_Item4, SYS_ANA_Item5, SYS_ANA_Item6, SYS_ANA_Item7, SYS_ANA_Item8, SYS_ANA_Item9
    SYS_Audit_Log       : AUD_ID, AUD_Time_Stamp, USR_ID, USR_Name, USR_Action, ACT_Description, AUD_Entity, AUD_Entity_ID, AUD_Scope, AUD_Sheet_ID, AUD_Sheet_Name, IP_Address
    SYS_Dashboard       : SYS_Dash_ID, SYS_Metric_Code, SYS_Metric_Value, SYS_Dash_Date
    SYS_Documents       : DOC_ID, DOC_Entity, DOC_Entity_ID, DOC_File_Name, DOC_Label, DOC_Drive_URL, DOC_Upload_By, DOC_Crt_At
    SYS_Permissions     : PRM_ID, PRM_Name, PRM_Notes, PRM_Catg, PRM_Crt_At, PRM_Crt_By, PRM_Upd_At, PRM_Upd_By
    SYS_PubHolidays     : PUBHOL_ID, Pub_Holiday_Date, Pub_Holiday_Name
    SYS_Role_Permissions: ROL_ID, PRM_ID, SRP_Scope, SRP_Is_Allowed, SRP_Constraints, SRP_Crt_At, SRP_Crt_By, SRP_Upd_At, SRP_Upd_By
    SYS_Roles           : ROL_ID, ROL_Title, ROL_Notes, ROL_Is_System, ROL_Crt_At, ROL_Crt_By, ROL_Upd_At, ROL_Upd_By
    SYS_Sessions        : SESS_ID, USR_ID, EMP_Email, Actor_USR_ID, SESS_Type, SESS_Status, IP_Address, Auth_Token, SESS_Start_At, SESS_End_At, SESS_Crt_At, SESS_Crt_By, SESS_Revoked_At, SESS_Revoked_By, SESS_Metadata
    SYS_Users           : USR_ID, EMP_Name_EN, USR_Name, EMP_Email, Job_Title, DEPT_Name, Password_Hash, Password_Salt, Last_Login, USR_Crt_At, USR_Crt_By, USR_Upd_At, USR_Upd_By
[ 2. HUMAN RESOURCES (HRM) ]
    HRM_Advances        : ADV_ID, EMP_ID, ADV_Issue_Date, ADV_Amnt, ADV_Setlmnt_Period, ADV_Notes, ADV_Status, ADV_Crt_At, ADV_Crt_By, ADV_Upd_At, ADV_Upd_By
    HRM_Analysis        : HR_ANA_ID, HR_ANA_Date, HR_ANA_Start, HR_ANA_End, HR_ANA_Item1, HR_ANA_Item2, HR_ANA_Item3, HR_ANA_Item4, HR_ANA_Item5, HR_ANA_Item6, HR_ANA_Item7, HR_ANA_Item8, HR_ANA_Item9
    HRM_Attendance      : ATT_ID, EMP_ID, ATT_Date, ATT_Check_In, ATT_Check_Out, ATT_Late_Mints, ATT_EarlyLV_Mints, ATT_OT_Mints, ATT_Notes, ATT_Status, ATT_Crt_At, ATT_Crt_By, ATT_Upd_At, ATT_Upd_By
    HRM_Dashboard       : HR_Dash_ID, HR_Metric_Code, HR_Metric_Value, HR_Dash_Date
    HRM_Deductions      : DEDCT_ID, PEN_ID, PEN_Name, EMP_ID, DEDCT_Date, DEDCT_Amnt, DEDCT_Crt_At, DEDCT_Crt_By, DEDCT_Upd_At, DEDCT_Upd_By
    HRM_Departments     : DEPT_ID, DEPT_Name, DEPT_Is_Active, DEPT_Sort_Order, DEPT_Crt_At, DEPT_Crt_By, DEPT_Upd_At, DEPT_Upd_By
    HRM_Employees       : EMP_ID, EMP_Name_EN, EMP_Name_AR, Date_of_Birth, Gender, Nationality, Marital_Status, Military_Status, EMP_Mob_Main, EMP_Mob_Sub, Home_Address, EMP_Email, EmrCont_Name, EmrCont_Relation, EmrCont_Mob, Job_Title, DEPT_Name, Hire_Date, EMP_CONT_Type, Basic_Salary, Allowances, Deducts, EMP_Crt_At, EMP_Crt_By
    HRM_Leave           : LV_ID, EMP_ID, LV_Type, LV_Start_Date, LV_End_Date, LV_NumDays, LV_Approved_By, LV_Notes, LV_Crt_At, LV_Crt_By, LV_Upd_At, LV_Upd_By
    HRM_OverTime        : OT_ID, EMP_ID, POL_OT_ID, ATT_Date, ATT_OT_Mints, OT_Amnt, OT_Crt_At, OT_Crt_By, OT_Upd_At, OT_Upd_By
[ 3. PROJECTS (PRJ) ]
    PRJ_Analysis        : PRJ_ANA_ID, PRJ_ANA_Item1, PRJ_ANA_Item2, PRJ_ANA_Item3, PRJ_ANA_Item4, PRJ_ANA_Item5, PRJ_ANA_Item6, PRJ_ANA_Item7, PRJ_ANA_Item8, PRJ_ANA_Item9
    PRJ_Clients         : CLI_ID, CLI_Name, CLI_Mob_1, CLI_Mob_2, CLI_Email, CLI_Crt_At, CLI_Crt_By, CLI_Upd_At, CLI_Upd_By
    PRJ_Dashboard       : PRJ_Dash_ID, PRJ_Metric_Code, PRJ_Metric_Value, PRJ_Dash_Date
    PRJ_IndirExp_NoTime_Alloc: ALO_NT_ID, InDiEXP_NT_ID, PRJ_ID, ALO_NT_Methd, ALO_NT_Amnt, ALO_NT_Crt_At, ALO_NT_Crt_By, ALO_NT_Upd_At, ALO_NT_Upd_By
    PRJ_IndirExp_Time_Alloc: ALO_TM_ID, InDiEXP_TM_ID, PRJ_ID, ALO_TM_Methd, ALO_TM_Amnt, ALO_TM_Crt_At, ALO_TM_Crt_By, ALO_TM_Upd_At, ALO_TM_Upd_By
    PRJ_Main            : PRJ_ID, PRJ_Name, CLI_ID, CLI_Name, PRJ_Status, PRJ_Type, PRJ_Budget, Plan_Start_Date, PRJ_Location, PRJ_Crt_At, PRJ_Crt_By, PRJ_Upd_At, PRJ_Upd_By
    PRJ_Material        : MAT_ID, MAT_Name, MAT_Catg, MAT_Sub1, MAT_Sub2, Default_Unit, MAT_Active, MAT_Crt_At, MAT_Crt_By, MAT_Upd_At, MAT_Upd_By
    PRJ_Plan_vs_Actual  : PvA_ID, PRJ_ID, PRJ_Name, Plan_Start_Date, Actual_Start_Date, Actual_Num_Days, Plan_End_Date, Actual_End_Date, Plan_Direct_Exp, Actual_Direct_Exp, Actual_MATs, PvA_Crt_At, PvA_Crt_By, PvA_Upd_At, PvA_Upd_By
    PRJ_Tasks           : TSK_ID, PRJ_ID, TSK_Name, TSK_Priority, EMP_ID, TSK_Plan_Start, TSK_Start, TSK_End, TSK_Status, TSK_Crt_At, TSK_Crt_By, TSK_Upd_At, TSK_Upd_By
[ 4. FINANCE (FIN) ]
    FIN_Analysis        : FIN_ANA_ID, FIN_ANA_Item1, FIN_ANA_Item2, FIN_ANA_Item3, FIN_ANA_Item4, FIN_ANA_Item5, FIN_ANA_Item6, FIN_ANA_Item7, FIN_ANA_Item8, FIN_ANA_Item9
    FIN_Custody         : CSTD_ID, EMP_ID, EMP_Name, PRJ_ID, PRJ_Name, CSTD_Issue_Date, CSTD_Amnt, CSTD_Purpose, CSTD_Status, CSTD_Notes, ADV_Crt_At, ADV_Crt_By, ADV_Upd_At, ADV_Upd_By
    FIN_Dashboard       : FIN_Dash_ID, FIN_Metric_Code, FIN_Metric_Value, FIN_Dash_Date
    FIN_DirectExpenses  : DiEXP_ID, PRJ_ID, PRJ_Name, DiEXP_Date, MAT_ID, MAT_Name, MAT_Sub2, Default_Unit, Default_Price, MAT_Quantity, DiEXP_Total_VAT_Exc, DiEXP_Total_VAT_Inc, DiEXP_Pay_Status, DiEXP_Pay_Methd, DiEXP_Notes, ADV_Crt_At, ADV_Crt_By, ADV_Upd_At, ADV_Upd_By
    FIN_HRM_Payroll     : PAY_ID, EMP_ID, EMP_Name, PAY_Start_Date, PAY_End_Date, Basic_Salary, Total_OT_Amnt, ADV_Instal, Total_DEDCT_Amnt, PAY_Net_Pay, PAY_Status, ADV_Crt_At, ADV_Crt_By, ADV_Upd_At, ADV_Upd_By
    FIN_InDirectExpenses_NoTime: InDiEXP_NT_ID, InDiEXP_NT_Catg, InDiEXP_NT_Sub1, Useful_Life_Months, Depreciation_Start_Date, InDiEXP_NT_Pay_Status, InDiEXP_NT_Pay_Methd, InDiEXP_NT_Notes, ADV_Crt_At, ADV_Crt_By, ADV_Upd_At, ADV_Upd_By
    FIN_InDirectExpenses_Time: InDiEXP_TM_ID, InDiEXP_TM_Catg, InDiEXP_TM_Sub1, InDiEXP_Start, InDiEXP_End, InDiEXP_TM_Pay_Status, InDiEXP_TM_Pay_Methd, InDiEXP_TM_Notes, ADV_Crt_At, ADV_Crt_By, ADV_Upd_At, ADV_Upd_By
    FIN_PandL_Statements: PL_ID, Rev_ID, DiEXP_ID, InDiEXP_TM_ID, InDiEXP_NT_ID, Total_Rev, Total_DiEXP, Total_InDiEXP_TM, Total_InDiEXP_NT, PL_Start_Date, PL_End_Date, ADV_Crt_At, ADV_Crt_By, ADV_Upd_At, ADV_Upd_By
    FIN_PRJ_Revenue     : REV_ID, PRJ_ID, REV_Date, REV_Amnt, REV_Type, REV_Source, REV_Pay_Methd, REV_Invoice_Number, REV_Pay_Status, REV_Total, REV_Remain, ADV_Crt_At, ADV_Crt_By, ADV_Upd_At, ADV_Upd_By
============================================================
5.0 SYSTEM ENGINES (ENG_)
============================================================
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
### ENG_Settings ###
━━━━━━━━━━━━━━━━━━━━━━━
The Tab, titled "ENG_Settings," maps the `FORM_ID` to the actual `Target_Sheet`.
\>\> It includes the following fields:
  - 1\] **Setting_Key**: A combined key that clearly identifies the form, structured as FORM_MASTER:\[FORM_ID\] // (e.g., FORM_MASTER:FORM_SYS_AddUser, FORM_MASTER:FORM_PRJ_AddTask).
  - 2\] **Setting_Value**: The name of the underlying database table or sheet that the associated form reads from or writes data to (e.g., SYS_Users, HRM_Employees, FIN_DirectExpenses).
  - 3\] **Description_EN**: A short English description summarizing the form's function (e.g., Add User, Request Leave, Create Project, Payroll).
  - 4\] **Updated_By** and 5\] **Updated_At**: Fields for tracking who last modified the setting and when.
\==\> The purpose of this sheet is to establish a core system setting that maps every major action form (such as adding users, requesting leave, or creating projects) to the exact table where the data generated by that form is stored.
_______________________________________________
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
### ENG_Forms ###
━━━━━━━━━━━━━━━━━━━━━━━
The Tab, titled "ENG_Forms," is the configuration map detailing the structure and behavior of various forms within the application.
\>\> It includes the following fields:
  - 1\] **FORM_ID**: A unique identifier for each form (e.g., FORM_SYS_AddUser, FORM_HRM_AddEmployee, FORM_PRJ_ViewMain).
  - 2\] **TAB_Section**: The section or tab within the form where the field is located (e.g., Account, Security, Personal, Job, Overview, Details).
  - 3\] **Column_Pointer**: The name of the data field or column associated with the input element on the form (e.g., EMP_ID, Password_Hash, PRJ_Budget).
  - 4\] **Field_Type**: The type of input control or display element used for the field (e.g., Text, Date, Number, Dropdown, Smart_Lookup, Related_View).
  - 5\] **Smart_State**: The behavior or access state of the field (e.g., EDITABLE, READ_ONLY, LOCKED_ON_EDIT).
		* `EDITABLE`: Field is writable in both "Add" and "Edit" modes.
    		* `LOCKED_ON_EDIT`: Field is writable in "Add" mode but becomes **Read-Only** in "Edit" mode (e.g., IDs, Usernames, Dates).
    		* `READ_ONLY`: Always Read-Only (Used for "View Details" forms or auto-calculated fields).
  - 6\] **DYN_Link**: Specifies the source of dynamic data for lookups, dropdowns, or related views (e.g., DYN_EMPLOYEES, DD_Payment_Method, SYS_Audit_Log).
    		* `DD_...`: Static list from `ENG_Dropdowns`.
    		* `DYN_...`: Dynamic list fetched from a Data Sheet (e.g., `DYN_CLIENTS`).
\==\> The purpose of this sheet is to define the exact layout, fields, field types, access permissions, and data sources for all the input and view forms used across the system's different modules (SYS, HRM, PRJ, FIN).
_______________________________________________
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
### ENG_Views ###
━━━━━━━━━━━━━━━━━━━━━━━ 
The Tab, titled "ENG_Views," is the directory or mapping of different data views within the system (ERP/Management), categorized by module.
\>\> It includes the following fields:
 - 1\] VIEW_ID: A unique identifier for the data view (e.g., VIEW_SYS_Users, VIEW_HRM_Employees). These IDs are categorized by modules: SYS (System), HRM (Human Resources), PRJ (Projects), and FIN (Finance).
 - 2\] View_Title: The title or name of the view, provided in Arabic (e.g., قائمة المستخدمين - Users List, الموظفون - Employees).
 - 3\] Source_Sheet: The name of the underlying source sheet or table from which the view is derived (e.g., SYS_Users, HRM_Employees).
\==\> The purpose of this sheet is to link internal view IDs to their user-friendly Arabic titles and their corresponding source data sheets across various system modules (System, HRM, Projects, and Finance).
_______________________________________________
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
### ENG_Dropdowns ###
━━━━━━━━━━━━━━━━━━━━━━━
The Tab, titled "ENG_Dropdowns," serves as a comprehensive master list for all dropdown menu options used throughout an application, providing values in both English and Arabic.
\>\> It includes the following fields:
 - 1\] DD_ID: The unique identifier for a specific type of dropdown list (e.g., DD_Gender, DD_Project_Status, DD_Payment_Method).
 - 2\] DD_EN: The value of the dropdown option in English (e.g., Yes, Male, Active, Completed, Cash).
 - 3\] DD_AR: The value of the dropdown option in Arabic (e.g., نعم, ذكر, نشط, مكتمل, نقدية).
 - 4\] DD_Is_Active: A boolean flag indicating whether the option is currently active (all sample data shows TRUE).
 - 5\] DD_Sort_Order: The numerical order in which the option should appear within its respective dropdown list.
\==\> The purpose of this sheet is to centralize and manage all predefined, multi-lingual selection options for fields such as user status, project statuses, payment methods, expense categories, and job titles within the system.
_______________________________________________
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
### ENG_Buttons ###
━━━━━━━━━━━━━━━━━━━━━━━ 
The Tab, titled "ENG_Buttons," functions as a master configuration list for all actionable buttons used within the application, linking internal identifiers to user-facing labels and defining their function.
\>\> It includes the following fields:
 - 1\] BTN_ID: The unique internal identifier for the button (e.g., BTN_Reset_Pass, BTN_PRJ_Start).
 - 2\] BTN_Label: The display text for the button, provided in Arabic (e.g., إعادة تعيين كلمة السر, قبول الإجازة).
 - 3\] BTN_Type: Defines where and how the button is used: ROW_ACTION (operates on a single record/row), BULK_ACTION (operates on multiple selected records), or FORM_ACTION (used within a form to submit or change record status).
 - 4\] BTN_Description: A brief description of the button's action or function (e.g., Sends reset email, Changes status to Active, Marks task as Done).
\==\> The purpose of this sheet is to standardize the identification, labeling, and description of all primary action buttons within the system, such as managing users (activate/deactivate), handling requests (approve/reject leave), and updating project or task statuses.
_______________________________________________
---
## ** APPENDIX: APPROVED SYSTEM DEFINITIONS (THE IDs)**
*The following IDs are final and must be used strictly in the implementation.*
### ** Module 1: SYSTEM ADMINISTRATION (SYS)**
**Forms (Data Entry):**
1. `FORM_SYS_AddUser` (Uses Smart Lookup for Employees)
2. `FORM_SYS_AddRole`
3. `FORM_SYS_AddPermission`
4. `FORM_SYS_AddRolePermission`
5. `FORM_SYS_AddDocument`
6. `FORM_SYS_AddPubHoliday`
**Views (Lists):**
1. `VIEW_SYS_Users`
2. `VIEW_SYS_Roles`
3. `VIEW_SYS_Permissions`
4. `VIEW_SYS_RolePermissions`
5. `VIEW_SYS_AuditLog`
6. `VIEW_SYS_Sessions`
7. `VIEW_SYS_Documents`
8. `VIEW_SYS_PubHolidays`
**Detailed Views:**
1. `FORM_SYS_ViewUser` (Tabs: Profile, Audit Log, Sessions)
2. `FORM_SYS_ViewRole` (Tabs: Info, Permissions)
---
### ** Module 2: HUMAN RESOURCES (HRM)**
**Forms (Data Entry):**
1. `FORM_HRM_AddDepartment`
2. `FORM_HRM_AddEmployee` (Tabs: Personal, Job, Financial)
3. `FORM_HRM_AddAttendance` (Manual Entry)
4. `FORM_HRM_AddLeave`
5. `FORM_HRM_AddAdvance`
6. `FORM_HRM_AddOverTime`
7. `FORM_HRM_AddDeduction`
**Views (Lists):**
1. `VIEW_HRM_Departments`
2. `VIEW_HRM_Employees` (Filters: Dept, Title, Status)
3. `VIEW_HRM_Attendance`
4. `VIEW_HRM_Leave`
5. `VIEW_HRM_Advances`
6. `VIEW_HRM_OverTime`
7. `VIEW_HRM_Deductions`
**Detailed Views (360 Profiles):**
1. `FORM_HRM_ViewEmployee` (Tabs: Profile, Attendance Log, Leave History, Financial History, Custody)
2. `FORM_HRM_ViewDepartment` (Tabs: Info, Employee List)
---
### ** Module 3: PROJECT MANAGEMENT (PRJ)**
**Forms (Data Entry):**
1. `FORM_PRJ_AddMain` (Project Creation)
2. `FORM_PRJ_AddClient`
3. `FORM_PRJ_AddTask`
4. `FORM_PRJ_AddMaterial`
**Views (Lists):**
1. `VIEW_PRJ_Main` (Project Portfolio)
2. `VIEW_PRJ_Clients`
3. `VIEW_PRJ_Tasks` (Filter: My Tasks)
4. `VIEW_PRJ_Material` (Price List)
**Detailed Views (Dashboard):**
1. `FORM_PRJ_ViewMain` (Tabs: Overview, Tasks, Financials [Direct/Indirect], Materials)
2. `FORM_PRJ_ViewClient` (Tabs: Info, Project History)
---
### ** Module 4: FINANCE (FIN)**
**Forms (Data Entry):**
1. `FORM_FIN_AddDirectExpense` (Includes "Pay via Custody" logic)
2. `FORM_FIN_AddInDirectExpense_Time` (Time-based Allocation Logic)
3. `FORM_FIN_AddInDirectExpense_NoTime` (Budget-based Allocation Logic)
4. `FORM_FIN_AddPRJ_Revenue`
5. `FORM_FIN_AddCustody`
6. `FORM_FIN_AddHRM_Payroll`
**Views (Lists):**
1. `VIEW_FIN_DirectExpenses`
2. `VIEW_FIN_InDirectExpenses_Time`
3. `VIEW_FIN_InDirectExpenses_NoTime`
4. `VIEW_FIN_PRJ_Revenue`
5. `VIEW_FIN_Custody` (Employee Balances)
6. `VIEW_FIN_HRM_Payroll`
**Detailed Views:**
1. `FORM_FIN_ViewDirectExpense`
2. `FORM_FIN_ViewCustody`
---
## ******** DYNAMIC LOGIC RULES**
1. **Indirect Expenses (Time-Based):**
   - **Trigger:** Submission of `FORM_FIN_AddInDirectExpense_Time`.
   - **Logic:** Find all ACTIVE projects overlapping with the Expense Start/End Dates. Allocate cost based on *Overlap Days / Total Overlap Days*.
2. **Indirect Expenses (Fixed):**
   - **Trigger:** Submission of `FORM_FIN_AddInDirectExpense_NoTime`.
   - **Logic:** Find all ACTIVE projects. Allocate cost based on *Project Budget / Total Budget of Active Projects*.
3. **Smart Lookup:**
   - Any form field defined as `Smart_Lookup` must trigger a live search against the target sheet defined in `DYN_Link`.
**************************************************************************************************************
============================================================
6.0 WALK-THROUGH EXAMPLE
============================================================
Below is a complete, realistic end-to-end flow showing how a typical user interacts with the system.
This example demonstrates exactly how the ENG_ sheets, the setup.js, and the Google Sheet database work together to generate screens, forms, validation, saving, views, and audit logs.
The scenario selected is:
HR Officer logs in → Views Employees → Adds New Employee → System Saves Data → Views Updated Table
--------------------------------------------------------------------
6.1 USER LOGS IN
--------------------------------------------------------------------
STEP 1 — User Action:
User opens system URL → sees Login.html.
STEP 2 — User Input:
Username: mkhoraiby  
Password: 210388
STEP 3 — Backend Logic:
Code.js receives credentials.
System searches in:
SYS_Users → [USR_Name, Password_Hash, USR_Is_Active]
If match found → validate:
Is password hash correct?
Is user active?
Is role assigned?
If all good → generate Session Token.
Write row into SYS_Sessions.
Return: BOOTSTRAP_OBJECT.
BOOTSTRAP_OBJECT includes:
Allowed ENG_Forms
Allowed ENG_Views
Allowed ENG_Buttons
Allowed ENG_Dropdowns
User role & permissions
Arabic labels for UI building
STEP 4 — Frontend:
UI builds automatically → Dashboard loads in Arabic.
--------------------------------------------------------------------
6.2 USER NAVIGATES TO: HR → Employees
--------------------------------------------------------------------
STEP 1 — User Action:
Clicks:
الموارد البشرية → الموظفين
STEP 2 — UI Logic:
SPA framework checks ENG_Views for:
VIEW_ID: HRM_EMP_LIST
Source_Sheet: HRM_Employees
Source_Columns: [EMP_ID, EMP_Name_AR, Job_Title, DEPT_Name, EMP_Status]
STEP 3 — Backend Data Pull:
System reads sheet:
HRM_Employees!A2:Z (Arabic row + data rows)
STEP 4 — Display:
UI builds a dynamic grid using the Arabic names from row 2 only.
Example:
┌────────┬──────────────┬───────────┬───────────┬────────────┐
│ كود الموظف │ اسم الموظف │ الوظيفة │ القسم │ الحالة │
├────────┼──────────────┼───────────┼───────────┼────────────┤
│  101   │ محمد سالم    │ مهندس    │ الجودة  │ نشط     │
│  102   │ علي شعبان    │ محاسب    │ المالية │ نشط     │
└────────┴──────────────┴───────────┴───────────┴────────────┘
--------------------------------------------------------------------
6.3 USER CLICKS: “إضافة موظف جديد”
--------------------------------------------------------------------
The "Add Employee" button is defined in:
ENG_Buttons → BTN_ID: HRM_EMP_ADD
The form structure is defined in:
ENG_Forms → FORM_ID: HRM_EMP_ADD_FORM
The popup loads automatically.
FORM TABS:
[ بيانات أساسية ]   [ الوظيفة ]   [ التواصل ]
FIELDS retrieved dynamically from ENG_Forms:
Example row from ENG_Forms:
FORM_ID: HRM_EMP_ADD_FORM
TAB_ID: HRM_EMP_TAB_BASIC
Field_ID: EMP_Name_AR
Field_Label: اسم الموظف
Field_Type: text
Is_Mandatory: TRUE
Target_Sheet: HRM_Employees
Target_Column: EMP_Name_AR
UI builds exactly as defined.
--------------------------------------------------------------------
6.4 USER FILLS THE FORM
--------------------------------------------------------------------
User enters:
اسم الموظف: كريم إبراهيم
الوظيفة: مهندس موقع
القسم: المشاريع
البريد الإلكتروني: karim@company.com
الموبايل: 01002003004
تاريخ التعيين: 2024-12-01
الراتب الأساسي: 15000
--------------------------------------------------------------------
6.5 USER CLICKS: حفظ
--------------------------------------------------------------------
Backend Logic Runs:
Read all fields from form.
Validate ENG_Forms rules:
Mandatory fields
Field types
Dropdown validity
Generate next ID:
Read last value from HRM_Employees!EMP_ID, e.g. 102 → 103.
Append row to HRM_Employees:
EMP_ID: 103
EMP_Name_EN: Karim Ibrahim
EMP_Name_AR: كريم إبراهيم
Job_Title: مهندس موقع
DEPT_Name: المشاريع
EMP_Email: karim@company.com
EMP_Mob_Main: 01002003004
Hire_Date: 2024-12-01
Basic_Salary: 15000
...
Crt_At: NOW()
Crt_By: mkhoraiby
Write audit log entry in SYS_Audit_Log:
AUD_ID: auto
USR_ID: mkhoraiby
USR_Action: ADD
ACT_Details: Added new employee (EMP_ID = 103)
AUD_Entity: HRM_Employees
AUD_Entity_ID: 103
Time_Stamp: NOW()
Return status: {"status":"success","msg":"Employee saved"}
Frontend shows toast:
✔ تم حفظ الموظف بنجاح
--------------------------------------------------------------------
6.6 UI AUTO-REFRESHES EMPLOYEE TABLE
--------------------------------------------------------------------
Frontend re-requests the view:
ENG_Views → VIEW_ID: HRM_EMP_LIST
System reads HRM_Employees!A2:Z again.
Updated list now shows:
│ 103 │ كريم إبراهيم │ مهندس موقع │ المشاريع │ نشط │
--------------------------------------------------------------------
6.7 USER CLICKS ON THE EMPLOYEE (VIEW DETAILS)
--------------------------------------------------------------------
Popup generated via:
ENG_Forms → FORM_ID: HRM_EMP_VIEW_FORM
Fields such as department, salary, job title appear as read-only.
If the user’s role allows editing, "تعديل" button (BTN_ID: HRM_EMP_EDIT) appears.
--------------------------------------------------------------------
6.8 USER UPDATES EMPLOYEE (EDIT)
--------------------------------------------------------------------
Example update:
Basic Salary: 15000 → 17000
Backend Logic:
Check permission via SYS_Role_Permissions.
Update the same row in HRM_Employees.
Log into SYS_Audit_Log:
Action: UPDATE  
Entity: HRM_Employees  
Entity_ID: 103  
Details: Updated salary from 15000 to 17000  
--------------------------------------------------------------------
6.9 SESSION END
--------------------------------------------------------------------
When user logs out:
Update SYS_Sessions → SESS_End_At
Revoke token
Clear browser storage
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
END OF WALK-THROUGH EXAMPLE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
============================================================
7.0 The 3 DBUG Tabs
============================================================
These tabs serve as the system's internal monitoring and diagnostic center. They are separate from the SYS_Audit_Log (which is for business compliance) and focus on technical system health.
--------------------------------------------------------------------
# 7.1 DBUG_AppLog (Application Log)
--------------------------------------------------------------------
*Purpose: Records successful system events, routine operations, and general information flow. It answers "What happened?" during normal operation.
*Content: Timestamps, User IDs, Actions (e.g., "LOGIN", "FETCH_DATA"), and context details.
*Usage: Used to trace a user's journey through the app or verify that background processes ran successfully.
--------------------------------------------------------------------
# 7.2 DBUG_WarnLog (Warning Log)
--------------------------------------------------------------------
*Purpose: Captures potential issues that didn't crash the system but require attention. It answers "What looks suspicious?"
*Content: Validation failures, unauthorized access attempts (that were blocked), or operations that took longer than expected.
*Usage: Proactive monitoring to prevent future errors. For example, if a user tries to access a restricted form, it might be logged here.
--------------------------------------------------------------------
# 7.3 DBUG_ErrorLog (Error Log)
--------------------------------------------------------------------
*Purpose: Captures critical failures, crashes, and unhandled exceptions. It answers "What broke?"
*Content: Full error stack traces, error messages, the specific line of code that failed, and the input data that caused the crash.
*Usage: The first place to look when a user reports a bug or a "Something went wrong" message.
==> How They Work
----> Trigger: When code executes (e.g., a user clicks "Save"), the backend functions call specific logging helpers.
----> Processing: The system captures the Actor (who did it), Action (what they did), Entity (what data was touched), and a Timestamp.
----> Storage: This data is formatted into a row and appended to the bottom of the respective Google Sheet tab.
----> Persistence: Since they are just Google Sheets, you can filter, sort, and analyze them using standard spreadsheet tools.
## What's Needed in the Code
To make these tabs functional, three main components are required in your files:
$$ Backend Logic (Code.js)
You need the core logging functions that other parts of the system can call.
logInfo_(actor, action, entity, id, details): Writes to DBUG_AppLog.
logWarn_(actor, action, entity, id, details): Writes to DBUG_WarnLog.
logError_(actor, action, entity, id, message, errorObject): Writes to DBUG_ErrorLog.
appendDebugRow(sheetName, dataObj): A helper function that handles the actual writing to the spreadsheet.
$$ Integration Points (Throughout Code.js)
You must sprinkle these log calls throughout your business logic.
Example: Inside a saveEmployee function:
try {
   // ... saving logic ...
   logInfo_(user.id, "SAVE", "EMPLOYEE", empId, "Successfully saved");
} catch (e) {
   logError_(user.id, "SAVE_try {
   // ... saving logic ...
   logInfo_(user.id, "SAVE", "EMPLOYEE", empId, "Successfully saved");
} catch (e) {
   logError_(user.id, "SAVE_
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
============================================================
============================================================
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
