// =============================================================================
//  SMART ENGINE V2 - FULL ERP SETUP (PRODUCTION READY)
//  Description: Complete Schema, Bilingual Headers, Smart Views, and Data Seeding.
// =============================================================================

// --- 1. CONFIGURATION & COLORS ---

const COLOR_MAP = {
  DBUG: "#f3f3f3", // Light Grey
  ENG: "#000000", // Black (Engine)
  SYS: "#cfe2f3", // Blue
  HRM: "#ead1dc", // Purple/Pink
  PRJ: "#d0e0e3", // Teal
  FIN: "#d9ead3", // Green
};

// --- 2. MASTER ERP SCHEMA ---
// Format: [ "Col_Code_EN", "Col_Label_AR", "List_View_Flag" ]

const ERP_SCHEMA = {
  // ==========================
  // 1. DEBUG & LOGGING
  // ==========================
  DBUG_AppLog: [
    ["DBG_ID", "معرف السجل", "SHOW"],
    ["Time_Stamp", "الطابع الزمني", "SHOW"],
    ["Actor", "الفاعل", "SHOW"],
    ["Action", "الحدث", "SHOW"],
    ["Entity", "الكيان", "SHOW"],
    ["Entity_ID", "معرف الكيان", "SHOW"],
    ["Details", "التفاصيل", ""],
  ],
  DBUG_WarnLog: [
    ["DBG_WARN_ID", "معرف التحذير", "SHOW"],
    ["Time_Stamp", "الطابع الزمني", "SHOW"],
    ["Actor", "الفاعل", "SHOW"],
    ["Action", "الحدث", "SHOW"],
    ["Entity", "الكيان", "SHOW"],
    ["Entity_ID", "معرف الكيان", "SHOW"],
    ["Details", "التفاصيل", "SHOW"],
  ],
  DBUG_ErrorLog: [
    ["DBG_ERR_ID", "معرف الخطأ", "SHOW"],
    ["Time_Stamp", "الطابع الزمني", "SHOW"],
    ["Actor", "الفاعل", "SHOW"],
    ["Action", "الحدث", "SHOW"],
    ["Entity", "الكيان", "SHOW"],
    ["Entity_ID", "معرف الكيان", "SHOW"],
    ["Message", "الرسالة", "SHOW"],
  ],

  // ==========================
  // 2. ENGINE (CONFIGURATION)
  // ==========================
  ENG_Forms: [
    ["FORM_ID", "Form ID", ""],
    ["TAB_Section", "Tab/Section", ""],
    ["Column_Pointer", "Field Header", ""],
    ["Field_Type", "Input Type", ""],
    ["Smart_State", "Edit Logic", ""],
    ["DYN_Link", "Data Source", ""],
  ],
  ENG_Views: [
    ["VIEW_ID", "View ID", ""],
    ["View_Title", "Arabic Title", ""],
    ["Source_Sheet", "Source Sheet", ""],
  ],
  ENG_Dropdowns: [
    ["DD_ID", "Dropdown ID", ""],
    ["DD_EN", "Value (EN)", ""],
    ["DD_AR", "Label (AR)", ""],
    ["DD_Is_Active", "Active", ""],
    ["DD_Sort_Order", "Order", ""],
  ],
  ENG_Buttons: [
    ["BTN_ID", "Button ID", ""],
    ["BTN_Label", "Label", ""],
    ["BTN_Type", "Action Type", ""],
    ["BTN_Description", "Description", ""],
  ],
  ENG_Settings: [
    ["Setting_Key", "Key", ""],
    ["Setting_Value", "Value", ""],
    ["Description_EN", "Description", ""],
    ["Updated_By", "Updated By", ""],
    ["Updated_At", "Updated At", ""],
  ],

  // ==========================
  // 3. SYSTEM ADMINISTRATION
  // ==========================
  SYS_Dashboard: [
    ["SYS_Dash_ID", "معرف السجل", ""],
    ["SYS_Metric_Code", "كود المؤشر", ""],
    ["SYS_Metric_Value", "القيمة", ""],
    ["SYS_Dash_Date", "التاريخ", ""],
  ],
  SYS_Users: [
    ["USR_ID", "معرف المستخدم", "SHOW"],
    ["EMP_Name_EN", "الاسم (إنجليزي)", "SHOW"],
    ["USR_Name", "اسم الدخول", "SHOW"],
    ["EMP_Email", "البريد الإلكتروني", "SHOW"],
    ["Job_Title", "المسمى الوظيفي", "SHOW"],
    ["DEPT_Name", "القسم", "SHOW"],
    ["Password_Hash", "كلمة المرور", ""],
    ["Password_Salt", "ملح التشفير", ""],
    ["Last_Login", "آخر دخول", "SHOW"],
    ["USR_Crt_At", "تاريخ الإنشاء", ""],
    ["USR_Crt_By", "أنشئ بواسطة", ""],
    ["USR_Upd_At", "تاريخ التحديث", ""],
    ["USR_Upd_By", "حدث بواسطة", ""],
  ],
  SYS_Roles: [
    ["ROL_ID", "معرف الدور", "SHOW"],
    ["ROL_Title", "اسم الدور", "SHOW"],
    ["ROL_Notes", "ملاحظات", "SHOW"],
    ["ROL_Is_System", "نظامي", "SHOW"],
    ["ROL_Crt_At", "تاريخ الإنشاء", ""],
    ["ROL_Crt_By", "أنشئ بواسطة", ""],
    ["ROL_Upd_At", "تاريخ التحديث", ""],
    ["ROL_Upd_By", "حدث بواسطة", ""],
  ],
  SYS_Permissions: [
    ["PRM_ID", "معرف الصلاحية", "SHOW"],
    ["PRM_Name", "اسم الصلاحية", "SHOW"],
    ["PRM_Notes", "الوصف", "SHOW"],
    ["PRM_Catg", "الفئة", "SHOW"],
    ["PRM_Crt_At", "تاريخ الإنشاء", ""],
    ["PRM_Crt_By", "أنشئ بواسطة", ""],
    ["PRM_Upd_At", "تاريخ التحديث", ""],
    ["PRM_Upd_By", "حدث بواسطة", ""],
  ],
  SYS_Role_Permissions: [
    ["ROL_ID", "معرف الدور", "SHOW"],
    ["PRM_ID", "معرف الصلاحية", "SHOW"],
    ["SRP_Scope", "النطاق", "SHOW"],
    ["SRP_Is_Allowed", "مسموح", "SHOW"],
    ["SRP_Constraints", "القيود", ""],
    ["SRP_Crt_At", "تاريخ الإنشاء", ""],
    ["SRP_Crt_By", "أنشئ بواسطة", ""],
    ["SRP_Upd_At", "تاريخ التحديث", ""],
    ["SRP_Upd_By", "حدث بواسطة", ""],
  ],
  SYS_Audit_Log: [
    ["AUD_ID", "معرف السجل", "SHOW"],
    ["AUD_Time_Stamp", "وقت الحدث", "SHOW"],
    ["USR_ID", "المستخدم", "SHOW"],
    ["USR_Name", "اسم المستخدم", "SHOW"],
    ["USR_Action", "الإجراء", "SHOW"],
    ["ACT_Description", "الوصف", "SHOW"],
    ["AUD_Entity", "الكيان", "SHOW"],
    ["AUD_Entity_ID", "معرف الكيان", ""],
    ["AUD_Scope", "النطاق", ""],
    ["AUD_Sheet_ID", "معرف الورقة", ""],
    ["AUD_Sheet_Name", "اسم الورقة", ""],
    ["IP_Address", "عنوان IP", ""],
  ],
  SYS_Sessions: [
    ["SESS_ID", "معرف الجلسة", "SHOW"],
    ["USR_ID", "المستخدم", "SHOW"],
    ["EMP_Email", "البريد الإلكتروني", ""],
    ["Actor_USR_ID", "الفاعل", ""],
    ["SESS_Type", "النوع", "SHOW"],
    ["SESS_Status", "الحالة", "SHOW"],
    ["IP_Address", "عنوان IP", ""],
    ["Auth_Token", "رمز التحقق", ""],
    ["SESS_Start_At", "وقت البدء", "SHOW"],
    ["SESS_End_At", "وقت الانتهاء", "SHOW"],
    ["SESS_Crt_At", "تاريخ الإنشاء", ""],
    ["SESS_Crt_By", "أنشئ بواسطة", ""],
    ["SESS_Revoked_At", "تاريخ الإلغاء", ""],
    ["SESS_Revoked_By", "أبطل بواسطة", ""],
    ["SESS_Metadata", "بيانات وصفية", ""],
  ],
  SYS_Documents: [
    ["DOC_ID", "معرف المستند", "SHOW"],
    ["DOC_Entity", "الكيان", "SHOW"],
    ["DOC_Entity_ID", "معرف الكيان", "SHOW"],
    ["DOC_File_Name", "اسم الملف", "SHOW"],
    ["DOC_Label", "العنوان", "SHOW"],
    ["DOC_Drive_URL", "الرابط", "SHOW"],
    ["DOC_Upload_By", "رفع بواسطة", "SHOW"],
    ["DOC_Crt_At", "تاريخ الرفع", "SHOW"],
  ],
  SYS_PubHolidays: [
    ["PUBHOL_ID", "معرف العطلة", ""],
    ["Pub_Holiday_Date", "التاريخ", "SHOW"],
    ["Pub_Holiday_Name", "اسم العطلة", "SHOW"],
  ],
  SYS_Analysis: [
    ["SYS_ANA_ID", "المعرف", ""],
    ["SYS_ANA_Date", "التاريخ", ""],
    ["SYS_ANA_Start", "من", ""],
    ["SYS_ANA_End", "إلى", ""],
    ["SYS_ANA_Item1", "بند 1", ""],
    ["SYS_ANA_Item2", "بند 2", ""],
    ["SYS_ANA_Item3", "بند 3", ""],
    ["SYS_ANA_Item4", "بند 4", ""],
    ["SYS_ANA_Item5", "بند 5", ""],
    ["SYS_ANA_Item6", "بند 6", ""],
    ["SYS_ANA_Item7", "بند 7", ""],
    ["SYS_ANA_Item8", "بند 8", ""],
    ["SYS_ANA_Item9", "بند 9", ""],
  ],

  // ==========================
  // 4. HRM (HUMAN RESOURCES)
  // ==========================
  HRM_Dashboard: [
    ["HR_Dash_ID", "المعرف", ""],
    ["HR_Metric_Code", "المؤشر", ""],
    ["HR_Metric_Value", "القيمة", ""],
    ["HR_Dash_Date", "التاريخ", ""],
  ],
  HRM_Departments: [
    ["DEPT_ID", "معرف القسم", "SHOW"],
    ["DEPT_Name", "اسم القسم", "SHOW"],
    ["DEPT_Is_Active", "نشط", "SHOW"],
    ["DEPT_Sort_Order", "الترتيب", ""],
    ["DEPT_Crt_At", "تاريخ الإنشاء", ""],
    ["DEPT_Crt_By", "أنشئ بواسطة", ""],
    ["DEPT_Upd_At", "تاريخ التحديث", ""],
    ["DEPT_Upd_By", "حدث بواسطة", ""],
  ],
  HRM_Employees: [
    ["EMP_ID", "معرّف الموظف", "SHOW"],
    ["EMP_Name_EN", "الاسم (إنجليزي)", "SHOW"],
    ["EMP_Name_AR", "الاسم (عربي)", "SHOW"],
    ["Date_of_Birth", "تاريخ الميلاد", ""],
    ["Gender", "النوع", "SHOW"],
    ["Nationality", "الجنسية", ""],
    ["Marital_Status", "الحالة الاجتماعية", ""],
    ["Military_Status", "الموقف التجنيدي", ""],
    ["EMP_Mob_Main", "رقم الجوال 1", "SHOW"],
    ["EMP_Mob_Sub", "رقم الجوال 2", ""],
    ["Home_Address", "العنوان", ""],
    ["EMP_Email", "البريد الإلكتروني", "SHOW"],
    ["EmrCont_Name", "اسم الطوارئ", ""],
    ["EmrCont_Relation", "صلة القرابة", ""],
    ["EmrCont_Mob", "هاتف الطوارئ", ""],
    ["Job_Title", "المسمى الوظيفي", "SHOW"],
    ["DEPT_Name", "القسم", "SHOW"],
    ["Hire_Date", "تاريخ التعيين", "SHOW"],
    ["EMP_CONT_Type", "نوع العقد", "SHOW"],
    ["Basic_Salary", "الراتب الأساسي", ""],
    ["Allowances", "البدلات", ""],
    ["Deducts", "الاستقطاعات", ""],
    ["EMP_Crt_At", "تاريخ الإضافة", ""],
    ["EMP_Crt_By", "أضيف بواسطة", ""],
  ],
  HRM_Attendance: [
    ["ATT_ID", "معرف الحضور", "SHOW"],
    ["EMP_ID", "الموظف", "SHOW"],
    ["ATT_Date", "التاريخ", "SHOW"],
    ["ATT_Check_In", "حضور", "SHOW"],
    ["ATT_Check_Out", "انصراف", "SHOW"],
    ["ATT_Late_Mints", "تأخير (دقيقة)", "SHOW"],
    ["ATT_EarlyLV_Mints", "انصراف مبكر", ""],
    ["ATT_OT_Mints", "إضافي (دقيقة)", "SHOW"],
    ["ATT_Notes", "ملاحظات", ""],
    ["ATT_Status", "الحالة", "SHOW"],
    ["ATT_Crt_At", "تاريخ الإنشاء", ""],
    ["ATT_Crt_By", "أنشئ بواسطة", ""],
    ["ATT_Upd_At", "تاريخ التحديث", ""],
    ["ATT_Upd_By", "حدث بواسطة", ""],
  ],
  HRM_Leave: [
    ["LV_ID", "معرف الإجازة", "SHOW"],
    ["EMP_ID", "الموظف", "SHOW"],
    ["LV_Type", "نوع الإجازة", "SHOW"],
    ["LV_Start_Date", "من تاريخ", "SHOW"],
    ["LV_End_Date", "إلى تاريخ", "SHOW"],
    ["LV_NumDays", "عدد الأيام", "SHOW"],
    ["LV_Approved_By", "الموافق", "SHOW"],
    ["LV_Notes", "ملاحظات", ""],
    ["LV_Crt_At", "تاريخ الطلب", "SHOW"],
    ["LV_Crt_By", "طلب بواسطة", ""],
    ["LV_Upd_At", "تاريخ التحديث", ""],
    ["LV_Upd_By", "حدث بواسطة", ""],
  ],
  HRM_Advances: [
    ["ADV_ID", "معرف السلفة", "SHOW"],
    ["EMP_ID", "الموظف", "SHOW"],
    ["ADV_Issue_Date", "تاريخ الصرف", "SHOW"],
    ["ADV_Amnt", "المبلغ", "SHOW"],
    ["ADV_Setlmnt_Period", "فترة السداد", ""],
    ["ADV_Notes", "ملاحظات", "SHOW"],
    ["ADV_Status", "الحالة", "SHOW"],
    ["ADV_Crt_At", "تاريخ الإنشاء", ""],
    ["ADV_Crt_By", "أنشئ بواسطة", ""],
    ["ADV_Upd_At", "تاريخ التحديث", ""],
    ["ADV_Upd_By", "حدث بواسطة", ""],
  ],
  HRM_OverTime: [
    ["OT_ID", "معرف الإضافي", "SHOW"],
    ["EMP_ID", "الموظف", "SHOW"],
    ["POL_OT_ID", "سياسة الإضافي", ""],
    ["ATT_Date", "التاريخ", "SHOW"],
    ["ATT_OT_Mints", "دقائق الإضافي", "SHOW"],
    ["OT_Amnt", "القيمة", "SHOW"],
    ["OT_Crt_At", "تاريخ الإنشاء", ""],
    ["OT_Crt_By", "أنشئ بواسطة", ""],
    ["OT_Upd_At", "تاريخ التحديث", ""],
    ["OT_Upd_By", "حدث بواسطة", ""],
  ],
  HRM_Deductions: [
    ["DEDCT_ID", "معرف الخصم", "SHOW"],
    ["PEN_ID", "معرف الجزاء", ""],
    ["PEN_Name", "اسم الجزاء", "SHOW"],
    ["EMP_ID", "الموظف", "SHOW"],
    ["DEDCT_Date", "التاريخ", "SHOW"],
    ["DEDCT_Amnt", "القيمة", "SHOW"],
    ["DEDCT_Crt_At", "تاريخ الإنشاء", ""],
    ["DEDCT_Crt_By", "أنشئ بواسطة", ""],
    ["DEDCT_Upd_At", "تاريخ التحديث", ""],
    ["DEDCT_Upd_By", "حدث بواسطة", ""],
  ],
  HRM_Analysis: [
    ["HR_ANA_ID", "المعرف", ""],
    ["HR_ANA_Date", "التاريخ", ""],
    ["HR_ANA_Start", "البداية", ""],
    ["HR_ANA_End", "النهاية", ""],
    ["HR_ANA_Item1", "بند 1", ""],
    ["HR_ANA_Item2", "بند 2", ""],
    ["HR_ANA_Item3", "بند 3", ""],
    ["HR_ANA_Item4", "بند 4", ""],
    ["HR_ANA_Item5", "بند 5", ""],
    ["HR_ANA_Item6", "بند 6", ""],
    ["HR_ANA_Item7", "بند 7", ""],
    ["HR_ANA_Item8", "بند 8", ""],
    ["HR_ANA_Item9", "بند 9", ""],
  ],

  // ==========================
  // 5. PROJECTS
  // ==========================
  PRJ_Dashboard: [
    ["PRJ_Dash_ID", "المعرف", ""],
    ["PRJ_Metric_Code", "المؤشر", ""],
    ["PRJ_Metric_Value", "القيمة", ""],
    ["PRJ_Dash_Date", "التاريخ", ""],
  ],
  PRJ_Main: [
    ["PRJ_ID", "معرّف المشروع", "SHOW"],
    ["PRJ_Name", "اسم المشروع", "SHOW"],
    ["CLI_ID", "العميل", "SHOW"],
    ["CLI_Name", "اسم العميل", "SHOW"],
    ["PRJ_Status", "حالة المشروع", "SHOW"],
    ["PRJ_Type", "نوع المشروع", "SHOW"],
    ["PRJ_Budget", "الميزانية", "SHOW"],
    ["Plan_Start_Date", "تاريخ البدء المخطط", "SHOW"],
    ["PRJ_Location", "الموقع", ""],
    ["PRJ_Crt_At", "تاريخ الإنشاء", ""],
    ["PRJ_Crt_By", "أنشئ بواسطة", ""],
    ["PRJ_Upd_At", "تاريخ التحديث", ""],
    ["PRJ_Upd_By", "حدث بواسطة", ""],
  ],
  PRJ_Clients: [
    ["CLI_ID", "معرف العميل", "SHOW"],
    ["CLI_Name", "اسم العميل", "SHOW"],
    ["CLI_Mob_1", "رقم الهاتف 1", "SHOW"],
    ["CLI_Mob_2", "رقم الهاتف 2", ""],
    ["CLI_Email", "البريد الإلكتروني", "SHOW"],
    ["CLI_Crt_At", "تاريخ الإضافة", ""],
    ["CLI_Crt_By", "أضيف بواسطة", ""],
    ["CLI_Upd_At", "تاريخ التحديث", ""],
    ["CLI_Upd_By", "حدث بواسطة", ""],
  ],
  PRJ_Tasks: [
    ["TSK_ID", "معرف المهمة", "SHOW"],
    ["PRJ_ID", "المشروع", "SHOW"],
    ["TSK_Name", "اسم المهمة", "SHOW"],
    ["TSK_Priority", "الأولوية", "SHOW"],
    ["EMP_ID", "المسؤول", "SHOW"],
    ["TSK_Plan_Start", "البداية المخططة", ""],
    ["TSK_Start", "البداية الفعلية", "SHOW"],
    ["TSK_End", "النهاية الفعلية", "SHOW"],
    ["TSK_Status", "الحالة", "SHOW"],
    ["TSK_Crt_At", "تاريخ الإنشاء", ""],
    ["TSK_Crt_By", "أنشئ بواسطة", ""],
    ["TSK_Upd_At", "تاريخ التحديث", ""],
    ["TSK_Upd_By", "حدث بواسطة", ""],
  ],
  PRJ_Material: [
    ["MAT_ID", "معرف المادة", "SHOW"],
    ["MAT_Name", "اسم المادة", "SHOW"],
    ["MAT_Catg", "التصنيف", "SHOW"],
    ["MAT_Sub1", "فرعي 1", ""],
    ["MAT_Sub2", "فرعي 2", ""],
    ["Default_Unit", "الوحدة", "SHOW"],
    ["MAT_Active", "نشط", "SHOW"],
    ["MAT_Crt_At", "تاريخ الإنشاء", ""],
    ["MAT_Crt_By", "أنشئ بواسطة", ""],
    ["MAT_Upd_At", "تاريخ التحديث", ""],
    ["MAT_Upd_By", "حدث بواسطة", ""],
  ],
  PRJ_IndirExp_Time_Alloc: [
    ["ALO_TM_ID", "المعرف", ""],
    ["InDiEXP_TM_ID", "المصروف", ""],
    ["PRJ_ID", "المشروع", ""],
    ["ALO_TM_Methd", "الطريقة", ""],
    ["ALO_TM_Amnt", "القيمة", ""],
    ["ALO_TM_Crt_At", "تاريخ الإنشاء", ""],
    ["ALO_TM_Crt_By", "أنشئ بواسطة", ""],
    ["ALO_TM_Upd_At", "تاريخ التحديث", ""],
    ["ALO_TM_Upd_By", "حدث بواسطة", ""],
  ],
  PRJ_IndirExp_NoTime_Alloc: [
    ["ALO_NT_ID", "المعرف", ""],
    ["InDiEXP_NT_ID", "المصروف", ""],
    ["PRJ_ID", "المشروع", ""],
    ["ALO_NT_Methd", "الطريقة", ""],
    ["ALO_NT_Amnt", "القيمة", ""],
    ["ALO_NT_Crt_At", "تاريخ الإنشاء", ""],
    ["ALO_NT_Crt_By", "أنشئ بواسطة", ""],
    ["ALO_NT_Upd_At", "تاريخ التحديث", ""],
    ["ALO_NT_Upd_By", "حدث بواسطة", ""],
  ],
  PRJ_Plan_vs_Actual: [
    ["PvA_ID", "المعرف", ""],
    ["PRJ_ID", "المشروع", "SHOW"],
    ["PRJ_Name", "اسم المشروع", "SHOW"],
    ["Plan_Start_Date", "البداية المخططة", "SHOW"],
    ["Actual_Start_Date", "البداية الفعلية", "SHOW"],
    ["Actual_Num_Days", "الأيام الفعلية", ""],
    ["Plan_End_Date", "النهاية المخططة", ""],
    ["Actual_End_Date", "النهاية الفعلية", ""],
    ["Plan_Direct_Exp", "مصروفات مباشرة (خطة)", ""],
    ["Actual_Direct_Exp", "مصروفات مباشرة (فعلي)", "SHOW"],
    ["Actual_MATs", "مواد فعلية", ""],
    ["PvA_Crt_At", "تاريخ التحديث", ""],
    ["PvA_Crt_By", "حدث بواسطة", ""],
    ["PvA_Upd_At", "تاريخ التحديث", ""],
    ["PvA_Upd_By", "حدث بواسطة", ""],
  ],
  PRJ_Analysis: [
    ["PRJ_ANA_ID", "المعرف", ""],
    ["PRJ_ANA_Item1", "بند 1", ""],
    ["PRJ_ANA_Item2", "بند 2", ""],
    ["PRJ_ANA_Item3", "بند 3", ""],
    ["PRJ_ANA_Item4", "بند 4", ""],
    ["PRJ_ANA_Item5", "بند 5", ""],
    ["PRJ_ANA_Item6", "بند 6", ""],
    ["PRJ_ANA_Item7", "بند 7", ""],
    ["PRJ_ANA_Item8", "بند 8", ""],
    ["PRJ_ANA_Item9", "بند 9", ""],
  ],

  // ==========================
  // 6. FINANCE
  // ==========================
  FIN_Dashboard: [
    ["FIN_Dash_ID", "المعرف", ""],
    ["FIN_Metric_Code", "المؤشر", ""],
    ["FIN_Metric_Value", "القيمة", ""],
    ["FIN_Dash_Date", "التاريخ", ""],
  ],
  FIN_DirectExpenses: [
    ["DiEXP_ID", "معرف المصروف", "SHOW"],
    ["PRJ_ID", "المشروع", "SHOW"],
    ["PRJ_Name", "اسم المشروع", "SHOW"],
    ["DiEXP_Date", "التاريخ", "SHOW"],
    ["MAT_ID", "المادة", ""],
    ["MAT_Name", "اسم المادة", "SHOW"],
    ["MAT_Sub2", "فرعي", ""],
    ["Default_Unit", "الوحدة", ""],
    ["Default_Price", "السعر", ""],
    ["MAT_Quantity", "الكمية", "SHOW"],
    ["DiEXP_Total_VAT_Exc", "الإجمالي (قبل الضريبة)", "SHOW"],
    ["DiEXP_Total_VAT_Inc", "الإجمالي (شامل الضريبة)", "SHOW"],
    ["DiEXP_Pay_Status", "حالة الدفع", "SHOW"],
    ["DiEXP_Pay_Methd", "طريقة الدفع", "SHOW"],
    ["DiEXP_Notes", "ملاحظات", ""],
    ["ADV_Crt_At", "تاريخ الإنشاء", ""],
    ["ADV_Crt_By", "أنشئ بواسطة", ""],
    ["ADV_Upd_At", "تاريخ التحديث", ""],
    ["ADV_Upd_By", "حدث بواسطة", ""],
  ],
  FIN_InDirectExpenses_Time: [
    ["InDiEXP_TM_ID", "معرف المصروف", "SHOW"],
    ["InDiEXP_TM_Catg", "التصنيف", "SHOW"],
    ["InDiEXP_TM_Sub1", "فرعي", "SHOW"],
    ["InDiEXP_Start", "بداية الفترة", "SHOW"],
    ["InDiEXP_End", "نهاية الفترة", "SHOW"],
    ["InDiEXP_TM_Pay_Status", "حالة الدفع", "SHOW"],
    ["InDiEXP_TM_Pay_Methd", "طريقة الدفع", ""],
    ["InDiEXP_TM_Notes", "ملاحظات", ""],
    ["ADV_Crt_At", "تاريخ الإنشاء", ""],
    ["ADV_Crt_By", "أنشئ بواسطة", ""],
    ["ADV_Upd_At", "تاريخ التحديث", ""],
    ["ADV_Upd_By", "حدث بواسطة", ""],
  ],
  FIN_InDirectExpenses_NoTime: [
    ["InDiEXP_NT_ID", "معرف المصروف", "SHOW"],
    ["InDiEXP_NT_Catg", "التصنيف", "SHOW"],
    ["InDiEXP_NT_Sub1", "فرعي", "SHOW"],
    ["Useful_Life_Months", "العمر الافتراضي (شهر)", ""],
    ["Depreciation_Start_Date", "تاريخ الإهلاك", ""],
    ["InDiEXP_NT_Pay_Status", "حالة الدفع", "SHOW"],
    ["InDiEXP_NT_Pay_Methd", "طريقة الدفع", ""],
    ["InDiEXP_NT_Notes", "ملاحظات", ""],
    ["ADV_Crt_At", "تاريخ الإنشاء", ""],
    ["ADV_Crt_By", "أنشئ بواسطة", ""],
    ["ADV_Upd_At", "تاريخ التحديث", ""],
    ["ADV_Upd_By", "حدث بواسطة", ""],
  ],
  FIN_PRJ_Revenue: [
    ["REV_ID", "معرف الإيراد", "SHOW"],
    ["PRJ_ID", "المشروع", "SHOW"],
    ["REV_Date", "التاريخ", "SHOW"],
    ["REV_Amnt", "المبلغ", "SHOW"],
    ["REV_Type", "النوع", "SHOW"],
    ["REV_Source", "المصدر", ""],
    ["REV_Pay_Methd", "طريقة الدفع", "SHOW"],
    ["REV_Invoice_Number", "رقم الفاتورة", "SHOW"],
    ["REV_Pay_Status", "حالة الدفع", "SHOW"],
    ["REV_Total", "الإجمالي", ""],
    ["REV_Remain", "المتبقي", ""],
    ["ADV_Crt_At", "تاريخ الإنشاء", ""],
    ["ADV_Crt_By", "أنشئ بواسطة", ""],
    ["ADV_Upd_At", "تاريخ التحديث", ""],
    ["ADV_Upd_By", "حدث بواسطة", ""],
  ],
  FIN_Custody: [
    ["CSTD_ID", "معرف العهدة", "SHOW"],
    ["EMP_ID", "الموظف", "SHOW"],
    ["EMP_Name", "اسم الموظف", "SHOW"],
    ["PRJ_ID", "المشروع", "SHOW"],
    ["PRJ_Name", "اسم المشروع", "SHOW"],
    ["CSTD_Issue_Date", "تاريخ الصرف", "SHOW"],
    ["CSTD_Amnt", "المبلغ", "SHOW"],
    ["CSTD_Purpose", "الغرض", "SHOW"],
    ["CSTD_Status", "الحالة", "SHOW"],
    ["CSTD_Notes", "ملاحظات", ""],
    ["ADV_Crt_At", "تاريخ الإنشاء", ""],
    ["ADV_Crt_By", "أنشئ بواسطة", ""],
    ["ADV_Upd_At", "تاريخ التحديث", ""],
    ["ADV_Upd_By", "حدث بواسطة", ""],
  ],
  FIN_HRM_Payroll: [
    ["PAY_ID", "معرف الراتب", "SHOW"],
    ["EMP_ID", "الموظف", "SHOW"],
    ["EMP_Name", "اسم الموظف", "SHOW"],
    ["PAY_Start_Date", "من تاريخ", "SHOW"],
    ["PAY_End_Date", "إلى تاريخ", "SHOW"],
    ["Basic_Salary", "الراتب الأساسي", "SHOW"],
    ["Total_OT_Amnt", "إجمالي الإضافي", "SHOW"],
    ["ADV_Instal", "قسط السلفة", "SHOW"],
    ["Total_DEDCT_Amnt", "إجمالي الخصومات", "SHOW"],
    ["PAY_Net_Pay", "صافي الراتب", "SHOW"],
    ["PAY_Status", "الحالة", "SHOW"],
    ["ADV_Crt_At", "تاريخ الإنشاء", ""],
    ["ADV_Crt_By", "أنشئ بواسطة", ""],
    ["ADV_Upd_At", "تاريخ التحديث", ""],
    ["ADV_Upd_By", "حدث بواسطة", ""],
  ],
  FIN_PandL_Statements: [
    ["PL_ID", "المعرف", "SHOW"],
    ["Rev_ID", "الإيراد", ""],
    ["DiEXP_ID", "مصروف مباشر", ""],
    ["InDiEXP_TM_ID", "مصروف زمني", ""],
    ["InDiEXP_NT_ID", "مصروف ثابت", ""],
    ["Total_Rev", "إجمالي الإيرادات", "SHOW"],
    ["Total_DiEXP", "مباشر", "SHOW"],
    ["Total_InDiEXP_TM", "زمني", "SHOW"],
    ["Total_InDiEXP_NT", "ثابت", "SHOW"],
    ["PL_Start_Date", "بداية الفترة", "SHOW"],
    ["PL_End_Date", "نهاية الفترة", "SHOW"],
    ["ADV_Crt_At", "تاريخ الإنشاء", ""],
    ["ADV_Crt_By", "أنشئ بواسطة", ""],
    ["ADV_Upd_At", "تاريخ التحديث", ""],
    ["ADV_Upd_By", "حدث بواسطة", ""],
  ],
  FIN_Analysis: [
    ["FIN_ANA_ID", "المعرف", ""],
    ["FIN_ANA_Item1", "بند 1", ""],
    ["FIN_ANA_Item2", "بند 2", ""],
    ["FIN_ANA_Item3", "بند 3", ""],
    ["FIN_ANA_Item4", "بند 4", ""],
    ["FIN_ANA_Item5", "بند 5", ""],
    ["FIN_ANA_Item6", "بند 6", ""],
    ["FIN_ANA_Item7", "بند 7", ""],
    ["FIN_ANA_Item8", "بند 8", ""],
    ["FIN_ANA_Item9", "بند 9", ""],
  ],
};

// --- 3. MAIN SETUP FUNCTION ---

function runFullSystemSetup() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheets = ss.getSheets();

  // 1. Create a Temp Sheet to hold the fort while we wipe the rest
  var tempSheet = ss.getSheetByName("SETUP_TEMP");
  if (!tempSheet) {
    tempSheet = ss.insertSheet("SETUP_TEMP");
  }

  // 2. Delete ALL existing sheets (Wipe Clean)
  sheets.forEach(function (sheet) {
    if (sheet.getName() !== "SETUP_TEMP") {
      ss.deleteSheet(sheet);
    }
  });

  // 3. Create Tabs Sorted by Group
  var groups = ["DBUG", "ENG", "SYS", "HRM", "PRJ", "FIN"];

  groups.forEach(function (group) {
    var color = COLOR_MAP[group];

    // Filter schema for this group
    var tabs = Object.keys(ERP_SCHEMA).filter(function (k) {
      return k.startsWith(group + "_");
    });

    tabs.forEach(function (tabName) {
      var sheet = ss.insertSheet(tabName);
      var schema = ERP_SCHEMA[tabName];

      // Separate Schema into Rows
      var row1_Codes = schema.map(function (col) {
        return col[0];
      });
      var row2_Labels = schema.map(function (col) {
        return col[1];
      });
      var row3_Show = schema.map(function (col) {
        return col[2];
      });

      // Determine Header Rows count
      var isEngineOrDebug = group === "DBUG" || group === "ENG";
      var headerRowCount = isEngineOrDebug ? 1 : 3;

      // Write Headers
      sheet.getRange(1, 1, 1, row1_Codes.length).setValues([row1_Codes]);

      if (!isEngineOrDebug) {
        sheet.getRange(2, 1, 1, row2_Labels.length).setValues([row2_Labels]);
        sheet.getRange(3, 1, 1, row3_Show.length).setValues([row3_Show]);
      }

      // Formatting
      var maxCols = row1_Codes.length;
      var headerRange = sheet.getRange(1, 1, headerRowCount, maxCols);

      headerRange
        .setBackground(color)
        .setFontFamily("Cairo")
        .setFontSize(12)
        .setFontWeight("bold")
        .setHorizontalAlignment("center")
        .setVerticalAlignment("middle")
        .setWrap(true);

      // Set Column Widths (Default 150px)
      sheet.setColumnWidths(1, maxCols, 150);

      // Freeze Rows
      sheet.setFrozenRows(headerRowCount);

      // Clear extra columns
      if (sheet.getMaxColumns() > maxCols + 1) {
        sheet.deleteColumns(maxCols + 1, sheet.getMaxColumns() - maxCols);
      }
    });
  });

  // 4. Delete Temp Sheet
  ss.deleteSheet(tempSheet);

  seedMasterConfiguration();

  // 5. Seed Data
  seedData_();

  // 6. Final Polish
  SpreadsheetApp.flush();
  Browser.msgBox("ERP System Setup Complete! 🚀");
}

// --- 4. DATA SEEDING ---

function seedData_() {
  var ss = SpreadsheetApp.openById(CONFIG.SHEET_ID);

  // --- 1. SEED ROLES ---
  var roleSheet = ss.getSheetByName("SYS_Roles");
  var roles = [
    ["SYS-R01", "Super Admin", "All Access", "TRUE", new Date(), "System"],
    ["SYS-R02", "Manager", "Ops Management", "FALSE", new Date(), "System"],
    ["SYS-R03", "Accountant", "Finance Ops", "FALSE", new Date(), "System"],
    ["SYS-R04", "HR Specialist", "HR Ops", "FALSE", new Date(), "System"],
    ["SYS-R05", "Employee", "Self Service", "FALSE", new Date(), "System"],
  ];
  if (roleSheet) roleSheet.getRange(4, 1, roles.length, 6).setValues(roles);

  // --- 2. SEED DEPARTMENTS ---
  var deptSheet = ss.getSheetByName("HRM_Departments");
  var depts = [
    ["HRM-D01", "Management", "TRUE", 1],
    ["HRM-D02", "HR", "TRUE", 2],
    ["HRM-D03", "Finance", "TRUE", 3],
    ["HRM-D04", "Operations", "TRUE", 4],
    ["HRM-D05", "IT", "TRUE", 5],
  ];
  if (deptSheet) deptSheet.getRange(4, 1, depts.length, 4).setValues(depts);

  // --- 3. SEED USERS ---
  var userSheet = ss.getSheetByName("SYS_Users");
  var salt1 = uuid_();
  var pass1 = hash_(salt1 + ":123456");
  var salt2 = uuid_();
  var pass2 = hash_(salt2 + ":123456");
  var salt3 = uuid_();
  var pass3 = hash_(salt3 + ":123456");
  var salt4 = uuid_();
  var pass4 = hash_(salt4 + ":123456");
  var salt5 = uuid_();
  var pass5 = hash_(salt5 + ":123456");

  var users = [
    [
      "SYS-U01",
      "Mohamed Sherif Elkhoraiby",
      "mkhoraiby",
      "melkhoraiby@gmail.com",
      "Super Admin",
      "Management",
      pass1,
      salt1,
      "",
      new Date(),
      "System",
    ],
    [
      "SYS-U02",
      "Ahmed Manager",
      "ahmed.manager",
      "ahmed.manager@example.com",
      "Manager",
      "Operations",
      pass2,
      salt2,
      "",
      new Date(),
      "System",
    ],
    [
      "SYS-U03",
      "Sarah HR",
      "sarah.hr",
      "sarah.hr@example.com",
      "HR Specialist",
      "HR",
      pass3,
      salt3,
      "",
      new Date(),
      "System",
    ],
    [
      "SYS-U04",
      "Omar Accountant",
      "omar.accountant",
      "omar.accountant@example.com",
      "Accountant",
      "Finance",
      pass4,
      salt4,
      "",
      new Date(),
      "System",
    ],
    [
      "SYS-U05",
      "Yara Employee",
      "yara.employee",
      "yara.employee@example.com",
      "Employee",
      "Management",
      pass5,
      salt5,
      "",
      new Date(),
      "System",
    ],
  ];
  if (userSheet) userSheet.getRange(4, 1, users.length, 11).setValues(users);
}

/**
 * Usage Instructions:
 * - Environment: CONFIG.SHEET_ID must point to the ERP spreadsheet
 * - CLI: npx @google/clasp run runSeedDemoData --params "[{\"employees\":50,\"projects\":10}]"
 * - Output: { success:boolean, stats:Object, errors:Array }
 */
function seedDemoData(options) {
  var ss = SpreadsheetApp.openById(CONFIG.SHEET_ID);
  options = options || {};
  var counts = {
    employees: Math.max(0, Number(options.employees || 25)),
    departments: Math.max(0, Number(options.departments || 5)),
    users: Math.max(0, Number(options.users || 10)),
    projects: Math.max(0, Number(options.projects || 12)),
    expenses: Math.max(0, Number(options.expenses || 40)),
  };

  var stats = {
    employees: 0,
    departments: 0,
    users: 0,
    projects: 0,
    expenses: 0,
  };
  var errors = [];

  function headers_(sheet) {
    return sheet
      .getRange(1, 1, 1, sheet.getLastColumn())
      .getValues()[0]
      .map(String);
  }

  function put_(sheetName, obj) {
    try {
      var sh = ss.getSheetByName(sheetName);
      if (!sh) throw new Error("Missing sheet: " + sheetName);
      var h = headers_(sh);
      insertRowByHeaders_(sh, h, obj);
      return true;
    } catch (e) {
      errors.push(String(e));
      return false;
    }
  }

  // Departments
  var deptNames = [
    "Management",
    "HR",
    "Finance",
    "Operations",
    "IT",
    "Sales",
    "Support",
  ];
  for (var d = 0; d < counts.departments; d++) {
    var dept = {
      DEPT_ID: "HRM-D" + String(100 + d),
      DEPT_Name: deptNames[d % deptNames.length],
      DEPT_Is_Active: "TRUE",
      DEPT_Sort_Order: d + 1,
    };
    if (put_("HRM_Departments", dept)) stats.departments++;
  }

  // Users
  for (var u = 0; u < counts.users; u++) {
    var name = "User " + String(u + 1);
    var salt = generateSalt_();
    var pwdHash = hashPasswordWithSalt_("test123", salt);
    var usr = {
      USR_ID: "SYS-U" + String(100 + u),
      EMP_Name_EN: name,
      USR_Name: name.toLowerCase().replace(/\s+/g, "."),
      EMP_Email: "user" + String(u + 1) + "@example.com",
      Job_Title: "Employee",
      DEPT_Name: deptNames[u % deptNames.length],
      Password_Hash: pwdHash,
      Password_Salt: salt,
      Last_Login: new Date(),
    };
    if (put_("SYS_Users", usr)) stats.users++;
  }

  // Employees
  for (var e = 0; e < counts.employees; e++) {
    var fname = ["Ahmed", "Sara", "Omar", "Yara", "Hassan", "Mona"][e % 6];
    var lname = ["Ali", "Mahmoud", "Khaled", "Samir", "Nassar", "Farid"][e % 6];
    var emp = {
      EMP_ID: "HRM-" + String(1000 + e),
      EMP_Name_EN: fname + " " + lname,
      EMP_Name_AR: "" + fname + " " + lname,
      Gender: e % 2 === 0 ? "Male" : "Female",
      EMP_Mob_Main: "+2010" + String(100000 + e),
      EMP_Email: (fname + "." + lname + "@example.com").toLowerCase(),
      Job_Title: ["Engineer", "Manager", "Analyst"][e % 3],
      DEPT_Name: deptNames[e % deptNames.length],
      Hire_Date: new Date(2020, e % 12, (e % 28) + 1),
      EMP_CONT_Type: ["Full Time", "Part Time"][e % 2],
    };
    if (put_("HRM_Employees", emp)) stats.employees++;
  }

  // Projects
  for (var p = 0; p < counts.projects; p++) {
    var prj = {
      PRJ_ID: "PRJ-" + String(500 + p),
      PRJ_Name: "Project " + String(p + 1),
      CLI_ID: "CLI-" + String(200 + (p % 50)),
      CLI_Name: "Client " + String((p % 50) + 1),
      PRJ_Status: ["Active", "On Hold", "Closed"][p % 3],
      PRJ_Type: ["Residential", "Commercial"][p % 2],
      PRJ_Budget: 100000 + p * 5000,
      Plan_Start_Date: new Date(2024, p % 12, (p % 28) + 1),
    };
    if (put_("PRJ_Main", prj)) stats.projects++;
  }

  // Direct Expenses
  for (var x = 0; x < counts.expenses; x++) {
    var de = {
      DiEXP_ID: "FIN-" + String(900 + x),
      PRJ_ID: "PRJ-" + String(500 + (x % counts.projects)),
      PRJ_Name: "Project " + String((x % counts.projects) + 1),
      DiEXP_Date: new Date(2025, x % 12, (x % 28) + 1),
      MAT_Name: ["Cement", "Steel", "Bricks"][x % 3],
      MAT_Quantity: 10 + (x % 20),
      DiEXP_Total_VAT_Exc: 1000 + x * 50,
      DiEXP_Total_VAT_Inc: 1150 + x * 55,
      DiEXP_Pay_Status: ["Paid", "Pending"][x % 2],
      DiEXP_Pay_Methd: ["Cash", "Bank"][x % 2],
    };
    if (put_("FIN_DirectExpenses", de)) stats.expenses++;
  }

  var ok = errors.length === 0;
  return { success: ok, stats: stats, errors: errors };
}

function runSeedDemoData(params) {
  params = params && params[0] ? params[0] : {};
  return seedDemoData(params);
}

// --- 5. HELPER UTILITIES ---

function uuid_() {
  return Utilities.getUuid();
}

function hash_(input) {
  var rawHash = Utilities.computeDigest(
    Utilities.DigestAlgorithm.SHA_256,
    input
  );
  var txtHash = "";
  for (var i = 0; i < rawHash.length; i++) {
    var hashVal = rawHash[i];
    if (hashVal < 0) {
      hashVal += 256;
    }
    if (hashVal.toString(16).length == 1) {
      txtHash += "0";
    }
    txtHash += hashVal.toString(16);
  }
  return txtHash;
}
/**
 * THE ULTIMATE MASTER SEEDER (V3 - FINAL)
 * Seeds ALL Forms, Views, Dropdowns, Buttons, and Settings.
 * Covers 100% of the Nijjara ERP Scope.
 */
function seedMasterConfiguration() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  // ===========================================
  // 1. SEED ENG_Dropdowns (The Static Lists)
  // ===========================================
  var ddSheet = ss.getSheetByName("ENG_Dropdowns");
  if (ddSheet.getLastRow() > 1) ddSheet.deleteRows(2, ddSheet.getLastRow() - 1);

  var dds = [
    ["DD_YesNo", "Yes", "نعم", "TRUE", 1],
    ["DD_YesNo", "No", "لا", "TRUE", 2],
    ["DD_Boolean", "TRUE", "صحيح", "TRUE", 1],
    ["DD_Boolean", "FALSE", "خطأ", "TRUE", 2],
    ["DD_User_Status", "Active", "نشط", "TRUE", 1],
    ["DD_User_Status", "Inactive", "غير نشط", "TRUE", 2],
    ["DD_Gender", "Male", "ذكر", "TRUE", 1],
    ["DD_Gender", "Female", "أنثى", "TRUE", 2],
    ["DD_Project_Status", "New", "جديد", "TRUE", 1],
    ["DD_Project_Status", "Active", "جاري التنفيذ", "TRUE", 2],
    ["DD_Project_Status", "Completed", "مكتمل", "TRUE", 3],
    ["DD_Project_Status", "On_Hold", "معلق", "TRUE", 4],
    ["DD_Project_Type", "Internal", "داخلي", "TRUE", 1],
    ["DD_Project_Type", "Client", "خارجي", "TRUE", 2],
    ["DD_Priority", "High", "عالية", "TRUE", 1],
    ["DD_Priority", "Medium", "متوسطة", "TRUE", 2],
    ["DD_Priority", "Low", "منخفضة", "TRUE", 3],
    ["DD_Task_Status", "Pending", "قيد الانتظار", "TRUE", 1],
    ["DD_Task_Status", "In_Progress", "جاري العمل", "TRUE", 2],
    ["DD_Task_Status", "Completed", "مكتملة", "TRUE", 3],
    ["DD_Payment_Method", "Cash", "نقدية", "TRUE", 1],
    ["DD_Payment_Method", "Bank", "تحويل بنكي", "TRUE", 2],
    ["DD_Payment_Method", "Cheque", "شيك", "TRUE", 3],
    ["DD_Payment_Method", "Custody", "عهدة موظف", "TRUE", 4],
    ["DD_Payment_Status", "Paid", "مدفوع", "TRUE", 1],
    ["DD_Payment_Status", "Pending", "معلق", "TRUE", 2],
    ["DD_Expense_Category", "Rent", "إيجار", "TRUE", 1],
    ["DD_Expense_Category", "Utilities", "مرافق", "TRUE", 2],
    ["DD_Expense_Category", "Maintenance", "صيانة", "TRUE", 3],
    ["DD_Expense_Category", "Purchases", "مشتريات", "TRUE", 4],
    ["DD_Leave_Type", "Annual", "سنوية", "TRUE", 1],
    ["DD_Leave_Type", "Sick", "مرضية", "TRUE", 2],
    ["DD_Leave_Type", "Unpaid", "بدون راتب", "TRUE", 3],
    ["DD_Job_Titles", "Manager", "مدير", "TRUE", 1],
    ["DD_Job_Titles", "Engineer", "مهندس", "TRUE", 2],
    ["DD_Job_Titles", "Accountant", "محاسب", "TRUE", 3],
    ["DD_Job_Titles", "Worker", "عامل", "TRUE", 4],
    ["DD_Units", "Piece", "قطعة", "TRUE", 1],
    ["DD_Units", "KG", "كجم", "TRUE", 2],
    ["DD_Units", "Meter", "متر", "TRUE", 3],
  ];
  ddSheet.getRange(2, 1, dds.length, 5).setValues(dds);

  // ===========================================
  // 2. SEED ENG_Buttons (The Actions)
  // ===========================================
  var btnSheet = ss.getSheetByName("ENG_Buttons");
  if (btnSheet.getLastRow() > 1)
    btnSheet.deleteRows(2, btnSheet.getLastRow() - 1);

  var btns = [
    [
      "BTN_Reset_Pass",
      "إعادة تعيين كلمة السر",
      "ROW_ACTION",
      "Sends reset email",
    ],
    [
      "BTN_Bulk_Activate",
      "تفعيل المحدد",
      "BULK_ACTION",
      "Activates selected users",
    ],
    [
      "BTN_Bulk_Deactivate",
      "تعطيل المحدد",
      "BULK_ACTION",
      "Deactivates selected users",
    ],
    ["BTN_Approve_Leave", "قبول الإجازة", "ROW_ACTION", "Approves request"],
    ["BTN_Reject_Leave", "رفض الإجازة", "ROW_ACTION", "Rejects request"],
    ["BTN_PRJ_Start", "بدء المشروع", "FORM_ACTION", "Changes status to Active"],
    [
      "BTN_PRJ_Close",
      "إغلاق المشروع",
      "FORM_ACTION",
      "Changes status to Completed",
    ],
    ["BTN_Task_Done", "إتمام المهمة", "ROW_ACTION", "Marks task as Done"],
  ];
  btnSheet.getRange(2, 1, btns.length, 4).setValues(btns);

  // ===========================================
  // 3. SEED ENG_Views (The Lists)
  // ===========================================
  var viewSheet = ss.getSheetByName("ENG_Views");
  if (viewSheet.getLastRow() > 1)
    viewSheet.deleteRows(2, viewSheet.getLastRow() - 1);

  var views = [
    ["VIEW_SYS_Users", "قائمة المستخدمين", "SYS_Users"],
    ["VIEW_SYS_Roles", "قائمة الأدوار", "SYS_Roles"],
    ["VIEW_SYS_Permissions", "قائمة الصلاحيات", "SYS_Permissions"],
    ["VIEW_SYS_RolePermissions", "تعيينات الصلاحيات", "SYS_Role_Permissions"],
    ["VIEW_SYS_AuditLog", "سجل التدقيق", "SYS_Audit_Log"],
    ["VIEW_SYS_Sessions", "جلسات المستخدمين", "SYS_Sessions"],
    ["VIEW_SYS_Documents", "المستندات", "SYS_Documents"],
    ["VIEW_SYS_PubHolidays", "العطلات الرسمية", "SYS_PubHolidays"],
    ["VIEW_HRM_Departments", "الأقسام", "HRM_Departments"],
    ["VIEW_HRM_Employees", "الموظفون", "HRM_Employees"],
    ["VIEW_HRM_Attendance", "سجل الحضور", "HRM_Attendance"],
    ["VIEW_HRM_Leave", "الإجازات", "HRM_Leave"],
    ["VIEW_HRM_Advances", "السلف", "HRM_Advances"],
    ["VIEW_HRM_OverTime", "الوقت الإضافي", "HRM_OverTime"],
    ["VIEW_HRM_Deductions", "الخصومات", "HRM_Deductions"],
    ["VIEW_PRJ_Main", "المشاريع", "PRJ_Main"],
    ["VIEW_PRJ_Clients", "العملاء", "PRJ_Clients"],
    ["VIEW_PRJ_Tasks", "مهام المشاريع", "PRJ_Tasks"],
    ["VIEW_PRJ_Material", "المواد والخامات", "PRJ_Material"],
    ["VIEW_FIN_DirectExpenses", "المصروفات المباشرة", "FIN_DirectExpenses"],
    [
      "VIEW_FIN_InDirectExpenses_Time",
      "مصروفات (زمنية)",
      "FIN_InDirectExpenses_Time",
    ],
    [
      "VIEW_FIN_InDirectExpenses_NoTime",
      "مصروفات (ثابتة)",
      "FIN_InDirectExpenses_NoTime",
    ],
    ["VIEW_FIN_PRJ_Revenue", "إيرادات المشاريع", "FIN_PRJ_Revenue"],
    ["VIEW_FIN_Custody", "العهد المالية", "FIN_Custody"],
    ["VIEW_FIN_HRM_Payroll", "مسير الرواتب", "FIN_HRM_Payroll"],
  ];
  viewSheet.getRange(2, 1, views.length, 3).setValues(views);

  // ===========================================
  // 4. SEED ENG_Settings (Map Forms to Sheets)
  // ===========================================
  var setSheet = ss.getSheetByName("ENG_Settings");
  if (setSheet.getLastRow() > 1)
    setSheet.deleteRows(2, setSheet.getLastRow() - 1);

  var settings = [
    ["FORM_MASTER:FORM_SYS_AddUser", "SYS_Users", "Add User"],
    ["FORM_MASTER:FORM_SYS_AddRole", "SYS_Roles", "Add Role"],
    ["FORM_MASTER:FORM_SYS_AddPermission", "SYS_Permissions", "Add Perm"],
    [
      "FORM_MASTER:FORM_SYS_AddRolePermission",
      "SYS_Role_Permissions",
      "Add Role Perm",
    ],
    ["FORM_MASTER:FORM_SYS_AddDocument", "SYS_Documents", "Upload Doc"],
    ["FORM_MASTER:FORM_SYS_AddPubHoliday", "SYS_PubHolidays", "Add Holiday"],
    ["FORM_MASTER:FORM_HRM_AddDepartment", "HRM_Departments", "Add Dept"],
    ["FORM_MASTER:FORM_HRM_AddEmployee", "HRM_Employees", "Add Employee"],
    [
      "FORM_MASTER:FORM_HRM_AddAttendance",
      "HRM_Attendance",
      "Manual Attendance",
    ],
    ["FORM_MASTER:FORM_HRM_AddLeave", "HRM_Leave", "Request Leave"],
    ["FORM_MASTER:FORM_HRM_AddAdvance", "HRM_Advances", "Request Advance"],
    ["FORM_MASTER:FORM_HRM_AddOverTime", "HRM_OverTime", "Record OT"],
    ["FORM_MASTER:FORM_HRM_AddDeduction", "HRM_Deductions", "Record Deduction"],
    ["FORM_MASTER:FORM_PRJ_AddMain", "PRJ_Main", "Create Project"],
    ["FORM_MASTER:FORM_PRJ_AddClient", "PRJ_Clients", "Add Client"],
    ["FORM_MASTER:FORM_PRJ_AddTask", "PRJ_Tasks", "Add Task"],
    ["FORM_MASTER:FORM_PRJ_AddMaterial", "PRJ_Material", "Add Material"],
    [
      "FORM_MASTER:FORM_FIN_AddDirectExpense",
      "FIN_DirectExpenses",
      "Direct Exp",
    ],
    [
      "FORM_MASTER:FORM_FIN_AddInDirectExpense_Time",
      "FIN_InDirectExpenses_Time",
      "Indirect Exp Time",
    ],
    [
      "FORM_MASTER:FORM_FIN_AddInDirectExpense_NoTime",
      "FIN_InDirectExpenses_NoTime",
      "Indirect Exp Fixed",
    ],
    ["FORM_MASTER:FORM_FIN_AddPRJ_Revenue", "FIN_PRJ_Revenue", "Add Revenue"],
    ["FORM_MASTER:FORM_FIN_AddCustody", "FIN_Custody", "Issue Custody"],
    ["FORM_MASTER:FORM_FIN_AddHRM_Payroll", "FIN_HRM_Payroll", "Payroll"],
    // View Forms (for completeness, though they don't write data)
    ["FORM_MASTER:FORM_SYS_ViewUser", "SYS_Users", "View User"],
    ["FORM_MASTER:FORM_SYS_ViewRole", "SYS_Roles", "View Role"],
    ["FORM_MASTER:FORM_SYS_ViewPermission", "SYS_Permissions", "View Permission"],
    ["FORM_MASTER:FORM_SYS_ViewRolePermission", "SYS_Role_Permissions", "View Role Permission"],
    ["FORM_MASTER:FORM_SYS_ViewAuditLog", "SYS_Audit_Log", "View Audit Log"],
    ["FORM_MASTER:FORM_SYS_ViewSession", "SYS_Sessions", "View Session"],
    ["FORM_MASTER:FORM_SYS_ViewDocument", "SYS_Documents", "View Document"],
    ["FORM_MASTER:FORM_SYS_ViewPubHoliday", "SYS_PubHolidays", "View Pub Holiday"],
    ["FORM_MASTER:FORM_HRM_ViewEmployee", "HRM_Employees", "View Employee"],
    ["FORM_MASTER:FORM_HRM_ViewDepartment", "HRM_Departments", "View Department"],
    ["FORM_MASTER:FORM_HRM_ViewAttendance", "HRM_Attendance", "View Attendance"],
    ["FORM_MASTER:FORM_HRM_ViewLeave", "HRM_Leave", "View Leave"],
    ["FORM_MASTER:FORM_HRM_ViewAdvance", "HRM_Advances", "View Advance"],
    ["FORM_MASTER:FORM_HRM_ViewOverTime", "HRM_OverTime", "View OverTime"],
    ["FORM_MASTER:FORM_HRM_ViewDeduction", "HRM_Deductions", "View Deduction"],
    ["FORM_MASTER:FORM_PRJ_ViewMain", "PRJ_Main", "View Project"],
    ["FORM_MASTER:FORM_PRJ_ViewClient", "PRJ_Clients", "View Client"],
    ["FORM_MASTER:FORM_PRJ_ViewTask", "PRJ_Tasks", "View Task"],
    ["FORM_MASTER:FORM_PRJ_ViewMaterial", "PRJ_Material", "View Material"],
    ["FORM_MASTER:FORM_FIN_ViewDirectExpense", "FIN_DirectExpenses", "View Direct Expense"],
    ["FORM_MASTER:FORM_FIN_ViewInDirectExpense_Time", "FIN_InDirectExpenses_Time", "View Indirect Exp Time"],
    ["FORM_MASTER:FORM_FIN_ViewInDirectExpense_NoTime", "FIN_InDirectExpenses_NoTime", "View Indirect Exp NoTime"],
    ["FORM_MASTER:FORM_FIN_ViewPRJ_Revenue", "FIN_PRJ_Revenue", "View PRJ Revenue"],
    ["FORM_MASTER:FORM_FIN_ViewCustody", "FIN_Custody", "View Custody"],
    ["FORM_MASTER:FORM_FIN_ViewHRM_Payroll", "FIN_HRM_Payroll", "View HRM Payroll"],
  ];
  setSheet.getRange(2, 1, settings.length, 3).setValues(settings);

  // ===========================================
  // 5. SEED ENG_Forms (The COMPLETE Field Layouts)
  // ===========================================
  var formSheet = ss.getSheetByName("ENG_Forms");
  if (formSheet.getLastRow() > 1)
    formSheet.deleteRows(2, formSheet.getLastRow() - 1);

  var forms = [];

  // --- SYS MODULE ---
  forms.push(
    // Add User
    [
      "FORM_SYS_AddUser",
      "Account",
      "EMP_ID",
      "Smart_Lookup",
      "EDITABLE",
      "DYN_EMPLOYEES",
    ],
    ["FORM_SYS_AddUser", "Account", "USR_Name", "Text", "LOCKED_ON_EDIT", ""],
    ["FORM_SYS_AddUser", "Account", "EMP_Email", "Text", "READ_ONLY", ""],
    [
      "FORM_SYS_AddUser",
      "Security",
      "Password_Hash",
      "Password",
      "EDITABLE",
      "",
    ],
    [
      "FORM_SYS_AddUser",
      "Security",
      "ROL_ID",
      "Dropdown",
      "EDITABLE",
      "DYN_ROLES",
    ],
    // Add Role
    ["FORM_SYS_AddRole", "Role Info", "ROL_Title", "Text", "EDITABLE", ""],
    ["FORM_SYS_AddRole", "Role Info", "ROL_Notes", "Text", "EDITABLE", ""],
    // Add Doc
    [
      "FORM_SYS_AddDocument",
      "File Info",
      "DOC_Entity",
      "Dropdown",
      "LOCKED_ON_EDIT",
      "DD_Attachment_Entities",
    ],
    ["FORM_SYS_AddDocument", "File Info", "DOC_Label", "Text", "EDITABLE", ""],
    [
      "FORM_SYS_AddDocument",
      "Upload",
      "DOC_Drive_URL",
      "Attachment_Area",
      "EDITABLE",
      "",
    ],
    // Add Holiday
    [
      "FORM_SYS_AddPubHoliday",
      "Main",
      "Pub_Holiday_Name",
      "Text",
      "EDITABLE",
      "",
    ],
    [
      "FORM_SYS_AddPubHoliday",
      "Main",
      "Pub_Holiday_Date",
      "Date",
      "EDITABLE",
      "",
    ],
    // VIEW USER (Smart View)
    ["FORM_SYS_ViewUser", "Profile", "USR_ID", "Text", "READ_ONLY", ""],
    ["FORM_SYS_ViewUser", "Profile", "EMP_Name_EN", "Text", "READ_ONLY", ""],
    [
      "FORM_SYS_ViewUser",
      "Activity Log",
      "AUD_ID",
      "Related_View",
      "READ_ONLY",
      "SYS_Audit_Log",
    ],
    [
      "FORM_SYS_ViewUser",
      "Sessions",
      "SESS_ID",
      "Related_View",
      "READ_ONLY",
      "SYS_Sessions",
    ],
    // VIEW ROLE
    ["FORM_SYS_ViewRole", "Info", "ROL_Title", "Text", "READ_ONLY", ""],
    [
      "FORM_SYS_ViewRole",
      "Permissions",
      "SRP_ID",
      "Related_View",
      "READ_ONLY",
      "SYS_Role_Permissions",
    ],
    // Add Permission
    ["FORM_SYS_AddPermission", "Permission Info", "PRM_Name", "Text", "EDITABLE", ""],
    ["FORM_SYS_AddPermission", "Permission Info", "PRM_Notes", "Text", "EDITABLE", ""],
    ["FORM_SYS_AddPermission", "Permission Info", "PRM_Catg", "Dropdown", "EDITABLE", "DD_Permission_Categories"],
    // Add Role Permission
    ["FORM_SYS_AddRolePermission", "Role", "ROL_ID", "Dropdown", "EDITABLE", "DYN_ROLES"],
    ["FORM_SYS_AddRolePermission", "Permission", "PRM_ID", "Dropdown", "EDITABLE", "DYN_PERMISSIONS"],
    ["FORM_SYS_AddRolePermission", "Settings", "SRP_Is_Allowed", "Dropdown", "EDITABLE", "DD_YesNo"],
    // View Permission
    ["FORM_SYS_ViewPermission", "Info", "PRM_Name", "Text", "READ_ONLY", ""],
    ["FORM_SYS_ViewPermission", "Info", "PRM_Notes", "Text", "READ_ONLY", ""],
    // View Role Permission
    ["FORM_SYS_ViewRolePermission", "Info", "ROL_ID", "Text", "READ_ONLY", ""],
    ["FORM_SYS_ViewRolePermission", "Info", "PRM_ID", "Text", "READ_ONLY", ""],
    // View Audit Log
    ["FORM_SYS_ViewAuditLog", "Details", "AUD_ID", "Text", "READ_ONLY", ""],
    ["FORM_SYS_ViewAuditLog", "Details", "USR_Action", "Text", "READ_ONLY", ""],
    ["FORM_SYS_ViewAuditLog", "Details", "ACT_Description", "Text", "READ_ONLY", ""],
    // View Session
    ["FORM_SYS_ViewSession", "Details", "SESS_ID", "Text", "READ_ONLY", ""],
    ["FORM_SYS_ViewSession", "Details", "SESS_Status", "Text", "READ_ONLY", ""],
    ["FORM_SYS_ViewSession", "Details", "SESS_Start_At", "Date", "READ_ONLY", ""],
    // View Document
    ["FORM_SYS_ViewDocument", "Details", "DOC_ID", "Text", "READ_ONLY", ""],
    ["FORM_SYS_ViewDocument", "Details", "DOC_File_Name", "Text", "READ_ONLY", ""],
    ["FORM_SYS_ViewDocument", "Details", "DOC_Drive_URL", "Text", "READ_ONLY", ""],
    // View Pub Holiday
    ["FORM_SYS_ViewPubHoliday", "Details", "PUBHOL_ID", "Text", "READ_ONLY", ""],
    ["FORM_SYS_ViewPubHoliday", "Details", "Pub_Holiday_Name", "Text", "READ_ONLY", ""],
    ["FORM_SYS_ViewPubHoliday", "Details", "Pub_Holiday_Date", "Date", "READ_ONLY", ""]
  );

  // --- HRM MODULE ---
  forms.push(
    // Add Dept
    ["FORM_HRM_AddDepartment", "Main", "DEPT_Name", "Text", "EDITABLE", ""],
    // Add Emp
    ["FORM_HRM_AddEmployee", "Personal", "EMP_Name_AR", "Text", "EDITABLE", ""],
    ["FORM_HRM_AddEmployee", "Personal", "EMP_Name_EN", "Text", "EDITABLE", ""],
    [
      "FORM_HRM_AddEmployee",
      "Personal",
      "EMP_Mob_Main",
      "Text",
      "EDITABLE",
      "",
    ],
    [
      "FORM_HRM_AddEmployee",
      "Job",
      "Job_Title",
      "Dropdown",
      "EDITABLE",
      "DD_Job_Titles",
    ],
    [
      "FORM_HRM_AddEmployee",
      "Job",
      "DEPT_Name",
      "Dropdown",
      "EDITABLE",
      "DYN_DEPTS",
    ],
    ["FORM_HRM_AddEmployee", "Job", "Hire_Date", "Date", "EDITABLE", ""],
    [
      "FORM_HRM_AddEmployee",
      "Financial",
      "Basic_Salary",
      "Number",
      "EDITABLE",
      "",
    ],
    // Add Attendance
    [
      "FORM_HRM_AddAttendance",
      "Entry",
      "EMP_ID",
      "Smart_Lookup",
      "EDITABLE",
      "DYN_EMPLOYEES",
    ],
    ["FORM_HRM_AddAttendance", "Entry", "ATT_Date", "Date", "EDITABLE", ""],
    ["FORM_HRM_AddAttendance", "Entry", "ATT_Check_In", "Text", "EDITABLE", ""],
    [
      "FORM_HRM_AddAttendance",
      "Entry",
      "ATT_Check_Out",
      "Text",
      "EDITABLE",
      "",
    ],
    // Add Leave
    [
      "FORM_HRM_AddLeave",
      "Request",
      "EMP_ID",
      "Smart_Lookup",
      "EDITABLE",
      "DYN_EMPLOYEES",
    ],
    [
      "FORM_HRM_AddLeave",
      "Request",
      "LV_Type",
      "Dropdown",
      "EDITABLE",
      "DD_Leave_Type",
    ],
    ["FORM_HRM_AddLeave", "Request", "LV_Start_Date", "Date", "EDITABLE", ""],
    ["FORM_HRM_AddLeave", "Request", "LV_End_Date", "Date", "EDITABLE", ""],
    // Add Advance
    [
      "FORM_HRM_AddAdvance",
      "Request",
      "EMP_ID",
      "Smart_Lookup",
      "EDITABLE",
      "DYN_EMPLOYEES",
    ],
    ["FORM_HRM_AddAdvance", "Request", "ADV_Amnt", "Number", "EDITABLE", ""],
    [
      "FORM_HRM_AddAdvance",
      "Request",
      "ADV_Issue_Date",
      "Date",
      "EDITABLE",
      "",
    ],
    // Add OT
    [
      "FORM_HRM_AddOverTime",
      "Entry",
      "EMP_ID",
      "Smart_Lookup",
      "EDITABLE",
      "DYN_EMPLOYEES",
    ],
    ["FORM_HRM_AddOverTime", "Entry", "ATT_Date", "Date", "EDITABLE", ""],
    ["FORM_HRM_AddOverTime", "Entry", "OT_Amnt", "Number", "EDITABLE", ""],
    // Add Deduction
    [
      "FORM_HRM_AddDeduction",
      "Entry",
      "EMP_ID",
      "Smart_Lookup",
      "EDITABLE",
      "DYN_EMPLOYEES",
    ],
    ["FORM_HRM_AddDeduction", "Entry", "DEDCT_Amnt", "Number", "EDITABLE", ""],
    ["FORM_HRM_AddDeduction", "Entry", "DEDCT_Date", "Date", "EDITABLE", ""],

    // VIEW EMPLOYEE (360)
    [
      "FORM_HRM_ViewEmployee",
      "Profile",
      "EMP_Name_AR",
      "Text",
      "READ_ONLY",
      "",
    ],
    ["FORM_HRM_ViewEmployee", "Profile", "Job_Title", "Text", "READ_ONLY", ""],
    [
      "FORM_HRM_ViewEmployee",
      "Attendance",
      "ATT_ID",
      "Related_View",
      "READ_ONLY",
      "HRM_Attendance",
    ],
    [
      "FORM_HRM_ViewEmployee",
      "Leaves",
      "LV_ID",
      "Related_View",
      "READ_ONLY",
      "HRM_Leave",
    ],
    [
      "FORM_HRM_ViewEmployee",
      "Financials",
      "PAY_ID",
      "Related_View",
      "READ_ONLY",
      "FIN_HRM_Payroll",
    ],
    [
      "FORM_HRM_ViewEmployee",
      "Custody",
      "CSTD_ID",
      "Related_View",
      "READ_ONLY",
      "FIN_Custody",
    ],
    // View Department
    ["FORM_HRM_ViewDepartment", "Info", "DEPT_Name", "Text", "READ_ONLY", ""],
    [
      "FORM_HRM_ViewDepartment",
      "Employees",
      "EMP_ID",
      "Related_View",
      "READ_ONLY",
      "HRM_Employees",
    ],
    // View Attendance
    ["FORM_HRM_ViewAttendance", "Details", "ATT_ID", "Text", "READ_ONLY", ""],
    ["FORM_HRM_ViewAttendance", "Details", "ATT_Date", "Date", "READ_ONLY", ""],
    ["FORM_HRM_ViewAttendance", "Details", "ATT_Check_In", "Text", "READ_ONLY", ""],
    // View Leave
    ["FORM_HRM_ViewLeave", "Details", "LV_ID", "Text", "READ_ONLY", ""],
    ["FORM_HRM_ViewLeave", "Details", "LV_Type", "Text", "READ_ONLY", ""],
    ["FORM_HRM_ViewLeave", "Details", "LV_Start_Date", "Date", "READ_ONLY", ""],
    // View Advance
    ["FORM_HRM_ViewAdvance", "Details", "ADV_ID", "Text", "READ_ONLY", ""],
    ["FORM_HRM_ViewAdvance", "Details", "ADV_Amnt", "Number", "READ_ONLY", ""],
    ["FORM_HRM_ViewAdvance", "Details", "ADV_Status", "Text", "READ_ONLY", ""],
    // View OverTime
    ["FORM_HRM_ViewOverTime", "Details", "OT_ID", "Text", "READ_ONLY", ""],
    ["FORM_HRM_ViewOverTime", "Details", "OT_Amnt", "Number", "READ_ONLY", ""],
    ["FORM_HRM_ViewOverTime", "Details", "ATT_Date", "Date", "READ_ONLY", ""],
    // View Deduction
    ["FORM_HRM_ViewDeduction", "Details", "DEDCT_ID", "Text", "READ_ONLY", ""],
    ["FORM_HRM_ViewDeduction", "Details", "DEDCT_Amnt", "Number", "READ_ONLY", ""],
    ["FORM_HRM_ViewDeduction", "Details", "DEDCT_Date", "Date", "READ_ONLY", ""]
  );

  // --- PRJ MODULE ---
  forms.push(
    // Add Project
    ["FORM_PRJ_AddMain", "Project Info", "PRJ_Name", "Text", "EDITABLE", ""],
    [
      "FORM_PRJ_AddMain",
      "Project Info",
      "CLI_ID",
      "Smart_Lookup",
      "EDITABLE",
      "DYN_CLIENTS",
    ],
    [
      "FORM_PRJ_AddMain",
      "Project Info",
      "PRJ_Type",
      "Dropdown",
      "EDITABLE",
      "DD_Project_Type",
    ],
    ["FORM_PRJ_AddMain", "Planning", "Plan_Start_Date", "Date", "EDITABLE", ""],
    ["FORM_PRJ_AddMain", "Planning", "PRJ_Budget", "Number", "EDITABLE", ""],
    // Add Client
    ["FORM_PRJ_AddClient", "Info", "CLI_Name", "Text", "EDITABLE", ""],
    ["FORM_PRJ_AddClient", "Info", "CLI_Mob_1", "Text", "EDITABLE", ""],
    ["FORM_PRJ_AddClient", "Info", "CLI_Email", "Email", "EDITABLE", ""],
    // Add Task
    [
      "FORM_PRJ_AddTask",
      "Task Info",
      "PRJ_ID",
      "Smart_Lookup",
      "LOCKED_ON_EDIT",
      "DYN_PROJECTS",
    ],
    ["FORM_PRJ_AddTask", "Task Info", "TSK_Name", "Text", "EDITABLE", ""],
    [
      "FORM_PRJ_AddTask",
      "Task Info",
      "TSK_Priority",
      "Dropdown",
      "EDITABLE",
      "DD_Priority",
    ],
    [
      "FORM_PRJ_AddTask",
      "Assignment",
      "EMP_ID",
      "Smart_Lookup",
      "EDITABLE",
      "DYN_EMPLOYEES",
    ],
    // Add Material
    ["FORM_PRJ_AddMaterial", "Item", "MAT_Name", "Text", "EDITABLE", ""],
    [
      "FORM_PRJ_AddMaterial",
      "Item",
      "Default_Unit",
      "Dropdown",
      "EDITABLE",
      "DD_Units",
    ],

    // VIEW PROJECT (360)
    ["FORM_PRJ_ViewMain", "Overview", "PRJ_Name", "Text", "READ_ONLY", ""],
    ["FORM_PRJ_ViewMain", "Overview", "PRJ_Budget", "Number", "READ_ONLY", ""],
    [
      "FORM_PRJ_ViewMain",
      "Tasks",
      "TSK_ID",
      "Related_View",
      "READ_ONLY",
      "PRJ_Tasks",
    ],
    [
      "FORM_PRJ_ViewMain",
      "Direct Costs",
      "DiEXP_ID",
      "Related_View",
      "READ_ONLY",
      "FIN_DirectExpenses",
    ],
    [
      "FORM_PRJ_ViewMain",
      "Allocated Costs",
      "ALO_TM_ID",
      "Related_View",
      "READ_ONLY",
      "PRJ_IndirExp_Time_Alloc",
    ],
    [
      "FORM_PRJ_ViewMain",
      "Revenue",
      "REV_ID",
      "Related_View",
      "READ_ONLY",
      "FIN_PRJ_Revenue",
    ],
    // VIEW CLIENT
    ["FORM_PRJ_ViewClient", "Profile", "CLI_Name", "Text", "READ_ONLY", ""],
    [
      "FORM_PRJ_ViewClient",
      "Projects",
      "PRJ_ID",
      "Related_View",
      "READ_ONLY",
      "PRJ_Main",
    ],
    // View Task
    ["FORM_PRJ_ViewTask", "Details", "TSK_ID", "Text", "READ_ONLY", ""],
    ["FORM_PRJ_ViewTask", "Details", "TSK_Name", "Text", "READ_ONLY", ""],
    ["FORM_PRJ_ViewTask", "Details", "TSK_Status", "Text", "READ_ONLY", ""],
    // View Material
    ["FORM_PRJ_ViewMaterial", "Details", "MAT_ID", "Text", "READ_ONLY", ""],
    ["FORM_PRJ_ViewMaterial", "Details", "MAT_Name", "Text", "READ_ONLY", ""],
    ["FORM_PRJ_ViewMaterial", "Details", "MAT_Catg", "Text", "READ_ONLY", ""]
  );

  // --- FIN MODULE ---
  forms.push(
    // Add Direct Exp
    [
      "FORM_FIN_AddDirectExpense",
      "Expense Info",
      "PRJ_ID",
      "Smart_Lookup",
      "EDITABLE",
      "DYN_PROJECTS",
    ],
    [
      "FORM_FIN_AddDirectExpense",
      "Expense Info",
      "DiEXP_Date",
      "Date",
      "EDITABLE",
      "",
    ],
    [
      "FORM_FIN_AddDirectExpense",
      "Details",
      "MAT_ID",
      "Smart_Lookup",
      "EDITABLE",
      "DYN_MATERIALS",
    ],
    [
      "FORM_FIN_AddDirectExpense",
      "Details",
      "DiEXP_Total_VAT_Inc",
      "Number",
      "EDITABLE",
      "",
    ],
    [
      "FORM_FIN_AddDirectExpense",
      "Payment",
      "DiEXP_Pay_Methd",
      "Dropdown",
      "EDITABLE",
      "DD_Payment_Method",
    ],
    [
      "FORM_FIN_AddDirectExpense",
      "Payment",
      "CSTD_ID",
      "Smart_Lookup",
      "EDITABLE",
      "DYN_CUSTODY",
    ], // If Pay via Custody
    // Add Indirect Time
    [
      "FORM_FIN_AddInDirectExpense_Time",
      "Main",
      "InDiEXP_TM_Catg",
      "Dropdown",
      "EDITABLE",
      "DD_Expense_Category",
    ],
    [
      "FORM_FIN_AddInDirectExpense_Time",
      "Main",
      "InDiEXP_Start",
      "Date",
      "EDITABLE",
      "",
    ],
    [
      "FORM_FIN_AddInDirectExpense_Time",
      "Main",
      "InDiEXP_End",
      "Date",
      "EDITABLE",
      "",
    ],
    // Add Indirect NoTime
    [
      "FORM_FIN_AddInDirectExpense_NoTime",
      "Main",
      "InDiEXP_NT_Catg",
      "Dropdown",
      "EDITABLE",
      "DD_Expense_Category",
    ],
    [
      "FORM_FIN_AddInDirectExpense_NoTime",
      "Main",
      "Depreciation_Start_Date",
      "Date",
      "EDITABLE",
      "",
    ],
    // Add Revenue
    [
      "FORM_FIN_AddPRJ_Revenue",
      "Revenue Info",
      "PRJ_ID",
      "Smart_Lookup",
      "EDITABLE",
      "DYN_PROJECTS",
    ],
    [
      "FORM_FIN_AddPRJ_Revenue",
      "Revenue Info",
      "REV_Date",
      "Date",
      "EDITABLE",
      "",
    ],
    [
      "FORM_FIN_AddPRJ_Revenue",
      "Revenue Info",
      "REV_Amnt",
      "Number",
      "EDITABLE",
      "",
    ],
    // Add Custody
    [
      "FORM_FIN_AddCustody",
      "Info",
      "EMP_ID",
      "Smart_Lookup",
      "EDITABLE",
      "DYN_EMPLOYEES",
    ],
    ["FORM_FIN_AddCustody", "Info", "CSTD_Amnt", "Number", "EDITABLE", ""],
    // Payroll
    [
      "FORM_FIN_AddHRM_Payroll",
      "Info",
      "EMP_ID",
      "Smart_Lookup",
      "EDITABLE",
      "DYN_EMPLOYEES",
    ],
    [
      "FORM_FIN_AddHRM_Payroll",
      "Info",
      "PAY_Net_Pay",
      "Number",
      "EDITABLE",
      "",
    ],

    // View Custody
    ["FORM_FIN_ViewCustody", "Details", "EMP_Name", "Text", "READ_ONLY", ""],
    ["FORM_FIN_ViewCustody", "Details", "CSTD_Amnt", "Number", "READ_ONLY", ""],
    // View Direct Expense
    ["FORM_FIN_ViewDirectExpense", "Details", "DiEXP_ID", "Text", "READ_ONLY", ""],
    ["FORM_FIN_ViewDirectExpense", "Details", "DiEXP_Date", "Date", "READ_ONLY", ""],
    ["FORM_FIN_ViewDirectExpense", "Details", "DiEXP_Total_VAT_Inc", "Number", "READ_ONLY", ""],
    // View Indirect Expense Time
    ["FORM_FIN_ViewInDirectExpense_Time", "Details", "InDiEXP_TM_ID", "Text", "READ_ONLY", ""],
    ["FORM_FIN_ViewInDirectExpense_Time", "Details", "InDiEXP_Start", "Date", "READ_ONLY", ""],
    ["FORM_FIN_ViewInDirectExpense_Time", "Details", "InDiEXP_End", "Date", "READ_ONLY", ""],
    // View Indirect Expense NoTime
    ["FORM_FIN_ViewInDirectExpense_NoTime", "Details", "InDiEXP_NT_ID", "Text", "READ_ONLY", ""],
    ["FORM_FIN_ViewInDirectExpense_NoTime", "Details", "InDiEXP_NT_Catg", "Text", "READ_ONLY", ""],
    // View PRJ Revenue
    ["FORM_FIN_ViewPRJ_Revenue", "Details", "REV_ID", "Text", "READ_ONLY", ""],
    ["FORM_FIN_ViewPRJ_Revenue", "Details", "REV_Date", "Date", "READ_ONLY", ""],
    ["FORM_FIN_ViewPRJ_Revenue", "Details", "REV_Amnt", "Number", "READ_ONLY", ""],
    // View HRM Payroll
    ["FORM_FIN_ViewHRM_Payroll", "Details", "PAY_ID", "Text", "READ_ONLY", ""],
    ["FORM_FIN_ViewHRM_Payroll", "Details", "PAY_Net_Pay", "Number", "READ_ONLY", ""],
    ["FORM_FIN_ViewHRM_Payroll", "Details", "PAY_Status", "Text", "READ_ONLY", ""]
  );

  formSheet.getRange(2, 1, forms.length, 6).setValues(forms);

  Browser.msgBox("FULL SYSTEM SEEDING COMPLETE! 🚀🦅");
}

/**
 * Adds a custom menu to the Google Sheets UI.
 * Menu: "Nijj_Interaction_Sys" → "Run System" (opens sidebar)
 * Also includes "Extract ERP Data" option
 */
function onOpen() {
  try {
    var ui = SpreadsheetApp.getUi();
    ui.createMenu("Nijj_Interaction_Sys")
      .addItem("Run System", "showSidebar")
      .addSeparator()
      .addItem("Extract ERP Data", "extractERPSchemaAndEngineIDs")
      .addToUi();
    Logger.log("[Menu] Nijj_Interaction_Sys menu registered.");
  } catch (e) {
    Logger.log("[Menu-Error] " + e);
  }
}

/**
 * Shows the Nijjara Orchestrator sidebar with checkboxes for database management tasks
 */
function showSidebar() {
  try {
    var html = HtmlService.createHtmlOutputFromFile("Sidebar")
      .setTitle("Nijjara Orchestrator")
      .setWidth(350);
    SpreadsheetApp.getUi().showSidebar(html);
  } catch (e) {
    // If Sidebar.html doesn't exist, create inline HTML
    var htmlContent = '<!DOCTYPE html><html><head><base target="_top"><meta charset="UTF-8"><style>body{font-family:Cairo,sans-serif;padding:20px;direction:rtl;}h2{color:#0078f0;}label{display:block;margin:10px 0;cursor:pointer;}input[type="checkbox"]{margin-left:10px;}button{background:#0078f0;color:white;border:none;padding:10px 20px;border-radius:5px;cursor:pointer;margin-top:20px;font-family:Cairo,sans-serif;}button:hover{background:#0056b3;}</style></head><body><h2>نظام إدارة قاعدة البيانات</h2><form id="taskForm"><label><input type="checkbox" name="tasks" value="DELETE_HRM"> حذف جميع أوراق HRM</label><label><input type="checkbox" name="tasks" value="DELETE_PRJ"> حذف جميع أوراق PRJ</label><label><input type="checkbox" name="tasks" value="DELETE_FIN"> حذف جميع أوراق FIN</label><label><input type="checkbox" name="tasks" value="WIPE_ENG"> مسح بيانات ENG (مع الحفاظ على الرؤوس)</label><label><input type="checkbox" name="tasks" value="WIPE_SYS"> مسح بيانات SYS (مع الحفاظ على الرؤوس)</label><label><input type="checkbox" name="tasks" value="BUILD_SCHEMA"> إنشاء/إعادة بناء المخطط</label><label><input type="checkbox" name="tasks" value="SEED_ENG"> زرع بيانات التكوين الرئيسية (ENG)</label><label><input type="checkbox" name="tasks" value="SEED_DEMO"> زرع بيانات تجريبية</label><button type="button" onclick="executeTasks()">تنفيذ</button></form><div id="result" style="margin-top:20px;"></div><script>function executeTasks(){var checkboxes=document.querySelectorAll(\'input[name="tasks"]:checked\');var tasks=Array.from(checkboxes).map(cb=>cb.value);if(tasks.length===0){alert("يرجى اختيار مهمة واحدة على الأقل");return;}document.getElementById("result").innerHTML="<p>جاري التنفيذ...</p>";google.script.run.withSuccessHandler(function(result){document.getElementById("result").innerHTML="<pre>"+result.log+"</pre>";if(result.success){alert("تم التنفيذ بنجاح!");}else{alert("حدث خطأ أثناء التنفيذ");}}).withFailureHandler(function(error){document.getElementById("result").innerHTML="<p style=\'color:red;\'>خطأ: "+error+"</p>";}).processSidebarQueue(tasks);}</script></body></html>';
    var html = HtmlService.createHtmlOutput(htmlContent)
      .setTitle("Nijjara Orchestrator")
      .setWidth(350);
    SpreadsheetApp.getUi().showSidebar(html);
  }
}

/**
 * Processes the sidebar task queue with smart sequencing
 * Priority: DELETE Sheets > WIPE Data > SCHEMA Create > SEED Data
 */
function processSidebarQueue(taskList) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var logs = [];
    var results = { success: true, log: "" };

    // Smart sequencing: Reorder tasks to prevent conflicts
    var orderedTasks = [];
    var deleteTasks = [];
    var wipeTasks = [];
    var buildTasks = [];
    var seedTasks = [];

    for (var t = 0; t < taskList.length; t++) {
      var task = String(taskList[t]).trim();
      if (task.indexOf("DELETE_") === 0) {
        deleteTasks.push(task);
      } else if (task.indexOf("WIPE_") === 0) {
        wipeTasks.push(task);
      } else if (task === "BUILD_SCHEMA") {
        buildTasks.push(task);
      } else if (task.indexOf("SEED_") === 0) {
        seedTasks.push(task);
      }
    }

    // Combine in priority order
    orderedTasks = deleteTasks.concat(wipeTasks).concat(buildTasks).concat(seedTasks);

    // Execute tasks sequentially
    for (var i = 0; i < orderedTasks.length; i++) {
      var task = orderedTasks[i];
      try {
        if (task === "DELETE_HRM") {
          deleteGroupSheets("HRM_");
          logs.push("SUCCESS: Deleted all HRM sheets");
        } else if (task === "DELETE_PRJ") {
          deleteGroupSheets("PRJ_");
          logs.push("SUCCESS: Deleted all PRJ sheets");
        } else if (task === "DELETE_FIN") {
          deleteGroupSheets("FIN_");
          logs.push("SUCCESS: Deleted all FIN sheets");
        } else if (task === "WIPE_ENG") {
          wipeGroupData("ENG_");
          logs.push("SUCCESS: Wiped ENG data (headers preserved)");
        } else if (task === "WIPE_SYS") {
          wipeGroupData("SYS_");
          logs.push("SUCCESS: Wiped SYS data (headers preserved)");
        } else if (task === "BUILD_SCHEMA") {
          runFullSystemSetup();
          logs.push("SUCCESS: Schema built/rebuilt");
        } else if (task === "SEED_ENG") {
          seedMasterConfiguration();
          logs.push("SUCCESS: Seeded ENG configuration");
        } else if (task === "SEED_DEMO") {
          seedDemoData({ employees: 25, departments: 5, users: 10, projects: 12, expenses: 40 });
          logs.push("SUCCESS: Seeded demo data");
        } else {
          logs.push("WARNING: Unknown task: " + task);
        }
      } catch (taskErr) {
        logs.push("FAILED: " + task + " - " + String(taskErr));
        results.success = false;
      }
    }

    results.log = logs.join("\n");
    return results;
  } catch (e) {
    return { success: false, log: "ERROR: " + String(e) };
  }
}

/**
 * Deletes all sheets starting with the given prefix
 */
function deleteGroupSheets(prefix) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheets = ss.getSheets();
    var deleted = 0;
    for (var s = 0; s < sheets.length; s++) {
      var name = sheets[s].getName();
      if (name.indexOf(prefix) === 0) {
        ss.deleteSheet(sheets[s]);
        deleted++;
      }
    }
    return deleted;
  } catch (e) {
    throw new Error("deleteGroupSheets failed: " + String(e));
  }
}

/**
 * Wipes data from Row 4 onwards, preserving headers (Rows 1-3)
 */
function wipeGroupData(prefix) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheets = ss.getSheets();
    var wiped = 0;
    for (var s = 0; s < sheets.length; s++) {
      var name = sheets[s].getName();
      if (name.indexOf(prefix) === 0) {
        var lastRow = sheets[s].getLastRow();
        if (lastRow > 3) {
          sheets[s].deleteRows(4, lastRow - 3);
          wiped++;
        }
      }
    }
    return wiped;
  } catch (e) {
    throw new Error("wipeGroupData failed: " + String(e));
  }
}

/**
 * Builds schema for a group (creates sheets with headers)
 */
function buildGroupSchema(prefix) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    // This is handled by runFullSystemSetup() which uses ERP_SCHEMA
    // This function is a placeholder for future group-specific schema building
    return true;
  } catch (e) {
    throw new Error("buildGroupSchema failed: " + String(e));
  }
}

/**
 * Seeds data for a group
 */
function seedGroupData(prefix) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    // This is handled by seedData_() and seedDemoData()
    // This function is a placeholder for future group-specific seeding
    return true;
  } catch (e) {
    throw new Error("seedGroupData failed: " + String(e));
  }
}

/**
 * Generates a status report from task execution results
 */
function generateReport(results) {
  try {
    if (!results || !results.log) {
      return "No results to report";
    }
    return results.log;
  } catch (e) {
    return "Error generating report: " + String(e);
  }
}

/**
 * extractERPSchemaAndEngineIDs
 *
 * Purpose:
 * - Extract complete ERP schema (tables, fields, visibility flags, relationships, metadata)
 * - Scan all Engine sheets (ENG_*) and collect all unique IDs
 * - Produce a single human‑readable JSON file saved beside the spreadsheet in Drive
 * - Single click execution via custom menu
 *
 * Output JSON structure:
 * {
 *   metadata: { timestamp, spreadsheetId, spreadsheetUrl, sheetCount },
 *   erpSchema: {
 *     tables: [ { name, columns: [ { systemKey, uiLabel, viewFlag } ] } ],
 *     relationships: {
 *       views: [ { viewId, sourceSheet } ],
 *       forms: [ { formId, targetSheet } ],
 *       smartLinks: [ { formId, columnPointer, dynLink } ]
 *     }
 *   },
 *   engineIDs: [ { sheetName, idColumn, ids: [ ... ] } ]
 * }
 */
function extractERPSchemaAndEngineIDs() {
  const ui = SpreadsheetApp.getUi();
  const ss = SpreadsheetApp.getActive();

  try {
    Logger.log("[Extract] Started ERPSchema + EngineIDs extraction...");

    // Build ERP schema from spreadsheet
    const schema = buildERPSchema_(ss);
    Logger.log("[Extract] Schema built: tables=" + schema.tables.length);

    // Extract Engine IDs from ENG_* sheets
    const engineIDs = extractEngineIDs_(ss);
    Logger.log("[Extract] Engine IDs sets=" + engineIDs.length);

    // Metadata
    const timestamp = new Date();
    const meta = {
      timestamp: Utilities.formatDate(
        timestamp,
        Session.getScriptTimeZone(),
        "yyyy-MM-dd'T'HH:mm:ss"
      ),
      spreadsheetId: ss.getId(),
      spreadsheetUrl: ss.getUrl(),
      sheetCount: ss.getSheets().length,
    };

    // Compose output
    const output = {
      metadata: meta,
      erpSchema: schema,
      engineIDs: engineIDs,
    };

    // Save JSON to same Drive folder as spreadsheet
    const fileName = formatTimestamp_(timestamp) + "_ERPSchema_EngineIDs.json";
    const json = JSON.stringify(output, null, 2);

    try {
      const blob = Utilities.newBlob(json, "application/json", fileName);
      const file = DriveApp.createFile(blob);
      tryMoveFileToSpreadsheetFolder_(ss, file);
      const fileUrl = file.getUrl();
      Logger.log("[Extract] File created: " + fileUrl);
      ui.alert(
        "تم الاستخراج بنجاح",
        "Created JSON: " + fileName + "\n" + fileUrl,
        ui.ButtonSet.OK
      );
    } catch (rootErr) {
      Logger.log("[Extract-Warn] Drive create failed: " + rootErr);
      const sheetName =
        "EXPORT_ERPSchema_EngineIDs_" + formatTimestamp_(timestamp);
      const exportSheet =
        ss.getSheetByName(sheetName) || ss.insertSheet(sheetName);
      writeJsonToSheet_(exportSheet, json);
      Logger.log("[Extract] JSON written to sheet: " + sheetName);
      ui.alert(
        "تم الاستخراج بنجاح",
        "Created JSON in sheet: " + sheetName,
        ui.ButtonSet.OK
      );
    }

    // Build and persist formatted summary text (shape view)
    const summaryText = formatSchemaSummary_(schema, engineIDs);
    const summaryName =
      formatTimestamp_(timestamp) + "_ERPSchema_EngineIDs.txt";
    try {
      const txtBlob = Utilities.newBlob(summaryText, "text/plain", summaryName);
      const txtFile = DriveApp.createFile(txtBlob);
      tryMoveFileToSpreadsheetFolder_(ss, txtFile);
      Logger.log("[Extract] Summary TXT created: " + txtFile.getUrl());
    } catch (e) {
      Logger.log("[Extract-Warn] TXT create failed: " + e);
      const sheetName2 =
        "EXPORT_SUMMARY_ERPSchema_" + formatTimestamp_(timestamp);
      const sheet2 =
        ss.getSheetByName(sheetName2) || ss.insertSheet(sheetName2);
      writeTextToSheet_(sheet2, summaryText);
      Logger.log("[Extract] Summary written to sheet: " + sheetName2);
    }
  } catch (error) {
    Logger.log("[Extract-Error] " + error);
    ui.alert("خطأ في الاستخراج", String(error), ui.ButtonSet.OK);
  }
}

/**
 * Build ERP schema by reading the first three header rows (Smart Header Protocol)
 * and collecting relationships from ENG_Settings, ENG_Views, ENG_Forms.
 */
function buildERPSchema_(ss) {
  const tables = [];
  const sheets = ss.getSheets();

  sheets.forEach((sh) => {
    const name = sh.getName();
    const lastRow = sh.getLastRow();
    const lastCol = sh.getLastColumn();
    if (lastCol === 0) return;

    // Read header rows (1..3). If missing, gracefully fallback to blanks.
    const h1 = lastRow >= 1 ? sh.getRange(1, 1, 1, lastCol).getValues()[0] : [];
    const h2 = lastRow >= 2 ? sh.getRange(2, 1, 1, lastCol).getValues()[0] : [];
    const h3 = lastRow >= 3 ? sh.getRange(3, 1, 1, lastCol).getValues()[0] : [];

    const columns = [];
    for (let c = 0; c < lastCol; c++) {
      columns.push({
        systemKey: String(h1[c] || ""),
        uiLabel: String(h2[c] || ""),
        viewFlag: String(h3[c] || ""),
      });
    }

    tables.push({ name, columns });
  });

  // Relationships from Engine sheets
  const relationships = {
    views: [],
    forms: [],
    smartLinks: [],
  };

  // ENG_Views: { VIEW_ID, Source_Sheet }
  const vSheet = ss.getSheetByName("ENG_Views");
  if (vSheet) {
    const lr = vSheet.getLastRow();
    const lc = vSheet.getLastColumn();
    if (lr >= 4 && lc >= 3) {
      const vals = vSheet.getRange(4, 1, lr - 3, lc).getValues();
      vals.forEach((row) => {
        const viewId = row[0];
        const sourceSheet = row[2];
        if (viewId && sourceSheet)
          relationships.views.push({ viewId, sourceSheet });
      });
    }
  }

  // ENG_Settings: map FORM_ID to Target_Sheet
  const sSheet = ss.getSheetByName("ENG_Settings");
  if (sSheet) {
    const lr = sSheet.getLastRow();
    const lc = sSheet.getLastColumn();
    if (lr >= 4 && lc >= 2) {
      const vals = sSheet.getRange(4, 1, lr - 3, lc).getValues();
      vals.forEach((row) => {
        const formId = row[0];
        const targetSheet = row[1];
        if (formId && targetSheet)
          relationships.forms.push({ formId, targetSheet });
      });
    }
  }

  // ENG_Forms: Smart Links via DYN_Link for lookups/dropdowns
  const fSheet = ss.getSheetByName("ENG_Forms");
  if (fSheet) {
    const lr = fSheet.getLastRow();
    const lc = fSheet.getLastColumn();
    if (lr >= 4 && lc >= 6) {
      const vals = fSheet.getRange(4, 1, lr - 3, lc).getValues();
      vals.forEach((row) => {
        const formId = row[0];
        const columnPointer = row[2];
        const dynLink = row[5];
        if (formId && columnPointer && dynLink) {
          relationships.smartLinks.push({ formId, columnPointer, dynLink });
        }
      });
    }
  }

  return { tables, relationships };
}

/**
 * Extract IDs from all ENG_* sheets using header detection for ID columns.
 * ID column detection rules:
 * - First header row contains one of: FORM_ID, VIEW_ID, DD_ID, BTN_ID, Setting_Key
 * - Or any header ending with "_ID"
 * Data rows start at Row 4 by protocol.
 */
function extractEngineIDs_(ss) {
  const results = [];
  const sheets = ss.getSheets();
  const idHeaders = new Set([
    "FORM_ID",
    "VIEW_ID",
    "DD_ID",
    "BTN_ID",
    "Setting_Key",
  ]);

  sheets.forEach((sh) => {
    const name = sh.getName();
    if (!/^ENG_/i.test(name)) return;
    const lr = sh.getLastRow();
    const lc = sh.getLastColumn();
    if (lc === 0 || lr < 4) return;

    const headers = sh.getRange(1, 1, 1, lc).getValues()[0];

    // Find potential ID columns
    const idCols = [];
    headers.forEach((h, idx) => {
      const key = String(h || "").trim();
      if (!key) return;
      if (idHeaders.has(key) || /_ID$/i.test(key)) idCols.push(idx);
    });

    // If none detected, skip to avoid heavy reads
    if (!idCols.length) return;

    // Collect IDs per detected column
    idCols.forEach((colIdx) => {
      const colValues = sh.getRange(4, colIdx + 1, lr - 3, 1).getValues();
      const ids = Array.from(
        new Set(
          colValues
            .map((r) => String(r[0] || "").trim())
            .filter((v) => v && v !== "" && v !== "null" && v !== "undefined")
        )
      );
      if (ids.length) {
        results.push({ sheetName: name, idColumn: headers[colIdx], ids });
      }
    });
  });

  return results;
}

/** Formats timestamp as YYYY-MM-DD_HH-MM-SS */
function formatTimestamp_(d) {
  const pad = (n) => String(n).padStart(2, "0");
  const y = d.getFullYear();
  const M = pad(d.getMonth() + 1);
  const D = pad(d.getDate());
  const h = pad(d.getHours());
  const m = pad(d.getMinutes());
  const s = pad(d.getSeconds());
  return `${y}-${M}-${D}_${h}-${m}-${s}`;
}

/** Returns the parent Drive folder of the spreadsheet, or root as fallback */
function getSpreadsheetParentFolder_(ss) {
  try {
    const file = DriveApp.getFileById(ss.getId());
    const parents = file.getParents();
    return parents.hasNext() ? parents.next() : DriveApp.getRootFolder();
  } catch (e) {
    return DriveApp.getRootFolder();
  }
}

function createJsonFileInFolder_(folder, name, content) {
  const blob = Utilities.newBlob(content, "application/json", name);
  let lastErr = null;
  for (let i = 0; i < 5; i++) {
    try {
      return folder.createFile(blob);
    } catch (e) {
      lastErr = e;
      Utilities.sleep(750 * (i + 1));
    }
  }
  try {
    const f = DriveApp.createFile(blob);
    try {
      f.moveTo(folder);
    } catch (_) {}
    return f;
  } catch (e2) {
    throw lastErr || e2;
  }
}

function tryMoveFileToSpreadsheetFolder_(ss, file) {
  try {
    const folder = getSpreadsheetParentFolder_(ss);
    file.moveTo(folder);
  } catch (e) {
    Logger.log("[Move-Warn] " + e);
  }
}

function writeJsonToSheet_(sheet, json) {
  sheet.clear();
  const lines = json.split("\n");
  const data = lines.map((l) => [l]);
  sheet.getRange(1, 1, data.length, 1).setValues(data);
}

function writeTextToSheet_(sheet, text) {
  sheet.clear();
  const lines = text.split("\n");
  const data = lines.map((l) => [l]);
  sheet.getRange(1, 1, data.length, 1).setValues(data);
}

function formatSchemaSummary_(schema, engineIDs) {
  const groups = { SYS: [], HRM: [], PRJ: [], FIN: [] };
  const tables = schema.tables || [];
  tables.forEach((t) => {
    const name = t.name || "";
    const prefix = name.split("_")[0];
    if (groups[prefix]) {
      const cols = t.columns || [];
      const keys = cols
        .map((c) => String(c.systemKey || ""))
        .filter((k) => k && k !== "");
      groups[prefix].push({ name, keys });
    }
  });

  function renderSection(title, list) {
    const lines = [];
    lines.push(title);
    list
      .sort((a, b) => a.name.localeCompare(b.name))
      .forEach((x) => {
        lines.push(
          "    " +
            padTableName_(x.name) +
            ": " +
            (x.keys.length ? x.keys.join(", ") : "")
        );
      });
    lines.push("");
    return lines.join("\n");
  }

  let out = "";
  out += renderSection("[ 1. SYSTEM CORE (SYS) ]", groups.SYS);
  out += renderSection("[ 2. HUMAN RESOURCES (HRM) ]", groups.HRM);
  out += renderSection("[ 3. PROJECTS (PRJ) ]", groups.PRJ);
  out += renderSection("[ 4. FINANCE (FIN) ]", groups.FIN);

  out += "[ ENGINE IDS ]\n";
  const ids = engineIDs || [];
  ids
    .sort((a, b) => a.sheetName.localeCompare(b.sheetName))
    .forEach((e) => {
      const first = (e.ids || []).slice(0, 10);
      out +=
        "    " +
        padTableName_(e.sheetName) +
        ": " +
        e.idColumn +
        " → " +
        first.join(", ") +
        "\n";
    });
  return out;
}

function selectKeyFields_(columns) {
  const keys = columns.map((c) => String(c.systemKey || ""));
  const pick = [];
  const limitTotal = 6;
  function add(matchFn) {
    for (let i = 0; i < keys.length; i++) {
      const k = keys[i];
      if (pick.length >= limitTotal) break;
      if (matchFn(k) && pick.indexOf(k) === -1) pick.push(k);
    }
  }
  add((k) => /_ID$/i.test(k) || k === "ID");
  add((k) => /Name|Title/i.test(k));
  add((k) => /Status/i.test(k));
  add((k) => /Amount|Amnt|Salary|Budget|Net_Pay|Total|Price/i.test(k));
  add((k) => /Date/i.test(k));
  return pick.slice(0, limitTotal);
}

function padTableName_(name) {
  const width = 20;
  if (name.length >= width) return name;
  return name + Array(width - name.length + 1).join(" ");
}
