 SYSTEM ARCHITECTURE & TECHNICAL SPECIFICATION
================================================================================

1.0 CONCEPT OVERVIEW
================================================================================
The Nijjara ERP is a bespoke, serverless Single-Page Application (SPA) designed
for high performance and zero-reload user experience. It utilizes a hybrid
architecture:
  - Static UI Shell: Hard-coded core layout.
  - Dynamic Content: Engine-driven areas fully controlled by Google Sheet
    metadata.

The backend acts as a stateless API built on Google Apps Script, interacting
with a single Google Sheet file that serves as both the Database and the
Configuration Engine.

2.0 SYSTEM SCOPE & FILES
================================================================================
Core Database File Name: [ bA_Nijjara ERP sys ]

The system consolidates all modules into this single file. Tabs are grouped by
module prefixes and strictly follow this naming convention:

  [ SYS_...  ] System Administration
  [ HRM_...  ] Human Resources Management
  [ PRJ_...  ] Project Management
  [ FIN_...  ] Finance
  [ ENG_...  ] System Engines (Metadata & Configs)
  [ DBUG_... ] System Debugging & Audit Logs

3.0 UI/UX & FONT REQUIREMENTS
================================================================================
* Typography: The "Cairo" Font Family is mandatory for all UI elements.
* Theme: Dark Mode exclusively.
* Visual Style: Premium 3D glossy finish, depth-driven visuals, and modern
    glassmorphism effects.
* Language: The UI is Arabic-first, driven by the metadata rules in the
    sheets.

4.0 DYNAMIC DISPLAY LOGIC (THE "ROW 2" RULE)
================================================================================
A core architectural rule determines which data is exposed to the Frontend.

  [ Row 1 (English) ] Database technical field names.
  [ Row 2 (Arabic)  ] User Interface display labels.

The Filtering Algorithm:
When the Frontend requests data for a list view (e.g., HRM_Employees):
1.  Backend opens the target tab.
2.  Backend scans Row 1 and Row 2.
3.  Column Inclusion Condition:
    IF (Row 1 has Data) AND (Row 2 is NOT BLANK) -> INCLUDE
    ELSE -> EXCLUDE (Internal/System field).
4.  Result: The Frontend receives a JSON object containing only the allowed
    columns, using Row 2 values as the Table Headers.

5.0 SYSTEM ENGINES (ENG_)
================================================================================
These tabs constitute the "Brain" of the ERP. They dictate UI behavior without
code changes.

  * ENG_Forms:     Defines structure, validation, and mapping of all forms.
  * ENG_Views:     Defines columns and data sources for list views.
  * ENG_Buttons:   Defines action buttons (Edit, Delete, Save).
  * ENG_Dropdowns: Source of truth for all select options.
  * ENG_Settings:  Global system configuration keys.

6.0 DATABASE INTERACTION LAYER
================================================================================
Direct manual editing of the Google Sheet is STRICTLY PROHIBITED to ensure
integrity. All changes are managed programmatically via Setup.js file, this file serves as the exclusive interface for all interactions with the Google Sheet database. For SOLO use the following strict requirements:

1. Access Control:
- Enforce that Setup.js is the only permitted method for database modifications
- Block all other potential access methods to the database

2. Function Implementation:
- For each database operation (create/edit/delete), develop a dedicated standalone function
- Name each function clearly according to its specific functionality (e.g., `createNewTab()`, `updateCellData()`, `removeEmptyRows()`)
- Structure all functions to execute via single-click buttons

3. Error Handling:
- Implement robust error handling that:
  - Never stops script execution
  - Skips only the failed action while continuing with subsequent operations
  - Provides detailed error explanations including:
    - Exact nature of the error
    - Affected operation
    - Potential causes

4. Logging System:
- Integrate comprehensive logging that:
  - Documents every action in real-time
  - Records operation success/failure status
  - Includes timestamps for all events
  - Maintains clear separation between different operation logs

5. User Interface:
- Create an interactive menu directly on the Google Sheet with:
  - Clearly labeled buttons for all available operations
  - Detailed descriptions for each button explaining:
    - Required user preparation
    - Exact operations the button will perform
    - Expected outcomes
- Implement automatic description updates when functionality changes

6. Phase Management:
- For multi-phase operations (e.g., create tab then populate data):
  - Automate proper execution sequence
  - Include all steps within a single button operation
  - Implement intelligent dependency handling between phases

7. Documentation:
- Maintain plain-language explanations for:
  - All available functions
  - Required user actions
  - System limitations
  - Common troubleshooting steps
- Ensure documentation stays synchronized with actual functionality


7.0 END-TO-END WALKTHROUGH (FRONTEND <-> ENGINE <-> BACKEND)
================================================================================
This section details the lifecycle of user interaction, demonstrating how the
Engine tabs dictate the experience.

7.1 The Login Handshake
--------------------------------------------------------------------------------
1.  User Input: User enters credentials. Frontend validates format (Email/Regex)
    in real-time.
2.  Request: Frontend sends `LOGIN_REQUEST` to Backend.
3.  Authentication (Backend):
    -   Queries `SYS_Users`.
    -   Matches Username/Email (Case-insensitive).
    -   Verifies Password Hash.
    -   Checks `IsActive` and `Disabled_At` flags.
4.  Session Creation:
    -   On success, creates a record in `SYS_Sessions`.
    -   Logs event to `DBUG_AppLog`.
5.  Permissions Build:
    -   Merges `SYS_Roles` + `SYS_Role_Permissions`.
    -   Generates a "Permission Map" (What buttons/tabs are visible).
6.  Response: Sends Session Token + User Profile + Permission Map to Frontend.
7.  Initialization: Frontend stores Token. The UI "wakes up," unlocking modules
    allowed in the Permission Map.

7.2 Loading a Module (The View Engine)
--------------------------------------------------------------------------------
Scenario: User clicks "الموظفين" (Employees).

1.  Request: Frontend requests View Metadata for `HRM_Employees`.
2.  Engine Lookup (Backend):
    -   Reads `ENG_Views` to find the `Source_Sheet` (HRM_Employees).
    -   Reads `ENG_Buttons` to see what actions (Add, Edit) are allowed for this
        view based on user Role.
3.  Data Retrieval (Backend):
    -   Opens `HRM_Employees` sheet.
    -   Applies "Row 2 Logic" (only columns with Arabic headers are fetched).
4.  Response: Returns JSON containing:
    -   Table Headers (from Row 2).
    -   Data Rows (filtered).
    -   Action Buttons (from Engine).
5.  Render (Frontend): Draws the table dynamically. No hard-coded column names
    exist in the frontend code.

7.3 Data Entry (The Form Engine)
--------------------------------------------------------------------------------
Scenario: User clicks "Add New Employee".

1.  Request: Frontend requests Form Schema for `FORM_ADD_EMP`.
2.  Engine Construction (Backend):
    -   Queries `ENG_Forms` filtered by the Form ID.
    -   Retrieves all fields: Labels, Types (Text, Date, Dropdown), Mandatory
        Flags, and Regex patterns.
    -   If a field is type `DROPDOWN`, Backend queries `ENG_Dropdowns` to fetch
        options.
3.  Response: Returns a complete Form Definition Object.
4.  Render (Frontend):
    -   Generates the modal.
    -   Injects inputs based on `Field_Type`.
    -   Applies `Is_Mandatory` validation rules.
5.  Submission:
    -   User clicks Save.
    -   Frontend validates locally.
    -   Payload sent to Backend `SAVE_DATA`.
6.  Persistence (Backend):
    -   Maps payload keys to `Target_Column` defined in `ENG_Forms`.
    -   Writes to `HRM_Employees`.
    -   Logs to `SYS_Audit_Log` (User X created Employee Y).
    -   Logs to `DBUG_AppLog` (Technical success trace).

8.0 ERP SCHEMA SPECIFICATION
================================================================================

8.1 Internal System Tabs (No Arabic Headers)
--------------------------------------------------------------------------------
+-------------------+----------------------------------------------------------+
| TAB NAME          | COLUMNS                                                  |
+-------------------+----------------------------------------------------------+
| DBUG_AppLog       | DBG_ID, Time_Stamp, Actor, Action, Entity, Entity_ID,    |
|                   | Details                                                  |
+-------------------+----------------------------------------------------------+
| DBUG_WarnLog      | DBG_WARN_ID, Time_Stamp, Actor, Action, Entity,          |
|                   | Entity_ID, Details                                       |
+-------------------+----------------------------------------------------------+
| DBUG_ErrorLog     | DBG_ERR_ID, Time_Stamp, Actor, Action, Entity,           |
|                   | Entity_ID, Message                                       |
+-------------------+----------------------------------------------------------+
| ENG_Forms         | FORM_ID, Form_Label, Tab_ID, Tab_Label, Field_ID,        |
|                   | Field_Label, Field_Type, Field_Can_Edit, Source_Sheet,   |
|                   | Source_Columns, Is_Mandatory, Default_Value, DD_ID,      |
|                   | Target_Sheet, Target_Column, ROL_ID, Is_Visible, But_ID  |
+-------------------+----------------------------------------------------------+
| ENG_Views         | VIEW_ID, View_Title, Source_Sheet, Source_Columns        |
+-------------------+----------------------------------------------------------+
| ENG_Buttons       | BTN_ID, BTN_Label, BTN_Type, BTN_Description             |
+-------------------+----------------------------------------------------------+
| ENG_Dropdowns     | DD_ID, DD_EN, DD_AR, DD_Is_Active, DD_Sort_Order         |
+-------------------+----------------------------------------------------------+
| ENG_Settings      | Setting_Key, Setting_Value, Description_EN, Updated_By,  |
|                   | Updated_At                                               |
+-------------------+----------------------------------------------------------+

8.2 User Facing Tabs (Requires Arabic Row 2)
--------------------------------------------------------------------------------
+-----------------------+------------------------------------------------------+
| MODULE: SYS           |                                                      |
+-----------------------+------------------------------------------------------+
| SYS_Dashboard         | SYS_Dash_ID, SYS_Metric_Code, SYS_Metric_Value,      |
|                       | SYS_Dash_Date                                        |
+-----------------------+------------------------------------------------------+
| SYS_Documents         | DOC_ID, DOC_Entity, DOC_Entity_ID, DOC_File_Name,    |
|                       | DOC_Label, DOC_Drive_URL, DOC_Upload_By, DOC_Crt_At  |
+-----------------------+------------------------------------------------------+
| SYS_Users             | USR_ID, EMP_Name_EN, USR_Name, EMP_Email, Job_Title, |
|                       | DEPT_Name, Password_Hash, Last_Login, USR_Crt_At,    |
|                       | USR_Crt_By, USR_Upd_At, USR_Upd_By                   |
+-----------------------+------------------------------------------------------+
| SYS_Roles             | ROL_ID, ROL_Title, ROL_Notes, ROL_Is_System,         |
|                       | ROL_Crt_At, ROL_Crt_By, ROL_Upd_At, ROL_Upd_By       |
+-----------------------+------------------------------------------------------+
| SYS_Permissions       | PRM_ID, PRM_Name, PRM_Notes, PRM_Catg, PRM_Crt_At,   |
|                       | PRM_Crt_By, PRM_Upd_At, PRM_Upd_By                   |
+-----------------------+------------------------------------------------------+
| SYS_Role_Permissions  | ROL_ID, PRM_ID, SRP_Scope, SRP_Is_Allowed,           |
|                       | SRP_Constraints, SRP_Crt_At, SRP_Crt_By, SRP_Upd_At, |
|                       | SRP_Upd_By                                           |
+-----------------------+------------------------------------------------------+
| SYS_Audit_Log         | AUD_ID, AUD_Time_Stamp, USR_ID, USR_Name,            |
|                       | USR_Action, ACT_Description, AUD_Entity,             |
|                       | AUD_Entity_ID, AUD_Scope, AUD_Sheet_ID,              |
|                       | AUD_Sheet_Name, IP_Address                           |
+-----------------------+------------------------------------------------------+
| SYS_Sessions          | SESS_ID, USR_ID, EMP_Email, Actor_USR_ID, SESS_Type, |
|                       | SESS_Status, IP_Address, Auth_Token, SESS_Start_At,  |
|                       | SESS_End_At, SESS_Crt_At, SESS_Crt_By,               |
|                       | SESS_Revoked_At, SESS_Revoked_By, SESS_Metadata      |
+-----------------------+------------------------------------------------------+
| SYS_PubHolidays       | PUBHOL_ID, Pub_Holiday_Date, Pub_Holiday_Name        |
+-----------------------+------------------------------------------------------+
| SYS_Analysis          | SYS_ANA_ID, SYS_ANA_Date, SYS_ANA_Start,             |
|                       | SYS_ANA_End, SYS_ANA_Item1...SYS_ANA_Item9           |
+-----------------------+------------------------------------------------------+

+-----------------------+------------------------------------------------------+
| MODULE: HRM           |                                                      |
+-----------------------+------------------------------------------------------+
| HRM_Dashboard         | HR_Dash_ID, HR_Metric_Code, HR_Metric_Value,         |
|                       | HR_Dash_Date                                         |
+-----------------------+------------------------------------------------------+
| HRM_Departments       | DEPT_ID, DEPT_Name, DEPT_Is_Active, DEPT_Sort_Order, |
|                       | DEPT_Crt_At, DEPT_Crt_By, DEPT_Upd_At, DEPT_Upd_By   |
+-----------------------+------------------------------------------------------+
| HRM_Employees         | EMP_ID, EMP_Name_EN, EMP_Name_AR, Date_of_Birth,     |
|                       | Gender, Nationality, Marital_Status,                 |
|                       | Military_Status, EMP_Mob_Main, EMP_Mob_Sub,          |
|                       | Home_Address, EMP_Email, EmrCont_Name,               |
|                       | EmrCont_Relation, EmrCont_Mob, Job_Title, DEPT_Name, |
|                       | Hire_Date, EMP_CONT_Type, Basic_Salary, Allowances,  |
|                       | Deducts, EMP_Crt_At, EMP_Crt_By                      |
+-----------------------+------------------------------------------------------+
| HRM_Attendance        | ATT_ID, EMP_ID, ATT_Date, ATT_Check_In,              |
|                       | ATT_Check_Out, ATT_Late_Mints, ATT_EarlyLV_Mints,    |
|                       | ATT_OT_Mints, ATT_Notes, ATT_Status, ATT_Crt_At,     |
|                       | ATT_Crt_By, ATT_Upd_At, ATT_Upd_By                   |
+-----------------------+------------------------------------------------------+
| HRM_Leave             | LV_ID, EMP_ID, LV_Type, LV_Start_Date, LV_End_Date,  |
|                       | LV_NumDays, LV_Approved_By, LV_Notes, LV_Crt_At,     |
|                       | LV_Crt_By, LV_Upd_At, LV_Upd_By                      |
+-----------------------+------------------------------------------------------+
| HRM_Advances          | ADV_ID, EMP_ID, ADV_Issue_Date, ADV_Amnt,            |
|                       | ADV_Setlmnt_Period, ADV_Notes, ADV_Status,           |
|                       | ADV_Crt_At, ADV_Crt_By, ADV_Upd_At, ADV_Upd_By       |
+-----------------------+------------------------------------------------------+
| HRM_OverTime          | OT_ID, EMP_ID, POL_OT_ID, ATT_Date, ATT_OT_Mints,    |
|                       | OT_Amnt, OT_Crt_At, OT_Crt_By, OT_Upd_At, OT_Upd_By  |
+-----------------------+------------------------------------------------------+
| HRM_Deductions        | DEDCT_ID, PEN_ID, PEN_Name, EMP_ID, DEDCT_Date,      |
|                       | DEDCT_Amnt, DEDCT_Crt_At, DEDCT_Crt_By,              |
|                       | DEDCT_Upd_At, DEDCT_Upd_By                           |
+-----------------------+------------------------------------------------------+
| HRM_Analysis          | HR_ANA_ID, HR_ANA_Date, HR_ANA_Start, HR_ANA_End,    |
|                       | HR_ANA_Item1...HR_ANA_Item9                          |
+-----------------------+------------------------------------------------------+

+-----------------------+------------------------------------------------------+
| MODULE: PRJ           |                                                      |
+-----------------------+------------------------------------------------------+
| PRJ_Dashboard         | PRJ_Dash_ID, PRJ_Metric_Code, PRJ_Metric_Value,      |
|                       | PRJ_Dash_Date                                        |
+-----------------------+------------------------------------------------------+
| PRJ_Main              | PRJ_ID, PRJ_Name, CLI_ID, CLI_Name, PRJ_Status,      |
|                       | PRJ_Type, PRJ_Budget, Plan_Start_Date, PRJ_Location, |
|                       | PRJ_Crt_At, PRJ_Crt_By, PRJ_Upd_At, PRJ_Upd_By       |
+-----------------------+------------------------------------------------------+
| PRJ_Clients           | CLI_ID, CLI_Name, CLI_Mob_1, CLI_Mob_2, CLI_Email,   |
|                       | CLI_Crt_At, CLI_Crt_By, CLI_Upd_At, CLI_Upd_By       |
+-----------------------+------------------------------------------------------+
| PRJ_Tasks             | TSK_ID, PRJ_ID, TSK_Name, TSK_Priority, EMP_ID,      |
|                       | TSK_Plan_Start, TSK_Start, TSK_End, TSK_Status,      |
|                       | TSK_Crt_At, TSK_Crt_By, TSK_Upd_At, TSK_Upd_By       |
+-----------------------+------------------------------------------------------+
| PRJ_Material          | MAT_ID, MAT_Name, MAT_Catg, MAT_Sub1, MAT_Sub2,      |
|                       | Default_Unit, MAT_Active, MAT_Crt_At, MAT_Crt_By,    |
|                       | MAT_Upd_At, MAT_Upd_By                               |
+-----------------------+------------------------------------------------------+
| PRJ_IndirExp_Time     | ALO_TM_ID, InDiEXP_TM_ID, PRJ_ID, ALO_TM_Methd,      |
| _Alloc                | ALO_TM_Amnt, ALO_TM_Crt_At, ALO_TM_Crt_By,           |
|                       | ALO_TM_Upd_At, ALO_TM_Upd_By                         |
+-----------------------+------------------------------------------------------+
| PRJ_IndirExp_NoTime   | ALO_NT_ID, InDiEXP_NT_ID, PRJ_ID, ALO_NT_Methd,      |
| _Alloc                | ALO_NT_Amnt, ALO_NT_Crt_At, ALO_NT_Crt_By,           |
|                       | ALO_NT_Upd_At, ALO_NT_Upd_By                         |
+-----------------------+------------------------------------------------------+
| PRJ_Plan_vs_Actual    | PvA_ID, PRJ_ID, PRJ_Name, Plan_Start_Date,           |
|                       | Actual_Start_Date, Actual_Num_Days, Plan_End_Date,   |
|                       | Actual_End_Date, Plan_Direct_Exp, Actual_Direct_Exp, |
|                       | Actual_MATs, PvA_Crt_At, PvA_Crt_By, PvA_Upd_At,     |
|                       | PvA_Upd_By                                           |
+-----------------------+------------------------------------------------------+
| PRJ_Analysis          | PRJ_ANA_ID...PRJ_ANA_Item9                           |
+-----------------------+------------------------------------------------------+

+-----------------------+------------------------------------------------------+
| MODULE: FIN           |                                                      |
+-----------------------+------------------------------------------------------+
| FIN_Dashboard         | FIN_Dash_ID, FIN_Metric_Code, FIN_Metric_Value,      |
|                       | FIN_Dash_Date                                        |
+-----------------------+------------------------------------------------------+
| FIN_DirectExpenses    | DiEXP_ID, PRJ_ID, PRJ_Name, DiEXP_Date, MAT_ID,      |
|                       | MAT_Name, MAT_Sub2, Default_Unit, Default_Price,     |
|                       | MAT_Quantity, DiEXP_Total_VAT_Exc,                   |
|                       | DiEXP_Total_VAT_Inc, DiEXP_Pay_Status,               |
|                       | DiEXP_Pay_Methd, DiEXP_Notes, ADV_Crt_At,            |
|                       | ADV_Crt_By, ADV_Upd_At, ADV_Upd_By                   |
+-----------------------+------------------------------------------------------+
| FIN_InDirectExpenses  | InDiEXP_TM_ID, InDiEXP_TM_Catg, InDiEXP_TM_Sub1,     |
| _Time                 | InDiEXP_Start, InDiEXP_End, InDiEXP_TM_Pay_Status,   |
|                       | InDiEXP_TM_Pay_Methd, InDiEXP_TM_Notes, ADV_Crt_At,  |
|                       | ADV_Crt_By, ADV_Upd_At, ADV_Upd_By                   |
+-----------------------+------------------------------------------------------+
| FIN_InDirectExpenses  | InDiEXP_NT_ID, InDiEXP_NT_Catg, InDiEXP_NT_Sub1,     |
| _NoTime               | Useful_Life_Months, Depreciation_Start_Date,         |
|                       | InDiEXP_NT_Pay_Status, InDiEXP_NT_Pay_Methd,         |
|                       | InDiEXP_NT_Notes, ADV_Crt_At, ADV_Crt_By,            |
|                       | ADV_Upd_At, ADV_Upd_By                               |
+-----------------------+------------------------------------------------------+
| FIN_PRJ_Revenue       | REV_ID, PRJ_ID, REV_Date, REV_Amnt, REV_Type,        |
|                       | REV_Source, REV_Pay_Methd, REV_Invoice_Number,       |
|                       | REV_Pay_Status, REV_Total, REV_Remain, ADV_Crt_At,   |
|                       | ADV_Crt_By, ADV_Upd_At, ADV_Upd_By                   |
+-----------------------+------------------------------------------------------+
| FIN_Custody           | CSTD_ID, EMP_ID, EMP_Name, PRJ_ID, PRJ_Name,         |
|                       | CSTD_Issue_Date, CSTD_Amnt, CSTD_Purpose,            |
|                       | CSTD_Status, CSTD_Notes, ADV_Crt_At, ADV_Crt_By,     |
|                       | ADV_Upd_At, ADV_Upd_By                               |
+-----------------------+------------------------------------------------------+
| FIN_HRM_Payroll       | PAY_ID, EMP_ID, EMP_Name, PAY_Start_Date,            |
|                       | PAY_End_Date, Basic_Salary, Total_OT_Amnt,           |
|                       | ADV_Instal, Total_DEDCT_Amnt, PAY_Net_Pay,           |
|                       | PAY_Status, ADV_Crt_At, ADV_Crt_By, ADV_Upd_At,      |
|                       | ADV_Upd_By                                           |
+-----------------------+------------------------------------------------------+
| FIN_P&L_Statements    | P&L_ID, Rev_ID, DiEXP_ID, InDiEXP_TM_ID,             |
|                       | InDiEXP_NT_ID, Total_Rev, Total_DiEXP,               |
|                       | Total_InDiEXP_TM, Total_InDiEXP_NT, P&L_Start_Date,  |
|                       | P&L_End_Date, ADV_Crt_At, ADV_Crt_By, ADV_Upd_At,    |
|                       | ADV_Upd_By                                           |
+-----------------------+------------------------------------------------------+
| FIN_Analysis          | FIN_ANA_ID...FIN_ANA_Item9                           |
+-----------------------+------------------------------------------------------+

9.0 ENGINE DICTIONARY (HEADER DEFINITIONS)
================================================================================

9.1 ENG_Forms
--------------------------------------------------------------------------------
| COLUMN          | DEFINITION                                                 |
|-----------------|------------------------------------------------------------|
| Form_ID         | Unique ID for the specific form (Add vs View).             |
| Form_Label      | Arabic Title (Header) of the popup window.                 |
| Tab_ID          | Unique ID for the tab within the form window.              |
| Tab_Label       | Arabic Label on the form tab.                              |
| Field_ID        | Unique identifier for the input field.                     |
| Field_Label     | Arabic Label displayed above the field.                    |
| Field_Type      | Data type (Text, Number, Date, Dropdown, Boolean).         |
| Field_Can_Edit  | Controls Read-Only vs Writable state in Edit mode.         |
| Source_Sheet    | Source data for View forms (where data comes from).        |
| Source_Columns  | Specific column to map from Source_Sheet.                  |
| Is_Mandatory    | Validation flag: Must be filled before save.               |
| Default_Value   | Placeholder text (Arabic guidance) that vanishes on typing.|
| DD_ID           | Link to ENG_Dropdowns if Field_Type is Dropdown.           |
| Target_Sheet    | Destination sheet for saving data.                         |
| Target_Column   | Destination column in Target_Sheet.                        |
| ROL_ID          | Role-based visibility (Who sees this field?).              |
| Is_Visible      | Global visibility toggle.                                  |

9.2 ENG_Views
--------------------------------------------------------------------------------
| COLUMN          | DEFINITION                                                 |
|-----------------|------------------------------------------------------------|
| View_ID         | Unique ID for the List View configuration.                 |
| View_Title      | Arabic Title displayed at the top of the submodule.        |
| Source_Sheet    | The Data Sheet to read from (e.g., HRM_Employees).         |
| Source_Columns  | (Optional) Specific override for columns, usually driven   |
|                 | by Row 2 logic.                                            |

9.3 ENG_Buttons
--------------------------------------------------------------------------------
| COLUMN          | DEFINITION                                                 |
|-----------------|------------------------------------------------------------|
| But_ID          | Unique ID for the button.                                  |
| But_Label       | Arabic Caption (e.g., "حفظ", "تعديل").                     |
| But_Type        | Action Type (SAVE, EDIT, DELETE, TOGGLE).                  |
| But_Description | Dev description of purpose.                                |

9.4 ENG_Dropdowns
--------------------------------------------------------------------------------
| COLUMN          | DEFINITION                                                 |
|-----------------|------------------------------------------------------------|
| DD_ID           | Unique ID linking to ENG_Forms.                            |
| DD_EN           | English Internal Name.                                     |
| DD_AR           | Arabic Display Name (shown to user).                       |
| DD_Is_Active    | Soft delete flag.                                          |
| DD_Sort_Order   | Integer for custom sorting in the UI list.                 |

10.0 DEBUGGING & LOGGING STRATEGY
================================================================================
Three specific tabs handle system health. This is distinct from the
`SYS_Audit_Log` (which is for Business Compliance).

10.1 DBUG_AppLog (Info Level)
--------------------------------------------------------------------------------
- Purpose: "What happened?" (Success traces).
- Events: Login success, Data fetch, Form Save success.
- Use Case: Tracing a user's session journey.

10.2 DBUG_WarnLog (Warning Level)
--------------------------------------------------------------------------------
- Purpose: "What looks suspicious?"
- Events: Failed validations, Unauthorized access attempts, Slow queries.
- Use Case: Proactive monitoring before a crash occurs.

10.3 DBUG_ErrorLog (Critical Level)
--------------------------------------------------------------------------------
- Purpose: "Why did it crash?"
- Events: Uncaught exceptions, Script failures, Stack traces.
- Use Case: Immediate bug fixing.

Required Backend Implementation (Code.js):
To support this, the following helper functions are mandatory:
1. `logInfo_(actor, action, entity, id, details)`
2. `logWarn_(actor, action, entity, id, details)`
3. `logError_(actor, action, entity, id, message, errorObject)`
4. `appendDebugRow(sheetName, dataObj)`

================================================================================
 END OF SPECIFICATION
================================================================================