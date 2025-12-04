# **Nijjara ERP: Core Architecture & Smart Engine Protocol**

**Version:** 2.0 (FINAL GOLDEN MASTER)
**Status:** Approved by The Lead
**Language:** English (Technical Specification)

---

## **1.0 EXECUTIVE SUMMARY**

This document defines the technical architecture for the Nijjara ERP system. The system is designed as a **Metadata-Driven Single Page Application (SPA)** backed by Google Sheets.

**Core Philosophy:** "Convention over Configuration."
The application logic does **not** hardcode field names, labels, or table structures. Instead, the Google Sheet data tabs describe themselves, and the Backend Script acts as a generic engine that reads these descriptions to render the UI dynamically.

---

## **2.0 THE "SMART HEADER" PROTOCOL (The 3-Row Rule)**

**CRITICAL:** This is the foundation of the entire data handling layer. Every Data Sheet (e.g., `HRM_Employees`, `PRJ_Main`) **MUST** adhere to this structure.

### **2.1 Header Structure (Rows 1-3)**

| Row Number | Technical Name | Logic & Purpose                                                                                                                                         | Mutability                                          |
| :--------- | :------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------ | :-------------------------------------------------- |
| **Row 1**  | `SYSTEM_KEY`   | The internal unique identifier for the column (e.g., `emp_id`, `full_name_ar`). Used by the API/Code to map JSON keys.                                  | **IMMUTABLE** (Never change after code deployment). |
| **Row 2**  | `UI_LABEL`     | The Arabic label shown in the UI (e.g., `معرّف الموظف`, `الاسم بالكامل`). The system **MUST** read this string to render Form Labels and Table Headers. | **MUTABLE** (Can be changed anytime by the admin).  |
| **Row 3**  | `VIEW_FLAG`    | Controls visibility in the "List View" (Grid).                                                                                                          | **MUTABLE** (Admin controls visibility).            |

### **2.2 Data Ingestion Rule (Row 4+)**

- **SKIP ROW 3:** The system must strictly ignore Row 3 when reading/writing data.
- **START AT ROW 4:** All actual data records (Create/Read/Update/Delete) **MUST start from Row 4**.
- **Reasoning:** Row 3 is reserved for Configuration Flags (e.g., "SHOW"), not data.

### **2.3 Logic for `VIEW_FLAG` (Row 3)**

- **IF** Cell contains `"SHOW"` (case-insensitive) → **THEN** Include this column in the Data Grid / List View.
- **IF** Cell is `Empty` → **THEN** Exclude this column from the Data Grid (Hidden from list, but accessible in Detailed View Forms).

### **2.4 Example Implementation**

_Sheet: `HRM_Employees`_

| Row   | Col A        | Col B           | Col C        | Col D            |
| :---- | :----------- | :-------------- | :----------- | :--------------- |
| **1** | `emp_id`     | `full_name`     | `phone_num`  | `basic_salary`   |
| **2** | `كود الموظف` | `الاسم بالكامل` | `رقم الهاتف` | `الراتب الأساسي` |
| **3** | `SHOW`       | `SHOW`          | `SHOW`       | _(Empty)_        |
| **4** | `HRM-1001`   | `Ahmed Ali`     | `010xxxx`    | `5000`           |

- **UI Result:** The "Employees List" page will automatically generate a table with 3 columns using the **Arabic Headers from Row 2**: _كود الموظف, الاسم بالكامل, رقم الهاتف_.

---

## **3.0 DATA INTEGRITY & AUTOMATION RULES**

### **3.1 Smart ID Generation (No Random Strings)**

The system must generate Clean, Sequential, Readable IDs. Random UUIDs (e.g., `a1-b2-x9`) are **FORBIDDEN** for user-facing IDs.

- **Format:** `[PREFIX]-[NUMBER]`
- **Logic:**
  1.  Read the last ID in the column (starting from Row 4).
  2.  Extract the number.
  3.  Increment by 1.
  4.  Format with the module prefix.
- **Examples:**
  - `SYS_Users` → `SYS-1001`, `SYS-1002`
  - `HRM_Employees` → `HRM-1001`
  - `PRJ_Main` → `PRJ-5001`

### **3.2 Smart Search & Lookups**

- Any form field defined as `Smart_Lookup` in the Engine must trigger a live search against the target sheet.
- **User Experience:** User types "Ahmed" → System searches Name/Email/Phone in `HRM_Employees` → User selects "Ahmed Ali" → System captures `EMP_ID` hiddenly.

---

## **4.0 UX/UI ARCHITECTURE**

### **4.1 The "Living" Home Page**

The Home Page must not be empty. It must pull summary data from the Dashboard sheets:

- **Source:** Read the last row of `SYS_Dashboard`, `HRM_Dashboard`, etc.
- **Display:** Show KPI Cards (e.g., "Active Projects: 5", "Total Staff: 50") immediately upon login.

### **4.2 Navigation Structure**

- **Sidebar/Dock:** A persistent navigation bar containing the 4 Main Module Icons.
- **Module Hub:** Clicking a module icon (e.g., HR) opens a "Module Dashboard" with a **Sub-Menu (FAB)** for specific actions (Add Employee, Request Leave).

### **4.3 Smart Attachments (`SYS_Documents`)**

- **Logic:** Forms can include an "Attachment Area".
- **Process:**
  1.  User drops files.
  2.  System uploads to Google Drive.
  3.  System saves a record in `SYS_Documents` linked to the `Entity_ID` (e.g., The Project ID).
- **Viewing:** When viewing a record (e.g., Project Details), the system auto-fetches related files from `SYS_Documents`.

---

## **5.0 THE "LEAN ENGINE" CONFIGURATION**

The `ENG_...` sheets control the logic.

### **5.1 `ENG_Forms` (The Smart Form Builder)**

- **`FORM_ID`**: Unique key (e.g., `FORM_HRM_AddEmployee`).
- **`Column_Pointer`**: Matches `SYSTEM_KEY` (Row 1) in the Data Sheet.
- **`Smart_State`**:
  - `EDITABLE`: Writable always.
  - `LOCKED_ON_EDIT`: Writable in Add, Read-Only in Edit (IDs, Dates).
  - `READ_ONLY`: Always Read-Only.
- **`DYN_Link`**: `DYN_...` for dynamic lookups, `DD_...` for static dropdowns.

### **5.2 `ENG_Settings` (The Mapper)**

Maps `FORM_ID` to `Target_Sheet`. (e.g., `FORM_MASTER:FORM_HRM_AddEmployee` = `HRM_Employees`).

---

## **6.0 APPENDIX: APPROVED SYSTEM DEFINITIONS (THE IDs)**

_Strict implementation required._

### **6.1 Module 1: SYSTEM ADMINISTRATION (SYS)**

- **Forms:** `FORM_SYS_AddUser` (Smart Lookup), `FORM_SYS_AddRole`, `FORM_SYS_AddDocument`, `FORM_SYS_AddPubHoliday`.
- **Views:** `VIEW_SYS_Users`, `VIEW_SYS_Roles`, `VIEW_SYS_AuditLog`, `VIEW_SYS_Sessions`, `VIEW_SYS_Documents`.
- **Details:** `FORM_SYS_ViewUser` (Tabs: Profile, Activity, Sessions).

### **6.2 Module 2: HUMAN RESOURCES (HRM)**

- **Forms:** `FORM_HRM_AddDepartment`, `FORM_HRM_AddEmployee` (Tabs: Personal/Job/Finance), `FORM_HRM_AddAttendance`, `FORM_HRM_AddLeave`, `FORM_HRM_AddAdvance`, `FORM_HRM_AddOverTime`, `FORM_HRM_AddDeduction`.
- **Views:** `VIEW_HRM_Employees` (Filters: Dept, Status), `VIEW_HRM_Attendance`, `VIEW_HRM_Leave`, `VIEW_HRM_Advances`.
- **Details:** `FORM_HRM_ViewEmployee` (360 Profile: History of Attendance, Finance, Leaves).

### **6.3 Module 3: PROJECT MANAGEMENT (PRJ)**

- **Forms:** `FORM_PRJ_AddMain`, `FORM_PRJ_AddClient`, `FORM_PRJ_AddTask`, `FORM_PRJ_AddMaterial`.
- **Views:** `VIEW_PRJ_Main` (Project Portfolio), `VIEW_PRJ_Clients`, `VIEW_PRJ_Tasks`, `VIEW_PRJ_Material`.
- **Details:** `FORM_PRJ_ViewMain` (Dashboard: Overview, Financials [Direct/Indirect], Tasks).

### **6.4 Module 4: FINANCE (FIN)**

- **Forms:**
  - `FORM_FIN_AddDirectExpense` (Includes "Pay via Custody" logic).
  - `FORM_FIN_AddInDirectExpense_Time` (Auto-Allocation based on Time Overlap).
  - `FORM_FIN_AddInDirectExpense_NoTime` (Auto-Allocation based on Budget Share).
  - `FORM_FIN_AddPRJ_Revenue`.
  - `FORM_FIN_AddCustody`.
  - `FORM_FIN_AddHRM_Payroll`.
- **Views:** `VIEW_FIN_DirectExpenses`, `VIEW_FIN_InDirectExpenses_Time`, `VIEW_FIN_PRJ_Revenue`, `VIEW_FIN_Custody`, `VIEW_FIN_HRM_Payroll`.

---

**End of Protocol v2.0**
