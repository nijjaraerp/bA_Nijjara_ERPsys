const SHEET_ID = "1anq5RkM_vEIyYtMpakE69kXP2XWQkPlxdfYgvmVF3ls";
const ERP_SCHEMA = {
  DBUG_AppLog: [
    "DBG_ID",
    "Time_Stamp",
    "Actor",
    "Action",
    "Entity",
    "Entity_ID",
    "Details",
  ],
  DBUG_WarnLog: [
    "DBG_WARN_ID",
    "Time_Stamp",
    "Actor",
    "Action",
    "Entity",
    "Entity_ID",
    "Details",
  ],
  DBUG_ErrorLog: [
    "DBG_ERR_ID",
    "Time_Stamp",
    "Actor",
    "Action",
    "Entity",
    "Entity_ID",
    "Message",
  ],
  ENG_Forms: [
    "FORM_ID",
    "Form_Label",
    "Tab_ID",
    "Tab_Label",
    "Field_ID",
    "Field_Label",
    "Field_Type",
    "Field_Can_Edit",
    "Source_Sheet",
    "Source_Columns",
    "Is_Mandatory",
    "Default_Value",
    "DD_ID",
    "Target_Sheet",
    "Target_Column",
    "ROL_ID",
    "Is_Visible",
    "But_ID",
  ],
  ENG_Views: ["VIEW_ID", "View_Title", "Source_Sheet", "Source_Columns"],
  ENG_Buttons: ["BTN_ID", "BTN_Label", "BTN_Type", "BTN_Description"],
  ENG_Dropdowns: ["DD_ID", "DD_EN", "DD_AR", "DD_Is_Active", "DD_Sort_Order"],
  ENG_Settings: [
    "Setting_Key",
    "Setting_Value",
    "Description_EN",
    "Updated_By",
    "Updated_At",
  ],
  SYS_Dashboard: [
    "SYS_Dash_ID",
    "SYS_Metric_Code",
    "SYS_Metric_Value",
    "SYS_Dash_Date",
  ],
  SYS_Documents: [
    "DOC_ID",
    "DOC_Entity",
    "DOC_Entity_ID",
    "DOC_File_Name",
    "DOC_Label",
    "DOC_Drive_URL",
    "DOC_Upload_By",
    "DOC_Crt_At",
  ],
  SYS_Users: [
    "USR_ID",
    "EMP_Name_EN",
    "USR_Name",
    "EMP_Email",
    "Job_Title",
    "DEPT_Name",
    "Password_Hash",
    "Last_Login",
    "USR_Crt_At",
    "USR_Crt_By",
    "USR_Upd_At",
    "USR_Upd_By",
  ],
  SYS_Roles: [
    "ROL_ID",
    "ROL_Title",
    "ROL_Notes",
    "ROL_Is_System",
    "ROL_Crt_At",
    "ROL_Crt_By",
    "ROL_Upd_At",
    "ROL_Upd_By",
  ],
  SYS_Permissions: [
    "PRM_ID",
    "PRM_Name",
    "PRM_Notes",
    "PRM_Catg",
    "PRM_Crt_At",
    "PRM_Crt_By",
    "PRM_Upd_At",
    "PRM_Upd_By",
  ],
  SYS_Role_Permissions: [
    "ROL_ID",
    "PRM_ID",
    "SRP_Scope",
    "SRP_Is_Allowed",
    "SRP_Constraints",
    "SRP_Crt_At",
    "SRP_Crt_By",
    "SRP_Upd_At",
    "SRP_Upd_By",
  ],
  SYS_Audit_Log: [
    "AUD_ID",
    "AUD_Time_Stamp",
    "USR_ID",
    "USR_Name",
    "USR_Action",
    "ACT_Description",
    "AUD_Entity",
    "AUD_Entity_ID",
    "AUD_Scope",
    "AUD_Sheet_ID",
    "AUD_Sheet_Name",
    "IP_Address",
  ],
  SYS_Sessions: [
    "SESS_ID",
    "USR_ID",
    "EMP_Email",
    "Actor_USR_ID",
    "SESS_Type",
    "SESS_Status",
    "IP_Address",
    "Auth_Token",
    "SESS_Start_At",
    "SESS_End_At",
    "SESS_Crt_At",
    "SESS_Crt_By",
    "SESS_Revoked_At",
    "SESS_Revoked_By",
    "SESS_Metadata",
  ],
  SYS_PubHolidays: ["PUBHOL_ID", "Pub_Holiday_Date", "Pub_Holiday_Name"],
  SYS_Analysis: [
    "SYS_ANA_ID",
    "SYS_ANA_Date",
    "SYS_ANA_Start",
    "SYS_ANA_End",
    "SYS_ANA_Item1",
    "SYS_ANA_Item2",
    "SYS_ANA_Item3",
    "SYS_ANA_Item4",
    "SYS_ANA_Item5",
    "SYS_ANA_Item6",
    "SYS_ANA_Item7",
    "SYS_ANA_Item8",
    "SYS_ANA_Item9",
  ],
  HRM_Dashboard: [
    "HR_Dash_ID",
    "HR_Metric_Code",
    "HR_Metric_Value",
    "HR_Dash_Date",
  ],
  HRM_Departments: [
    "DEPT_ID",
    "DEPT_Name",
    "DEPT_Is_Active",
    "DEPT_Sort_Order",
    "DEPT_Crt_At",
    "DEPT_Crt_By",
    "DEPT_Upd_At",
    "DEPT_Upd_By",
  ],
  HRM_Employees: [
    "EMP_ID",
    "EMP_Name_EN",
    "EMP_Name_AR",
    "Date_of_Birth",
    "Gender",
    "Nationality",
    "Marital_Status",
    "Military_Status",
    "EMP_Mob_Main",
    "EMP_Mob_Sub",
    "Home_Address",
    "EMP_Email",
    "EmrCont_Name",
    "EmrCont_Relation",
    "EmrCont_Mob",
    "Job_Title",
    "DEPT_Name",
    "Hire_Date",
    "EMP_CONT_Type",
    "Basic_Salary",
    "Allowances",
    "Deducts",
    "EMP_Crt_At",
    "EMP_Crt_By",
  ],
  HRM_Attendance: [
    "ATT_ID",
    "EMP_ID",
    "ATT_Date",
    "ATT_Check_In",
    "ATT_Check_Out",
    "ATT_Late_Mints",
    "ATT_EarlyLV_Mints",
    "ATT_OT_Mints",
    "ATT_Notes",
    "ATT_Status",
    "ATT_Crt_At",
    "ATT_Crt_By",
    "ATT_Upd_At",
    "ATT_Upd_By",
  ],
  HRM_Leave: [
    "LV_ID",
    "EMP_ID",
    "LV_Type",
    "LV_Start_Date",
    "LV_End_Date",
    "LV_NumDays",
    "LV_Approved_By",
    "LV_Notes",
    "LV_Crt_At",
    "LV_Crt_By",
    "LV_Upd_At",
    "LV_Upd_By",
  ],
  HRM_Advances: [
    "ADV_ID",
    "EMP_ID",
    "ADV_Issue_Date",
    "ADV_Amnt",
    "ADV_Setlmnt_Period",
    "ADV_Notes",
    "ADV_Status",
    "ADV_Crt_At",
    "ADV_Crt_By",
    "ADV_Upd_At",
    "ADV_Upd_By",
  ],
  HRM_OverTime: [
    "OT_ID",
    "EMP_ID",
    "POL_OT_ID",
    "ATT_Date",
    "ATT_OT_Mints",
    "OT_Amnt",
    "OT_Crt_At",
    "OT_Crt_By",
    "OT_Upd_At",
    "OT_Upd_By",
  ],
  HRM_Deductions: [
    "DEDCT_ID",
    "PEN_ID",
    "PEN_Name",
    "EMP_ID",
    "DEDCT_Date",
    "DEDCT_Amnt",
    "DEDCT_Crt_At",
    "DEDCT_Crt_By",
    "DEDCT_Upd_At",
    "DEDCT_Upd_By",
  ],
  HRM_Analysis: [
    "HR_ANA_ID",
    "HR_ANA_Date",
    "HR_ANA_Start",
    "HR_ANA_End",
    "HR_ANA_Item1",
    "HR_ANA_Item2",
    "HR_ANA_Item3",
    "HR_ANA_Item4",
    "HR_ANA_Item5",
    "HR_ANA_Item6",
    "HR_ANA_Item7",
    "HR_ANA_Item8",
    "HR_ANA_Item9",
  ],
  PRJ_Dashboard: [
    "PRJ_Dash_ID",
    "PRJ_Metric_Code",
    "PRJ_Metric_Value",
    "PRJ_Dash_Date",
  ],
  PRJ_Main: [
    "PRJ_ID",
    "PRJ_Name",
    "CLI_ID",
    "CLI_Name",
    "PRJ_Status",
    "PRJ_Type",
    "PRJ_Budget",
    "Plan_Start_Date",
    "PRJ_Location",
    "PRJ_Crt_At",
    "PRJ_Crt_By",
    "PRJ_Upd_At",
    "PRJ_Upd_By",
  ],
  PRJ_Clients: [
    "CLI_ID",
    "CLI_Name",
    "CLI_Mob_1",
    "CLI_Mob_2",
    "CLI_Email",
    "CLI_Crt_At",
    "CLI_Crt_By",
    "CLI_Upd_At",
    "CLI_Upd_By",
  ],
  PRJ_Tasks: [
    "TSK_ID",
    "PRJ_ID",
    "TSK_Name",
    "TSK_Priority",
    "EMP_ID",
    "TSK_Plan_Start",
    "TSK_Start",
    "TSK_End",
    "TSK_Status",
    "TSK_Crt_At",
    "TSK_Crt_By",
    "TSK_Upd_At",
    "TSK_Upd_By",
  ],
  PRJ_Material: [
    "MAT_ID",
    "MAT_Name",
    "MAT_Catg",
    "MAT_Sub1",
    "MAT_Sub2",
    "Default_Unit",
    "MAT_Active",
    "MAT_Crt_At",
    "MAT_Crt_By",
    "MAT_Upd_At",
    "MAT_Upd_By",
  ],
  PRJ_IndirExp_Time_Alloc: [
    "ALO_TM_ID",
    "InDiEXP_TM_ID",
    "PRJ_ID",
    "ALO_TM_Methd",
    "ALO_TM_Amnt",
    "ALO_TM_Crt_At",
    "ALO_TM_Crt_By",
    "ALO_TM_Upd_At",
    "ALO_TM_Upd_By",
  ],
  PRJ_IndirExp_NoTime_Alloc: [
    "ALO_NT_ID",
    "InDiEXP_NT_ID",
    "PRJ_ID",
    "ALO_NT_Methd",
    "ALO_NT_Amnt",
    "ALO_NT_Crt_At",
    "ALO_NT_Crt_By",
    "ALO_NT_Upd_At",
    "ALO_NT_Upd_By",
  ],
  PRJ_Plan_vs_Actual: [
    "PvA_ID",
    "PRJ_ID",
    "PRJ_Name",
    "Plan_Start_Date",
    "Actual_Start_Date",
    "Actual_Num_Days",
    "Plan_End_Date",
    "Actual_End_Date",
    "Plan_Direct_Exp",
    "Actual_Direct_Exp",
    "Actual_MATs",
    "PvA_Crt_At",
    "PvA_Crt_By",
    "PvA_Upd_At",
    "PvA_Upd_By",
  ],
  PRJ_Analysis: [
    "PRJ_ANA_ID",
    "PRJ_ANA_Item1",
    "PRJ_ANA_Item2",
    "PRJ_ANA_Item3",
    "PRJ_ANA_Item4",
    "PRJ_ANA_Item5",
    "PRJ_ANA_Item6",
    "PRJ_ANA_Item7",
    "PRJ_ANA_Item8",
    "PRJ_ANA_Item9",
  ],
  FIN_Dashboard: [
    "FIN_Dash_ID",
    "FIN_Metric_Code",
    "FIN_Metric_Value",
    "FIN_Dash_Date",
  ],
  FIN_DirectExpenses: [
    "DiEXP_ID",
    "PRJ_ID",
    "PRJ_Name",
    "DiEXP_Date",
    "MAT_ID",
    "MAT_Name",
    "MAT_Sub2",
    "Default_Unit",
    "Default_Price",
    "MAT_Quantity",
    "DiEXP_Total_VAT_Exc",
    "DiEXP_Total_VAT_Inc",
    "DiEXP_Pay_Status",
    "DiEXP_Pay_Methd",
    "DiEXP_Notes",
    "ADV_Crt_At",
    "ADV_Crt_By",
    "ADV_Upd_At",
    "ADV_Upd_By",
  ],
  FIN_InDirectExpenses_Time: [
    "InDiEXP_TM_ID",
    "InDiEXP_TM_Catg",
    "InDiEXP_TM_Sub1",
    "InDiEXP_Start",
    "InDiEXP_End",
    "InDiEXP_TM_Pay_Status",
    "InDiEXP_TM_Pay_Methd",
    "InDiEXP_TM_Notes",
    "ADV_Crt_At",
    "ADV_Crt_By",
    "ADV_Upd_At",
    "ADV_Upd_By",
  ],
  FIN_InDirectExpenses_NoTime: [
    "InDiEXP_NT_ID",
    "InDiEXP_NT_Catg",
    "InDiEXP_NT_Sub1",
    "Useful_Life_Months",
    "Depreciation_Start_Date",
    "InDiEXP_NT_Pay_Status",
    "InDiEXP_NT_Pay_Methd",
    "InDiEXP_NT_Notes",
    "ADV_Crt_At",
    "ADV_Crt_By",
    "ADV_Upd_At",
    "ADV_Upd_By",
  ],
  FIN_PRJ_Revenue: [
    "REV_ID",
    "PRJ_ID",
    "REV_Date",
    "REV_Amnt",
    "REV_Type",
    "REV_Source",
    "REV_Pay_Methd",
    "REV_Invoice_Number",
    "REV_Pay_Status",
    "REV_Total",
    "REV_Remain",
    "ADV_Crt_At",
    "ADV_Crt_By",
    "ADV_Upd_At",
    "ADV_Upd_By",
  ],
  FIN_Custody: [
    "CSTD_ID",
    "EMP_ID",
    "EMP_Name",
    "PRJ_ID",
    "PRJ_Name",
    "CSTD_Issue_Date",
    "CSTD_Amnt",
    "CSTD_Purpose",
    "CSTD_Status",
    "CSTD_Notes",
    "ADV_Crt_At",
    "ADV_Crt_By",
    "ADV_Upd_At",
    "ADV_Upd_By",
  ],
  FIN_HRM_Payroll: [
    "PAY_ID",
    "EMP_ID",
    "EMP_Name",
    "PAY_Start_Date",
    "PAY_End_Date",
    "Basic_Salary",
    "Total_OT_Amnt",
    "ADV_Instal",
    "Total_DEDCT_Amnt",
    "PAY_Net_Pay",
    "PAY_Status",
    "ADV_Crt_At",
    "ADV_Crt_By",
    "ADV_Upd_At",
    "ADV_Upd_By",
  ],
  FIN_PandL_Statements: [
    "PL_ID",
    "Rev_ID",
    "DiEXP_ID",
    "InDiEXP_TM_ID",
    "InDiEXP_NT_ID",
    "Total_Rev",
    "Total_DiEXP",
    "Total_InDiEXP_TM",
    "Total_InDiEXP_NT",
    "PL_Start_Date",
    "PL_End_Date",
    "ADV_Crt_At",
    "ADV_Crt_By",
    "ADV_Upd_At",
    "ADV_Upd_By",
  ],
  FIN_Analysis: [
    "FIN_ANA_ID",
    "FIN_ANA_Item1",
    "FIN_ANA_Item2",
    "FIN_ANA_Item3",
    "FIN_ANA_Item4",
    "FIN_ANA_Item5",
    "FIN_ANA_Item6",
    "FIN_ANA_Item7",
    "FIN_ANA_Item8",
    "FIN_ANA_Item9",
  ],
};
function createErpSchema() {
  var ss = SpreadsheetApp.openById(SHEET_ID);
  Object.keys(ERP_SCHEMA).forEach(function (tab) {
    try {
      ensureHeaders_(ss, tab, ERP_SCHEMA[tab]);
    } catch (e) {
      Logger.log("createErpSchema error => " + tab + " :: " + String(e));
    }
  });
  return { ok: true };
}
function seedSystemData() {
  var ss = SpreadsheetApp.openById(SHEET_ID);
  ensureHeaders_(ss, "SYS_Roles", ERP_SCHEMA["SYS_Roles"]);
  ensureHeaders_(ss, "SYS_Permissions", ERP_SCHEMA["SYS_Permissions"]);
  ensureHeaders_(ss, "SYS_Users", ERP_SCHEMA["SYS_Users"]);
  clearDataRows_(ss.getSheetByName("SYS_Roles"));
  clearDataRows_(ss.getSheetByName("SYS_Permissions"));
  clearDataRows_(ss.getSheetByName("SYS_Users"));
  try {
    var roles = [
      {
        ROL_Title: "Super Admin",
        ROL_Notes: "All access",
        ROL_Is_System: true,
      },
      {
        ROL_Title: "Manager",
        ROL_Notes: "Department management",
        ROL_Is_System: false,
      },
      {
        ROL_Title: "Accountant",
        ROL_Notes: "Finance operations",
        ROL_Is_System: false,
      },
      {
        ROL_Title: "HR Specialist",
        ROL_Notes: "HR operations",
        ROL_Is_System: false,
      },
      { ROL_Title: "Employee", ROL_Notes: "Restricted", ROL_Is_System: false },
    ];
    var rolesSheet = ss.getSheetByName("SYS_Roles");
    var rHeaders = getHeaders_(rolesSheet);
    for (var i = 0; i < roles.length; i++) {
      var row = {};
      row["ROL_ID"] = nextId_(rolesSheet, rHeaders, "ROL_ID");
      row["ROL_Title"] = roles[i].ROL_Title;
      row["ROL_Notes"] = roles[i].ROL_Notes;
      row["ROL_Is_System"] = roles[i].ROL_Is_System;
      row["ROL_Crt_At"] = new Date();
      row["ROL_Crt_By"] = "system";
      insertRowByHeaders_(rolesSheet, rHeaders, row);
    }
    var perms = [
      {
        PRM_Name: "VIEW_DASHBOARD",
        PRM_Catg: "SYS",
        PRM_Notes: "View system dashboard",
      },
      {
        PRM_Name: "MANAGE_USERS",
        PRM_Catg: "SYS",
        PRM_Notes: "Create and update users",
      },
      {
        PRM_Name: "MANAGE_ROLES",
        PRM_Catg: "SYS",
        PRM_Notes: "Manage roles and permissions",
      },
      {
        PRM_Name: "MANAGE_HRM",
        PRM_Catg: "HRM",
        PRM_Notes: "HR module operations",
      },
      {
        PRM_Name: "MANAGE_FINANCE",
        PRM_Catg: "FIN",
        PRM_Notes: "Finance module operations",
      },
    ];
    var permSheet = ss.getSheetByName("SYS_Permissions");
    var pHeaders = getHeaders_(permSheet);
    for (var j = 0; j < perms.length; j++) {
      var prow = {};
      prow["PRM_ID"] = nextId_(permSheet, pHeaders, "PRM_ID");
      prow["PRM_Name"] = perms[j].PRM_Name;
      prow["PRM_Notes"] = perms[j].PRM_Notes;
      prow["PRM_Catg"] = perms[j].PRM_Catg;
      prow["PRM_Crt_At"] = new Date();
      prow["PRM_Crt_By"] = "system";
      insertRowByHeaders_(permSheet, pHeaders, prow);
    }
    var usersSheet = ss.getSheetByName("SYS_Users");
    var uHeaders = getHeaders_(usersSheet);
    var mkHash = hashSha256Hex_("210388");
    var users = [
      {
        EMP_Name_EN: "Mohamed Sherif Elkhoraiby",
        USR_Name: "mkhoraiby",
        EMP_Email: "melkhoraiby@gmail.com",
        Job_Title: "Super Admin",
        DEPT_Name: "Management",
        Password_Hash: mkHash,
      },
      {
        EMP_Name_EN: "Ahmed Manager",
        USR_Name: "ahmed.manager",
        EMP_Email: "ahmed.manager@example.com",
        Job_Title: "Manager",
        DEPT_Name: "Operations",
        Password_Hash: hashSha256Hex_("password1"),
      },
      {
        EMP_Name_EN: "Sarah HR",
        USR_Name: "sarah.hr",
        EMP_Email: "sarah.hr@example.com",
        Job_Title: "HR Specialist",
        DEPT_Name: "HR",
        Password_Hash: hashSha256Hex_("password2"),
      },
      {
        EMP_Name_EN: "Omar Accountant",
        USR_Name: "omar.accountant",
        EMP_Email: "omar.accountant@example.com",
        Job_Title: "Accountant",
        DEPT_Name: "Finance",
        Password_Hash: hashSha256Hex_("password3"),
      },
      {
        EMP_Name_EN: "Yara Employee",
        USR_Name: "yara.employee",
        EMP_Email: "yara.employee@example.com",
        Job_Title: "Employee",
        DEPT_Name: "General",
        Password_Hash: hashSha256Hex_("password4"),
      },
    ];
    for (var k = 0; k < users.length; k++) {
      var urow = {};
      urow["USR_ID"] = nextId_(usersSheet, uHeaders, "USR_ID");
      urow["EMP_Name_EN"] = users[k].EMP_Name_EN;
      urow["USR_Name"] = users[k].USR_Name;
      urow["EMP_Email"] = users[k].EMP_Email;
      urow["Job_Title"] = users[k].Job_Title;
      urow["DEPT_Name"] = users[k].DEPT_Name;
      urow["Password_Hash"] = users[k].Password_Hash;
      urow["USR_Crt_At"] = new Date();
      urow["USR_Crt_By"] = "system";
      insertRowByHeaders_(usersSheet, uHeaders, urow);
    }
  } catch (e) {
    Logger.log("seedSystemData error => " + String(e));
  }
  return { ok: true };
}
function ensureHeaders_(ss, tab, headers) {
  var sheet = ss.getSheetByName(tab) || ss.insertSheet(tab);
  var lastCol = sheet.getLastColumn();
  var existing =
    lastCol > 0
      ? sheet
          .getRange(1, 1, 1, lastCol)
          .getValues()[0]
          .map(function (v) {
            return String(v).trim();
          })
      : [];
  var desired = headers.map(function (h) {
    return String(h).trim();
  });
  if (
    existing.length === 0 ||
    existing.every(function (v) {
      return v === "";
    })
  ) {
    sheet.getRange(1, 1, 1, desired.length).setValues([desired]);
  } else {
    var set = new Set(
      existing.filter(function (v) {
        return v !== "";
      })
    );
    var missing = desired.filter(function (h) {
      return !set.has(h);
    });
    if (missing.length > 0)
      sheet
        .getRange(1, existing.length + 1, 1, missing.length)
        .setValues([missing]);
  }
  if (sheet.getLastRow() < 2) sheet.insertRowsAfter(1, 1);
  sheet.setFrozenRows(1);
  sheet
    .getRange(1, 1, sheet.getMaxRows(), sheet.getMaxColumns())
    .setFontFamily("Cairo");
}
function clearDataRows_(sheet) {
  if (!sheet) return;
  var lastRow = sheet.getLastRow();
  if (lastRow > 2) sheet.deleteRows(3, lastRow - 2);
}
function getHeaders_(sheet) {
  return sheet
    .getRange(1, 1, 1, sheet.getLastColumn())
    .getValues()[0]
    .map(function (v) {
      return String(v).trim();
    });
}
function nextId_(sheet, headers, idColName) {
  var idx = headers.indexOf(idColName);
  if (idx < 0) return 1;
  var lastRow = sheet.getLastRow();
  if (lastRow <= 2) return 1;
  var values = sheet.getRange(3, idx + 1, lastRow - 2, 1).getValues();
  var maxId = 0;
  for (var i = 0; i < values.length; i++) {
    var n = Number(values[i][0]);
    if (!isNaN(n)) maxId = Math.max(maxId, n);
  }
  return maxId + 1;
}
function insertRowByHeaders_(sheet, headers, obj) {
  var row = headers.map(function (h) {
    return obj[h] !== undefined ? obj[h] : "";
  });
  var targetRow = Math.max(3, sheet.getLastRow() + 1);
  sheet.getRange(targetRow, 1, 1, headers.length).setValues([row]);
}
function hashSha256Hex_(text) {
  var raw = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, text);
  var out = [];
  for (var i = 0; i < raw.length; i++) {
    var v = (raw[i] + 256) % 256;
    var h = v.toString(16);
    if (h.length === 1) h = "0" + h;
    out.push(h);
  }
  return out.join("");
}
