This document lists all FORM_ID and VIEW_ID values from the Engine sheets [ENG_Forms] & [ENG_Views].
These values are to be used in the code to identify the form or view needed for each module's related tab.

        ۩✲۞✲۞✲۞✲۞✲۞✲۞✲۞✲۞✲۞✲۞✲۞✲۞✲۩
       ❉❉❉❉❉   DATA ENTRY FORMS   ❉❉❉❉❉
        ۩✲۞✲۞✲۞✲۞✲۞✲۞✲۞✲۞✲۞✲۞✲۞✲۞✲۩
___________________________________________________________________________________
// --- The following "Add" forms are for entering new data into the database ---  |
__________________________________________________________________________________//

==> Tab Name in the Google Sheet: [ENG_Forms]

1] FORM_SYS_AddUser:                  // Add a new system user
2] FORM_SYS_AddRole:                  // Add a new user role
3] FORM_SYS_AddPermission:            // Define new permission
4] FORM_SYS_AddRolePermission:        // Assign permission to a role
5] FORM_SYS_AddDocument:              // Upload/Register a system document [NEW]
6] FORM_SYS_AddPubHoliday:            // Add a public holiday [NEW]

7] FORM_HRM_AddDepartment:            // Add a new HR department
8] FORM_HRM_AddEmployee:              // Add a new employee record
9] FORM_HRM_AddAttendance:            // Record employee attendance (Single)
10] FORM_HRM_AddLeave:                // Add leave request/record
11] FORM_HRM_AddAdvance:              // Add salary advance request
12] FORM_HRM_AddOverTime:             // Add overtime record
13] FORM_HRM_AddDeduction:            // Add salary deduction

14] FORM_PRJ_AddMain:                 // Add new main project info
15] FORM_PRJ_AddClient:               // Add a new project client
16] FORM_PRJ_AddTask:                 // Add a task to a project
17] FORM_PRJ_AddMaterial:             // Add project material item

18] FORM_FIN_AddDirectExpense:        // Add direct financial expense
19] FORM_FIN_AddInDirectExpense_Time: // Add indirect expense (time based)
20] FORM_FIN_AddInDirectExpense_NoTime:// Add indirect expense (non-time)
21] FORM_FIN_AddPRJ_Revenue:          // Add project revenue record
22] FORM_FIN_AddCustody:              // Add financial custody record
23] FORM_FIN_AddHRM_Payroll:          // Generate HRM payroll entry

==============================================================================================

        ۩✲۞✲۞✲۞✲۞✲۞✲۞✲۞✲۞✲۞✲۞✲۞✲۞✲۩
       ❉❉❉❉   DETAILED VIEW FORMS   ❉❉❉❉
        ۩✲۞✲۞✲۞✲۞✲۞✲۞✲۞✲۞✲۞✲۞✲۞✲۞✲۩
______________________________________________________________________________________________________________________________________________________________
// --- The following "View" forms are for viewing the details of a single data record as well as the option to edit data based on the user access rights ---
 // (Each form opens a detailed view for a single entry; often containing "Related_View" tabs for sub-data.) __________________________________________________
_______________________________________________________________________________________________________________/

==> Tab Name in the Google Sheet: [ENG_Forms]

1] FORM_SYS_ViewUser:               // View details of a single system user (includes Audit Log tab)
2] FORM_SYS_ViewRole:               // View details of a specific user role (includes Permissions tab)
3] FORM_SYS_ViewPermission:         // View specific permission details
4] FORM_SYS_ViewRolePermission:     // View role-to-permission assignment
5] FORM_SYS_ViewAuditLog:           // View a detailed entry from the audit log
6] FORM_SYS_ViewSession:            // View a single session’s details
7] FORM_SYS_ViewDocument:           // View document details [NEW]
8] FORM_SYS_ViewPubHoliday:         // View holiday details [NEW]

9] FORM_HRM_ViewDepartment:         // View department details (includes Employee List tab)
10] FORM_HRM_ViewEmployee:          // View employee 360 profile (includes Attendance, Leaves, Financials)
11] FORM_HRM_ViewAttendance:        // View details of an attendance record
12] FORM_HRM_ViewLeave:             // View details of a leave request
13] FORM_HRM_ViewAdvance:           // View salary advance details
14] FORM_HRM_ViewOverTime:          // View details of an overtime record
15] FORM_HRM_ViewDeduction:         // View details of a deduction

16] FORM_PRJ_ViewMain:              // View project 360 dashboard (includes Tasks, Expenses, Revenue)
17] FORM_PRJ_ViewClient:            // View client details (includes Projects list)
18] FORM_PRJ_ViewTask:              // View a project task’s details
19] FORM_PRJ_ViewMaterial:          // View material details

20] FORM_FIN_ViewDirectExpense:             // View direct expense details
21] FORM_FIN_ViewInDirectExpense_Time:      // View time-based expense details
22] FORM_FIN_ViewInDirectExpense_NoTime:    // View non-time expense details
23] FORM_FIN_ViewPRJ_Revenue:       // View project revenue details
24] FORM_FIN_ViewCustody:           // View custody record details
25] FORM_FIN_ViewHRM_Payroll:       // View payroll entry details

==============================================================================================

        ۩✲۞✲۞✲۞✲۞✲۞✲۞✲۞✲۞✲۞✲۞✲۞✲۞✲۩
       ❉❉❉    VIEWING LIST OF DATA    ❉❉❉
        ۩✲۞✲۞✲۞✲۞✲۞✲۞✲۞✲۞✲۞✲۞✲۞✲۞✲۩
_______________________________________________________________________
// --- The following list refers to "Module Views" (ENG_Views tab) --- |__________
// Each "View" represents a listing screen (table or grid) in the application UI. |
// Configured in [ENG_Views] and defines the Source Sheet.                        |
__________________________________________________________________________________//

==> Tab Name in the Google Sheet: [ENG_Views]

1] VIEW_SYS_Users:               // List of all system users
2] VIEW_SYS_Roles:               // List of all user roles
3] VIEW_SYS_Permissions:         // List of all permissions
4] VIEW_SYS_RolePermissions:     // List of all role assignments
5] VIEW_SYS_AuditLog:            // List of audit logs
6] VIEW_SYS_Sessions:            // List of user sessions
7] VIEW_SYS_Documents:           // List of system documents [NEW]
8] VIEW_SYS_PubHolidays:         // List of public holidays [NEW]

9] VIEW_HRM_Departments:         // List of departments
10] VIEW_HRM_Employees:          // List of employees
11] VIEW_HRM_Attendance:         // List of attendance records
12] VIEW_HRM_Leave:              // List of leave requests
13] VIEW_HRM_Advances:           // List of salary advances
14] VIEW_HRM_OverTime:           // List of overtime records
15] VIEW_HRM_Deductions:         // List of deductions

16] VIEW_PRJ_Main:               // List of projects
17] VIEW_PRJ_Clients:            // List of clients
18] VIEW_PRJ_Tasks:              // List of tasks
19] VIEW_PRJ_Material:           // List of materials

20] VIEW_FIN_DirectExpenses:             // List of direct expenses
21] VIEW_FIN_InDirectExpenses_Time:      // List of time-based indirect expenses
22] VIEW_FIN_InDirectExpenses_NoTime:    // List of non-time indirect expenses
23] VIEW_FIN_PRJ_Revenue:        // List of project revenues
24] VIEW_FIN_Custody:            // List of custody records
25] VIEW_FIN_HRM_Payroll:        // List of payroll entries

==============================================================================================