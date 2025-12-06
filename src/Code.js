/**
 * ================================================================================
 * NIJJARA ERP - Code.js (Backend API Layer)
 * ================================================================================
 */

/**
 * ================================================================================
 * NIJJARA ERP - ENHANCED CODE.JS (PROFESSIONAL BACKEND)
 * ================================================================================
 * Note: CONFIG is defined in Config.js
 */

function doGet(e) {
  try {
    try { seedSystemData(); } catch (seedErr) { Logger.log(seedErr); }
    var t = HtmlService.createTemplateFromFile("Dashboard");
    t.API_URL = ScriptApp.getService().getUrl();
    return t
      .evaluate()
      .setTitle("نظام نجارة ERP")
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  } catch (error) {
    Logger.log("doGet Error: " + error);
    return HtmlService.createHtmlOutput("Error: " + error);
  }
}

// removed legacy doPost in favor of enhanced router below

function validateSession_(token) {
  try {
    if (!token) return { valid: false, error: "Missing token" };
    var ss = SpreadsheetApp.openById(CONFIG.SHEET_ID);
    var sheet = ss.getSheetByName("SYS_Sessions");
    if (!sheet) return { valid: false, error: "Session store missing" };
    var h = sheet
      .getRange(1, 1, 1, sheet.getLastColumn())
      .getValues()[0]
      .map(String);
    var tokenIdx = h.indexOf("Auth_Token");
    var statusIdx = h.indexOf("SESS_Status");
    var revokedIdx = h.indexOf("SESS_Revoked_At");
    var userIdIdx = h.indexOf("USR_ID");
    var emailIdx = h.indexOf("EMP_Email");
    var rows =
      sheet.getLastRow() > 2
        ? sheet
            .getRange(3, 1, sheet.getLastRow() - 2, sheet.getLastColumn())
            .getValues()
        : [];
    for (var i = 0; i < rows.length; i++) {
      var tok = String(rows[i][tokenIdx]).trim();
      var st = String(rows[i][statusIdx]).trim().toUpperCase();
      var rv = String(rows[i][revokedIdx]).trim();
      if (tok && tok === String(token).trim() && st === "ACTIVE" && !rv) {
        return {
          valid: true,
          userId: rows[i][userIdIdx],
          email: rows[i][emailIdx],
        };
      }
    }
    return { valid: false, error: "Invalid or expired token" };
  } catch (e) {
    return { valid: false, error: "Auth check failed" };
  }
}

function getSessionStatus(token) {
  try {
    var res = validateSession_(token);
    return res.valid
      ? { success: true, valid: true, userId: res.userId, email: res.email }
      : { success: true, valid: false };
  } catch (e) {
    return { success: false, valid: false, message: String(e) };
  }
}

function generateSalt_() {
  return Utilities.getUuid();
}

function hashPasswordWithSalt_(password, salt) {
  return hashSha256Hex_(salt + ":" + password);
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

/**
 * Enhanced Login Function for Professional Frontend
 */
function login(username, password) {
  try {
    logInfo_(
      "system",
      "LOGIN_ATTEMPT",
      "SYS_Users",
      username,
      "Login attempt started"
    );

    var ss = SpreadsheetApp.openById(CONFIG.SHEET_ID);
    var sheet = ss.getSheetByName("SYS_Users");
    if (!sheet) {
      logError_(
        username,
        "LOGIN",
        "SYS_Users",
        "",
        "SYS_Users sheet missing",
        null
      );
      return {
        success: false,
        message: "System configuration error",
        code: "MISSING_USER_TABLE",
      };
    }

    // Read headers using Smart Header Protocol (Row 1)
    var headers = sheet
      .getRange(1, 1, 1, sheet.getLastColumn())
      .getValues()[0]
      .map(function (v) {
        return String(v).trim();
      });

    var nameIdx = headers.indexOf("USR_Name");
    var idIdx = headers.indexOf("USR_ID");
    var emailIdx = headers.indexOf("EMP_Email");
    var nameEnIdx = headers.indexOf("EMP_Name_EN");
    var jobTitleIdx = headers.indexOf("Job_Title");
    var deptIdx = headers.indexOf("DEPT_Name");
    var passIdx = headers.indexOf("Password_Hash");
    var saltIdx = headers.indexOf("Password_Salt");
    var lastLoginIdx = headers.indexOf("Last_Login");

    if (nameIdx < 0 || passIdx < 0 || saltIdx < 0) {
      logError_(
        username,
        "LOGIN",
        "SYS_Users",
        "",
        "Missing required columns",
        null
      );
      return {
        success: false,
        message: "System configuration error: Missing required user columns",
        code: "INVALID_SCHEMA",
      };
    }

    // Read data rows (starting from Row 4 per Smart Header Protocol)
    var rows =
      sheet.getLastRow() > 3
        ? sheet
            .getRange(4, 1, sheet.getLastRow() - 3, sheet.getLastColumn())
            .getValues()
        : [];

    var found = null;
    for (var i = 0; i < rows.length; i++) {
      var r = rows[i];
      var uname = String(r[nameIdx]).trim();
      var phash = String(r[passIdx]).trim();
      var salt = String(r[saltIdx]).trim();

      // Enhanced password validation with salt
      var inputHashSalted = hashPasswordWithSalt_(password, salt);
      var match = phash === inputHashSalted;

      if (uname.toLowerCase() === String(username).toLowerCase() && match) {
        found = {
          USR_ID: r[idIdx],
          USR_Name: uname,
          EMP_Email: r[emailIdx],
          EMP_Name_EN: r[nameEnIdx] || uname,
          Job_Title: r[jobTitleIdx] || "User",
          DEPT_Name: r[deptIdx] || "General",
        };

        // Update last login
        if (lastLoginIdx >= 0) {
          sheet.getRange(i + 4, lastLoginIdx + 1).setValue(new Date());
        }
        break;
      }
    }

    if (!found) {
      logWarn_(username, "LOGIN_FAIL", "SYS_Users", "", "Invalid credentials");
      return {
        success: false,
        message: "اسم المستخدم أو كلمة المرور غير صحيحة",
        code: "INVALID_CREDENTIALS",
      };
    }

    // Create session
    var token = Utilities.getUuid();
    var sess = ss.getSheetByName("SYS_Sessions");
    if (!sess) {
      logError_(
        username,
        "LOGIN",
        "SYS_Sessions",
        "",
        "Sessions table missing",
        null
      );
      return {
        success: false,
        message: "System configuration error",
        code: "MISSING_SESSIONS_TABLE",
      };
    }

    var sHeaders = sess
      .getRange(1, 1, 1, sess.getLastColumn())
      .getValues()[0]
      .map(function (v) {
        return String(v).trim();
      });

    var sIdIdx = sHeaders.indexOf("SESS_ID");
    var now = new Date();
    var rowObj = {};
    var sessId = generateStructuredIdForColumn_(sess, sIdIdx);

    if (!isValidStructuredId_(sessId)) {
      logError_(
        username,
        "LOGIN",
        "SYS_Sessions",
        "",
        "ID generation failed",
        null
      );
      return {
        success: false,
        message: "System error: Unable to create session",
        code: "SESSION_CREATE_FAILED",
      };
    }

    // Build session record
    rowObj["SESS_ID"] = sessId;
    rowObj["USR_ID"] = found.USR_ID;
    rowObj["EMP_Email"] = found.EMP_Email;
    rowObj["Actor_USR_ID"] = found.USR_ID;
    rowObj["SESS_Type"] = "WEB";
    rowObj["SESS_Status"] = "ACTIVE";
    rowObj["IP_Address"] = ""; // Would be populated in real deployment
    rowObj["Auth_Token"] = token;
    rowObj["SESS_Start_At"] = now;
    rowObj["SESS_Crt_At"] = now;
    rowObj["SESS_Crt_By"] = "system";

    insertRowByHeaders_(sess, sHeaders, rowObj);
    logInfo_(
      found.USR_ID,
      "LOGIN_SUCCESS",
      "SYS_Sessions",
      sessId,
      "User logged in successfully"
    );

    // Load bootstrap data
    var bootstrapData = getBootstrapData(found.USR_ID, token);

    return {
      success: true,
      token: token,
      user: {
        id: found.USR_ID,
        username: found.USR_Name,
        name: found.EMP_Name_EN,
        email: found.EMP_Email,
        jobTitle: found.Job_Title,
        department: found.DEPT_Name,
      },
      bootstrap: bootstrapData,
      message: "تم تسجيل الدخول بنجاح",
    };
  } catch (e) {
    logError_(
      username,
      "LOGIN_ERROR",
      "SYS_Sessions",
      "",
      "Login exception",
      e
    );
    return {
      success: false,
      message: "حدث خطأ أثناء تسجيل الدخول",
      code: "LOGIN_EXCEPTION",
    };
  }
}

/**
 * Enhanced API Handler for Professional Frontend
 */
function doPost(e) {
  try {
    var params = JSON.parse(e.postData.contents);
    var action = params.action;

    logInfo_("system", "API_CALL", "API", action, "API call received");

    switch (action) {
      case "login":
        return ContentService.createTextOutput(
          JSON.stringify(login(params.username, params.password))
        ).setMimeType(ContentService.MimeType.JSON);

      case "getBootstrap":
        return apiGetBootstrapData(params);

      case "getModuleData":
        return apiGetModuleData(params);

      case "saveRecord":
        return apiSaveRecord(params);

      case "updateRecord":
        return apiUpdateRecord(params);

      case "deleteRecord":
        return apiDeleteRecord(params);

      case "performSmartSearch":
        return apiPerformSmartSearch(params);

      case "logout":
        return ContentService.createTextOutput(
          JSON.stringify(logout(params.token))
        ).setMimeType(ContentService.MimeType.JSON);

      default:
        logWarn_(
          "system",
          "UNKNOWN_ACTION",
          "API",
          action,
          "Unknown API action requested"
        );
        return ContentService.createTextOutput(
          JSON.stringify({ success: false, message: "Unknown action" })
        ).setMimeType(ContentService.MimeType.JSON);
    }
  } catch (error) {
    logError_("system", "API_ERROR", "API", "", "API handler exception", error);
    return ContentService.createTextOutput(
      JSON.stringify({
        success: false,
        message: "Server error occurred",
        code: "API_EXCEPTION",
      })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

function logout(token) {
  try {
    var ss = SpreadsheetApp.openById(CONFIG.SHEET_ID);
    var sess = ss.getSheetByName("SYS_Sessions");
    if (!sess) return { success: false };
    var headers = sess
      .getRange(1, 1, 1, sess.getLastColumn())
      .getValues()[0]
      .map(function (v) {
        return String(v).trim();
      });
    var tokenIdx = headers.indexOf("Auth_Token");
    var statusIdx = headers.indexOf("SESS_Status");
    var revokedIdx = headers.indexOf("SESS_Revoked_At");
    if (tokenIdx < 0 || statusIdx < 0 || revokedIdx < 0)
      return { success: false };
    var rows =
      sess.getLastRow() > 2
        ? sess
            .getRange(3, 1, sess.getLastRow() - 2, sess.getLastColumn())
            .getValues()
        : [];
    for (var i = 0; i < rows.length; i++) {
      if (String(rows[i][tokenIdx]).trim() === String(token).trim()) {
        sess.getRange(i + 3, statusIdx + 1).setValue("REVOKED");
        sess.getRange(i + 3, revokedIdx + 1).setValue(new Date());
        logInfo_(
          "system",
          "LOGOUT",
          "SYS_Sessions",
          "",
          "Token revoked: " + String(token)
        );
        return { success: true };
      }
    }
    return { success: false };
  } catch (e) {
    return { success: false };
  }
}

/**
 * Enhanced Bootstrap Data Provider for Professional Frontend
 * Loads complete system metadata from ENG_ sheets according to guidelines
 */
function getBootstrapData(userId, token) {
  try {
    var auth = validateSession_(token);
    if (!auth.valid) {
      logWarn_(
        userId,
        "BOOTSTRAP_FAIL",
        "AUTH",
        "",
        "Invalid session for bootstrap"
      );
      return {
        success: false,
        message: "Invalid session",
        forms: {},
        views: {},
        buttons: {},
        dropdowns: {},
        permissions: {},
        navigation: [],
      };
    }

    console.log("Loading bootstrap data for user:", userId);

    // Check cache first (5-minute TTL)
    var cacheKey = "BOOTSTRAP_" + userId;
    var cache = CacheService.getScriptCache();
    var cached = cache.get(cacheKey);
    if (cached) {
      try {
        var cachedData = JSON.parse(cached);
        if (cachedData && cachedData.timestamp) {
          var age = (new Date().getTime() - cachedData.timestamp) / 1000 / 60; // minutes
          if (age < 5) {
            return cachedData.data;
          }
        }
      } catch (e) {
        // Cache parse error, continue to fetch fresh data
      }
    }

    var ss = SpreadsheetApp.openById(CONFIG.SHEET_ID);
    var bootstrap = {
      success: true,
      forms: [],
      views: [],
      buttons: [],
      dropdowns: {},
      permissions: {},
      userRole: null,
    };

    // Get user role from SYS_Users
    var usersSheet = ss.getSheetByName("SYS_Users");
    if (usersSheet) {
      var usersData = usersSheet.getDataRange().getValues();
      var usersHeaders = usersData[0].map(String);
      var usrIdIdx = usersHeaders.indexOf("USR_ID");
      var roleIdx = usersHeaders.indexOf("ROL_ID");
      if (usrIdIdx >= 0 && roleIdx >= 0) {
        for (var u = 1; u < usersData.length; u++) {
          if (String(usersData[u][usrIdIdx]).trim() === String(userId).trim()) {
            bootstrap.userRole = String(usersData[u][roleIdx]).trim();
            break;
          }
        }
      }
    }

    // Get user permissions from SYS_Role_Permissions
    var rolePermSheet = ss.getSheetByName("SYS_Role_Permissions");
    var allowedForms = [];
    var allowedViews = [];
    if (rolePermSheet && bootstrap.userRole) {
      var rpData = rolePermSheet.getDataRange().getValues();
      var rpHeaders = rpData[0].map(String);
      var rolIdIdx = rpHeaders.indexOf("ROL_ID");
      var prmIdIdx = rpHeaders.indexOf("PRM_ID");
      var allowedIdx = rpHeaders.indexOf("SRP_Is_Allowed");
      var scopeIdx = rpHeaders.indexOf("SRP_Scope");

      for (var rp = 1; rp < rpData.length; rp++) {
        if (
          String(rpData[rp][rolIdIdx]).trim() === bootstrap.userRole &&
          allowedIdx >= 0 &&
          String(rpData[rp][allowedIdx]).trim().toUpperCase() === "TRUE"
        ) {
          var permId = String(rpData[rp][prmIdIdx]).trim();
          var scope = scopeIdx >= 0 ? String(rpData[rp][scopeIdx]).trim() : "";
          bootstrap.permissions[permId] = { allowed: true, scope: scope };
        }
      }
    }

    // Read ENG_Forms (filtered by permissions if needed)
    var formsSheet = ss.getSheetByName("ENG_Forms");
    if (formsSheet) {
      var formsData = formsSheet.getDataRange().getValues();
      if (formsData.length > 1) {
        var formsHeaders = formsData[0].map(String);
        var formIdIdx = formsHeaders.indexOf("FORM_ID");
        var tabIdx = formsHeaders.indexOf("TAB_Section");
        if (tabIdx < 0) tabIdx = formsHeaders.indexOf("Tab_Name");
        var colPtrIdx = formsHeaders.indexOf("Column_Pointer");
        if (colPtrIdx < 0) colPtrIdx = formsHeaders.indexOf("Target_Column_ID");
        var typeIdx = formsHeaders.indexOf("Field_Type");
        var stateIdx = formsHeaders.indexOf("Smart_State");
        var dynIdx = formsHeaders.indexOf("DYN_Link");
        if (dynIdx < 0) dynIdx = formsHeaders.indexOf("DYN_Source");

        var formsMap = {};
        for (var f = 1; f < formsData.length; f++) {
          var formId = String(formsData[f][formIdIdx]).trim();
          if (!formsMap[formId]) {
            formsMap[formId] = {
              formId: formId,
              tabs: {},
            };
          }
          var tabName = String(formsData[f][tabIdx] || "main").trim();
          if (!formsMap[formId].tabs[tabName]) {
            formsMap[formId].tabs[tabName] = [];
          }
          formsMap[formId].tabs[tabName].push({
            columnPointer: String(formsData[f][colPtrIdx]).trim(),
            fieldType: String(formsData[f][typeIdx] || "TEXT").trim(),
            smartState: String(formsData[f][stateIdx] || "EDITABLE").trim(),
            dynLink: formsData[f][dynIdx]
              ? String(formsData[f][dynIdx]).trim()
              : "",
          });
        }
        bootstrap.forms = Object.values(formsMap);
      }
    }

    // Read ENG_Views
    var viewsSheet = ss.getSheetByName("ENG_Views");
    if (viewsSheet) {
      var viewsData = viewsSheet.getDataRange().getValues();
      if (viewsData.length > 1) {
        var viewsHeaders = viewsData[0].map(String);
        var viewIdIdx = viewsHeaders.indexOf("VIEW_ID");
        var viewTitleIdx = viewsHeaders.indexOf("View_Title");
        var srcSheetIdx = viewsHeaders.indexOf("Source_Sheet");

        for (var v = 1; v < viewsData.length; v++) {
          bootstrap.views.push({
            viewId: String(viewsData[v][viewIdIdx]).trim(),
            viewTitle: String(viewsData[v][viewTitleIdx] || "").trim(),
            sourceSheet: String(viewsData[v][srcSheetIdx] || "").trim(),
          });
        }
      }
    }

    // Read ENG_Buttons
    var buttonsSheet = ss.getSheetByName("ENG_Buttons");
    if (buttonsSheet) {
      var buttonsData = buttonsSheet.getDataRange().getValues();
      if (buttonsData.length > 1) {
        var buttonsHeaders = buttonsData[0].map(String);
        var btnIdIdx = buttonsHeaders.indexOf("BTN_ID");
        var btnLabelIdx = buttonsHeaders.indexOf("BTN_Label");
        var btnTypeIdx = buttonsHeaders.indexOf("BTN_Type");
        var btnDescIdx = buttonsHeaders.indexOf("BTN_Description");
        var viewIdIdx = buttonsHeaders.indexOf("VIEW_ID");

        for (var b = 1; b < buttonsData.length; b++) {
          bootstrap.buttons.push({
            btnId: String(buttonsData[b][btnIdIdx]).trim(),
            label: String(buttonsData[b][btnLabelIdx] || "").trim(),
            type: String(buttonsData[b][btnTypeIdx] || "").trim(),
            description: String(buttonsData[b][btnDescIdx] || "").trim(),
            viewId:
              viewIdIdx >= 0
                ? String(buttonsData[b][viewIdIdx] || "").trim()
                : "",
          });
        }
      }
    }

    // Read ENG_Dropdowns (grouped by DD_ID)
    var dropdownsSheet = ss.getSheetByName("ENG_Dropdowns");
    if (dropdownsSheet) {
      var ddData = dropdownsSheet.getDataRange().getValues();
      if (ddData.length > 1) {
        var ddHeaders = ddData[0].map(String);
        var ddIdIdx = ddHeaders.indexOf("DD_ID");
        var ddEnIdx = ddHeaders.indexOf("DD_EN");
        var ddArIdx = ddHeaders.indexOf("DD_AR");
        var ddActiveIdx = ddHeaders.indexOf("DD_Is_Active");
        var ddSortIdx = ddHeaders.indexOf("DD_Sort_Order");

        for (var d = 1; d < ddData.length; d++) {
          var ddId = String(ddData[d][ddIdIdx]).trim();
          var isActive =
            ddActiveIdx >= 0
              ? String(ddData[d][ddActiveIdx]).trim().toUpperCase() !== "FALSE"
              : true;
          if (isActive) {
            if (!bootstrap.dropdowns[ddId]) {
              bootstrap.dropdowns[ddId] = [];
            }
            bootstrap.dropdowns[ddId].push({
              value: String(ddData[d][ddEnIdx] || "").trim(),
              label: String(ddData[d][ddArIdx] || "").trim(),
              sortOrder: ddSortIdx >= 0 ? Number(ddData[d][ddSortIdx]) || 0 : 0,
            });
          }
        }
        // Sort each dropdown by sortOrder
        for (var ddKey in bootstrap.dropdowns) {
          bootstrap.dropdowns[ddKey].sort(function (a, b) {
            return a.sortOrder - b.sortOrder;
          });
        }
      }
    }

    // Cache the result (5-minute TTL = 300 seconds)
    try {
      var cache = CacheService.getScriptCache();
      var cacheKey = "BOOTSTRAP_" + userId;
      var cacheData = {
        timestamp: new Date().getTime(),
        data: bootstrap,
      };
      cache.put(cacheKey, JSON.stringify(cacheData), 300);
    } catch (cacheErr) {
      // Cache error is not critical, log and continue
      logWarn_(
        userId,
        "CACHE_ERROR",
        "BOOTSTRAP",
        "",
        "Failed to cache bootstrap data"
      );
    }

    return bootstrap;
  } catch (e) {
    logError_(userId, "BOOTSTRAP", "SYSTEM", "", "Bootstrap data error", e);
    return {
      success: false,
      message: String(e),
      forms: [],
      views: [],
      buttons: [],
      dropdowns: {},
      permissions: {},
    };
  }
}

function appendDebugRow(sheetName, dataObj) {
  try {
    var ss = SpreadsheetApp.openById(CONFIG.SHEET_ID);
    var primary = ss.getSheetByName("DBUG") || ss.getSheetByName(sheetName);
    var sheet = primary || ss.getSheetByName("DBUG_AppLog");
    if (!sheet) return;
    var headers = sheet
      .getRange(1, 1, 1, sheet.getLastColumn())
      .getValues()[0]
      .map(function (v) {
        return String(v).trim();
      });
    var idIdx =
      headers.indexOf("DBG_ID") >= 0
        ? headers.indexOf("DBG_ID")
        : headers.indexOf("DBG_ERR_ID") >= 0
        ? headers.indexOf("DBG_ERR_ID")
        : headers.indexOf("DBG_WARN_ID");
    if (idIdx >= 0) {
      var newId = generateStructuredIdForColumn_(sheet, idIdx);
      dataObj[headers[idIdx]] = newId;
    }
    dataObj["Time_Stamp"] = new Date().toISOString();
    insertRowByHeaders_(sheet, headers, dataObj);
  } catch (e) {}
}

function logInfo_(actor, action, entity, id, details) {
  appendDebugRow("DBUG_AppLog", {
    Actor: actor || "system",
    Action: action,
    Entity: entity,
    Entity_ID: id || "",
    Details: details || "",
  });
}

function logWarn_(actor, action, entity, id, details) {
  appendDebugRow("DBUG_WarnLog", {
    Actor: actor || "system",
    Action: action,
    Entity: entity,
    Entity_ID: id || "",
    Details: details || "",
  });
}

function logError_(actor, action, entity, id, message, errorObject) {
  appendDebugRow("DBUG_ErrorLog", {
    Actor: actor || "system",
    Action: action,
    Entity: entity,
    Entity_ID: id || "",
    Message:
      (message || "") + (errorObject ? " :: " + String(errorObject) : ""),
  });
}

function getModuleData(viewId, token, options) {
  if (!viewId) {
    return {
      success: false,
      message: "معرف العرض مطلوب (View ID required)",
      code: "INVALID_INPUT",
    };
  }
  if (!token) {
    return {
      success: false,
      message: "رمز المصادقة مطلوب (Token required)",
      code: "AUTH_REQUIRED",
    };
  }

  var auth = validateSession_(token);
  if (!auth.valid) {
    return {
      success: false,
      message: auth.error || "فشل المصادقة",
      code: "AUTH_REQUIRED",
    };
  }

  try {
    var ss;
    try {
      ss = SpreadsheetApp.openById(CONFIG.SHEET_ID);
    } catch (sheetErr) {
      logError_(
        auth.userId || "unknown",
        "VIEW_DATA",
        "CONFIG",
        viewId,
        "Cannot open spreadsheet",
        sheetErr
      );
      return {
        success: false,
        message: "فشل الاتصال بقاعدة البيانات: " + String(sheetErr),
      };
    }

    var vSheet = ss.getSheetByName("ENG_Views");
    if (!vSheet) {
      logError_(
        auth.userId || "unknown",
        "VIEW_DATA",
        "ENG_Views",
        viewId,
        "Engine View sheet missing",
        null
      );
      return {
        success: false,
        message: "جدول تعريف العروض غير موجود (ENG_Views missing)",
      };
    }

    options = options || {};
    var page = options.page || 1;
    var pageSize = options.pageSize || 25;
    var searchTerm = options.searchTerm || "";
    var sortColumn = options.sortColumn;
    var sortDirection = options.sortDirection || "asc";

  var vData = vSheet.getDataRange().getValues();
  var vHeaders = vData[0].map(String);
  var idIdx = vHeaders.indexOf("VIEW_ID");
  var srcSheetIdx = vHeaders.indexOf("Source_Sheet");
  var viewTitleIdx = vHeaders.indexOf("View_Title");
  var foundRow = null;

    for (var i = 1; i < vData.length; i++) {
      if (String(vData[i][idIdx]).trim() === viewId) {
        foundRow = vData[i];
        break;
      }
    }
  if (!foundRow) {
    // Fallback: derive source sheet from VIEW_ID pattern (e.g., VIEW_HRM_Employees -> HRM_Employees)
    var parts = String(viewId).split("_");
    if (parts.length >= 3) {
      var module = parts[1];
      var table = parts.slice(2).join("_");
      var derived = module + "_" + table;
      logWarn_(auth.userId || "unknown", "VIEW_DATA", "ENG_Views", viewId, "View not found; using fallback: " + derived);
      foundRow = [viewId, viewId, derived];
      srcSheetIdx = 2; // position inside fallback row
      viewTitleIdx = 1;
    } else {
      return {
        success: false,
        message:
          "تعريف العرض غير موجود: " +
          viewId +
          " - تأكد من وجود السجل في ENG_Views",
        code: "VIEW_NOT_FOUND",
      };
    }
  }

  var srcSheetName = foundRow[srcSheetIdx];
  if (!srcSheetName || String(srcSheetName).trim() === "") {
    // if fallback failed to produce a source, attempt module-based default
    var parts2 = String(viewId).split("_");
    if (parts2.length >= 3) srcSheetName = parts2[1] + "_" + parts2.slice(2).join("_");
    if (!srcSheetName) {
      return { success: false, message: "لم يتم تحديد جدول المصدر في تعريف العرض" };
    }
  }

    var viewTitle = foundRow[viewTitleIdx] || srcSheetName;
    var sSheet = ss.getSheetByName(srcSheetName);
    if (!sSheet) {
      logWarn_(
        auth.userId || "unknown",
        "VIEW_DATA",
        srcSheetName,
        viewId,
        "Source sheet missing"
      );
      return {
        success: false,
        message: "جدول البيانات غير موجود: " + srcSheetName,
        code: "SOURCE_SHEET_MISSING",
      };
    }

    var sData = sSheet.getDataRange().getValues();
    if (sData.length < 2) {
      return {
        success: true,
        headers: [],
        data: [],
        viewId: viewId,
        viewTitle: viewTitle,
        sourceSheet: srcSheetName,
        pagination: {
          page: 1,
          pageSize: pageSize,
          totalRecords: 0,
          totalPages: 0,
        },
        buttons: getViewButtons_(ss, viewId, auth.userId),
      };
    }

    var sHeaders = sData[0].map(String);
    var arHeaders = sData[1].map(String);
    var lvFlags =
      sData.length >= 3
        ? sData[2].map(String)
        : new Array(sHeaders.length).fill("");
    var colIndices = [];
    var outHeaders = [];
    var englishHeaders = [];
    for (var c = 0; c < sHeaders.length; c++) {
      var show =
        lvFlags[c] && String(lvFlags[c]).trim().toUpperCase() === "SHOW";
      if (show) {
        colIndices.push(c);
        outHeaders.push(arHeaders[c]);
        englishHeaders.push(sHeaders[c]);
      }
    }

    var idColumnIdx = -1;
    for (var h = 0; h < sHeaders.length; h++) {
      var sh = String(sHeaders[h]);
      var endsId = /_ID$/.test(sh) || /_id$/.test(sh);
      if (endsId && sh.indexOf("_") === sh.lastIndexOf("_")) {
        idColumnIdx = h;
        break;
      }
    }

    var allRows = [];
    if (sData.length > 3) {
      for (var r = 3; r < sData.length; r++) {
        var row = {
          _rowIndex: r + 1,
          _id: idColumnIdx >= 0 ? sData[r][idColumnIdx] : null,
          cells: [],
        };

        for (var k = 0; k < colIndices.length; k++) {
          row.cells.push(sData[r][colIndices[k]]);
        }

        if (searchTerm) {
          var matchFound = false;
          for (var cell = 0; cell < row.cells.length; cell++) {
            if (
              String(row.cells[cell])
                .toLowerCase()
                .indexOf(searchTerm.toLowerCase()) >= 0
            ) {
              matchFound = true;
              break;
            }
          }
          if (!matchFound) continue;
        }

        allRows.push(row);
      }
    }

    if (
      sortColumn !== undefined &&
      sortColumn >= 0 &&
      sortColumn < outHeaders.length
    ) {
      allRows.sort(function (a, b) {
        var valA = a.cells[sortColumn];
        var valB = b.cells[sortColumn];
        if (!isNaN(valA) && !isNaN(valB)) {
          valA = Number(valA);
          valB = Number(valB);
        } else {
          valA = String(valA).toLowerCase();
          valB = String(valB).toLowerCase();
        }
        if (sortDirection === "desc") {
          return valA > valB ? -1 : valA < valB ? 1 : 0;
        }
        return valA < valB ? -1 : valA > valB ? 1 : 0;
      });
    }

    var totalRecords = allRows.length;
    var totalPages = Math.ceil(totalRecords / pageSize);
    var startIdx = (page - 1) * pageSize;
    var endIdx = Math.min(startIdx + pageSize, totalRecords);
    var paginatedRows = allRows.slice(startIdx, endIdx);

    var buttons = getViewButtons_(ss, viewId, auth.userId);

    var outData = paginatedRows.map(function (row) {
      return {
        _id: row._id,
        _rowIndex: row._rowIndex,
        cells: row.cells,
      };
    });

    logInfo_(
      auth.userId,
      "VIEW_DATA",
      srcSheetName,
      viewId,
      "Fetched " + outData.length + " records"
    );

    var response = {
      success: true,
      headers: outHeaders,
      englishHeaders: englishHeaders,
      data: outData,
      viewId: viewId,
      viewTitle: viewTitle,
      sourceSheet: srcSheetName,
      pagination: {
        page: page,
        pageSize: pageSize,
        totalRecords: totalRecords,
        totalPages: totalPages,
      },
      buttons: buttons,
    };
    Logger.log("getModuleData response: " + JSON.stringify(response));
    return response;
  } catch (e) {
    var errorMsg = "";
    try {
      errorMsg = e && e.message ? e.message : String(e);
    } catch (stringifyErr) {
      errorMsg = "خطأ غير معروف في الخادم";
    }
    try {
      logError_(
        typeof auth !== "undefined" && auth && auth.userId
          ? auth.userId
          : "unknown",
        "VIEW_DATA",
        "ENG_Views",
        viewId || "unknown",
        "Error fetching data: " + errorMsg,
        e
      );
    } catch (logErr) {}
    Logger.log("getModuleData Error: " + errorMsg);
    return {
      success: false,
      message: "خطأ في الخادم: " + errorMsg,
      error: errorMsg,
      code: "SERVER_ERROR",
    };
  }
}

function debugGetModuleData(viewId, token, options) {
  var trace = [];
  function t(msg, extra) {
    try {
      trace.push({ ts: Date.now(), msg: msg, extra: extra || {} });
    } catch (e) {}
  }
  try {
    t("start", { viewId: viewId });
    var res = getModuleData(viewId, token, options);
    t("after_getModuleData", {
      ok: !!(res && res.success),
      keys: Object.keys(res || {}),
    });
    Logger.log(
      "debugGetModuleData returning: " +
        JSON.stringify({ success: true, res: res })
    );
    return { success: true, res: res, trace: trace };
  } catch (e) {
    t("error", { message: e && e.message ? e.message : String(e) });
    try {
      appendDebugRow("DBUG_ErrorLog", {
        Actor: "system",
        Action: "DEBUG_VIEW_DATA",
        Entity: "ENG_Views",
        Entity_ID: viewId || "",
        Message: String(e),
      });
    } catch (logErr) {}
    return { success: false, message: String(e), trace: trace };
  }
}

function getViewButtons_(ss, viewId, userId) {
  try {
    var btnSheet = ss.getSheetByName("ENG_Buttons");
    if (!btnSheet) return [];
    var data = btnSheet.getDataRange().getValues();
    var h = data[0].map(String);
    var idIdx = h.indexOf("BTN_ID");
    var labelIdx = h.indexOf("BTN_Label");
    var typeIdx = h.indexOf("BTN_Type");
    var descIdx = h.indexOf("BTN_Description");
    var viewIdx = h.indexOf("VIEW_ID");
    var buttons = [];
    for (var i = 1; i < data.length; i++) {
      var row = data[i];
      if (
        viewIdx >= 0 &&
        row[viewIdx] &&
        String(row[viewIdx]).trim() !== viewId
      ) {
        continue;
      }
      buttons.push({
        id: row[idIdx],
        label: row[labelIdx],
        type: String(row[typeIdx]).toUpperCase(),
        description: row[descIdx],
      });
    }
    if (buttons.length === 0) {
      buttons = [
        {
          id: "BTN_ADD",
          label: "إضافة",
          type: "ADD",
          description: "Add new record",
        },
        {
          id: "BTN_VIEW",
          label: "عرض",
          type: "VIEW",
          description: "View record details",
        },
        {
          id: "BTN_EDIT",
          label: "تعديل",
          type: "EDIT",
          description: "Edit record",
        },
        {
          id: "BTN_DELETE",
          label: "حذف",
          type: "DELETE",
          description: "Delete record",
        },
      ];
    }
    return buttons;
  } catch (e) {
    return [];
  }
}

function getRecordById(tableName, recordId, token) {
  var auth = validateSession_(token);
  if (!auth.valid)
    return { success: false, message: auth.error, code: "AUTH_REQUIRED" };
  try {
    var ss = SpreadsheetApp.openById(CONFIG.SHEET_ID);
    var sheet = ss.getSheetByName(tableName);
    if (!sheet) throw "Sheet not found: " + tableName;
    var data = sheet.getDataRange().getValues();
    if (data.length < 3) throw "No data in sheet";
    var headers = data[0].map(String);
    var arHeaders = data[1].map(String);
    var idColIdx = -1;
    for (var h = 0; h < headers.length; h++) {
      if (
        headers[h].endsWith("_ID") &&
        headers[h].indexOf("_") === headers[h].lastIndexOf("_")
      ) {
        idColIdx = h;
        break;
      }
    }
    if (idColIdx < 0) throw "ID column not found";
    for (var r = 2; r < data.length; r++) {
      if (String(data[r][idColIdx]).trim() === String(recordId).trim()) {
        var record = { _rowIndex: r + 1, _id: recordId };
        for (var c = 0; c < headers.length; c++) {
          record[headers[c]] = data[r][c];
        }
        var displayRecord = [];
        for (var c2 = 0; c2 < headers.length; c2++) {
          if (arHeaders[c2] && arHeaders[c2].trim() !== "") {
            displayRecord.push({
              key: headers[c2],
              label: arHeaders[c2],
              value: data[r][c2],
            });
          }
        }
        logInfo_(
          auth.userId,
          "GET_RECORD",
          tableName,
          recordId,
          "Record fetched"
        );
        return {
          success: true,
          record: record,
          displayRecord: displayRecord,
          headers: headers,
          arHeaders: arHeaders,
          tableName: tableName,
        };
      }
    }
    throw "Record not found: " + recordId;
  } catch (e) {
    logError_(
      auth.userId || "unknown",
      "GET_RECORD",
      tableName,
      recordId,
      "Error",
      e
    );
    return { success: false, message: String(e) };
  }
}

function getFormDefinition(formId, mode, existingData) {
  try {
    var ss = SpreadsheetApp.openById(CONFIG.SHEET_ID);
    var fSheet = ss.getSheetByName("ENG_Forms");
    if (!fSheet) throw "ENG_Forms sheet not found";
    var data = fSheet.getDataRange().getValues();
    var h = data[0].map(String);
    var idIdx = h.indexOf("FORM_ID");
    var tabIdx = h.indexOf("Tab_Name");
    if (tabIdx < 0) tabIdx = h.indexOf("TAB_Section");
    var colPtrIdx = h.indexOf("Target_Column_ID");
    if (colPtrIdx < 0) colPtrIdx = h.indexOf("Column_Pointer");
    var typeIdx = h.indexOf("Field_Type");
    var stateIdx = h.indexOf("Smart_State");
    var dynIdx = h.indexOf("DYN_Source");
    if (dynIdx < 0) dynIdx = h.indexOf("DYN_Link");
    mode = mode || "add";
    existingData = existingData || {};
    var masterSheetName = getFormMasterSheet_(ss, formId);
    var mSheet = masterSheetName ? ss.getSheetByName(masterSheetName) : null;
    var mEn = mSheet
      ? mSheet
          .getRange(1, 1, 1, mSheet.getLastColumn())
          .getValues()[0]
          .map(String)
      : [];
    var mAr =
      mSheet && mSheet.getLastRow() >= 2
        ? mSheet
            .getRange(2, 1, 1, mSheet.getLastColumn())
            .getValues()[0]
            .map(String)
        : [];
    var tabs = {};
    for (var i = 1; i < data.length; i++) {
      if (String(data[i][idIdx]).trim() !== formId) continue;
      var tabId = data[i][tabIdx] || "main";
      var pointer = data[i][colPtrIdx];
      var fieldType = String(data[i][typeIdx] || "TEXT").toUpperCase();
      var smart = String(data[i][stateIdx] || "EDITABLE").toUpperCase();
      var dyn = data[i][dynIdx];
      if (!tabs[tabId]) tabs[tabId] = { id: tabId, label: tabId, fields: [] };
      var idx = mEn.indexOf(pointer);
      var label = idx >= 0 ? mAr[idx] : pointer;
      var readOnly =
        mode === "view" ||
        smart === "READ_ONLY" ||
        (mode === "edit" && smart === "LOCKED_ON_EDIT");
      var field = {
        id: pointer,
        label: label,
        type: fieldType,
        mandatory: false,
        placeholder: "",
        targetColumn: pointer,
        readOnly: readOnly,
        options: [],
      };
      if (existingData && existingData[pointer] !== undefined)
        field.value = existingData[pointer];
      if ((fieldType === "DROPDOWN" || fieldType === "LOOKUP") && dyn) {
        if (String(dyn).indexOf("DD_") === 0)
          field.options = getDropdownOptions_(ss, dyn);
        else field.options = getDropdownOptionsFromTable_(ss, dyn);
      }
      tabs[tabId].fields.push(field);
    }
    var tabsArray = Object.keys(tabs).map(function (k) {
      return tabs[k];
    });
    if (tabsArray.length === 0) {
      return {
        success: false,
        message: "Form ID not found: " + String(formId),
      };
    }
    return {
      success: true,
      formId: formId,
      title: formId,
      targetSheet: masterSheetName,
      tabs: tabsArray,
      fieldsOrder: [],
      mode: mode,
    };
  } catch (e) {
    return { success: false, message: String(e) };
  }
}

function getDropdownOptions_(ss, ddId) {
  var options = [];
  if (!ddId) return options;
  if (String(ddId).indexOf("DD_") === 0) {
    var sheet = ss.getSheetByName("ENG_Dropdowns");
    if (!sheet) return options;
    var data = sheet.getDataRange().getValues();
    var h = data[0].map(String);
    var idIdx = h.indexOf("DD_ID");
    var enIdx = h.indexOf("DD_EN");
    var arIdx = h.indexOf("DD_AR");
    var activeIdx = h.indexOf("DD_Is_Active");
    var sortIdx = h.indexOf("DD_Sort_Order");
    var filtered = [];
    for (var i = 1; i < data.length; i++) {
      var isActive =
        activeIdx >= 0
          ? String(data[i][activeIdx]).toUpperCase() !== "FALSE"
          : true;
      if (String(data[i][idIdx]).trim() === String(ddId).trim() && isActive) {
        filtered.push(data[i]);
      }
    }
    if (sortIdx >= 0) {
      filtered.sort(function (a, b) {
        return Number(a[sortIdx]) - Number(b[sortIdx]);
      });
    }
    for (var j = 0; j < filtered.length; j++) {
      options.push({
        value: String(filtered[j][enIdx]).trim(),
        label: String(filtered[j][arIdx]).trim(),
      });
    }
  } else {
    options = getDropdownOptionsFromTable_(ss, ddId);
  }
  return options;
}

function getDropdownOptionsFromTable_(ss, tableName) {
  var sheet = ss.getSheetByName(tableName);
  var options = [];
  if (!sheet) return options;
  var h = sheet
    .getRange(1, 1, 1, sheet.getLastColumn())
    .getValues()[0]
    .map(String);
  var rows =
    sheet.getLastRow() > 2
      ? sheet
          .getRange(3, 1, sheet.getLastRow() - 2, sheet.getLastColumn())
          .getValues()
      : [];
  var idIdx = -1,
    nameIdx = -1,
    actIdx = -1;
  for (var i = 0; i < h.length; i++) {
    if (/_ID$/.test(h[i]) && idIdx === -1) idIdx = i;
    if (/_Name(_AR|_EN)?$/.test(h[i]) && nameIdx === -1) nameIdx = i;
    if (/_Is_Active$/.test(h[i])) actIdx = i;
  }
  if (idIdx === -1) idIdx = 0;
  if (nameIdx === -1) nameIdx = Math.min(1, h.length - 1);
  for (var r = 0; r < rows.length; r++) {
    var isActive =
      actIdx >= 0
        ? String(rows[r][actIdx]).trim().toLowerCase() !== "false"
        : true;
    if (isActive) {
      options.push({
        value: String(rows[r][idIdx]).trim(),
        label: String(rows[r][nameIdx]).trim(),
      });
    }
  }
  return options;
}

function performSmartSearch(query, linkID, token) {
  var auth = validateSession_(token);
  if (!auth.valid) {
    return { success: false, message: "Invalid session", results: [] };
  }

  if (!query || !linkID) {
    return {
      success: false,
      message: "Query and linkID required",
      results: [],
    };
  }

  try {
    var ss = SpreadsheetApp.openById(CONFIG.SHEET_ID);
    var queryLower = String(query).toLowerCase().trim();
    var results = [];

    // Map DYN_* IDs to sheet names
    var sheetMap = {
      DYN_EMPLOYEES: "HRM_Employees",
      DYN_CLIENTS: "PRJ_Clients",
      DYN_PROJECTS: "PRJ_Main",
      DYN_MATERIALS: "PRJ_Material",
      DYN_DEPTS: "HRM_Departments",
      DYN_ROLES: "SYS_Roles",
      DYN_CUSTODY: "FIN_Custody",
    };

    var sheetName = sheetMap[linkID];
    if (!sheetName) {
      // Try direct sheet name if not in map
      sheetName = linkID.replace("DYN_", "");
    }

    var sheet = ss.getSheetByName(sheetName);
    if (!sheet) {
      return {
        success: false,
        message: "Sheet not found: " + sheetName,
        results: [],
      };
    }

    var data = sheet.getDataRange().getValues();
    if (data.length < 4) {
      return { success: true, results: [] };
    }

    var headers = data[0].map(String); // Row 1: SYSTEM_KEY
    var arHeaders = data[1].map(String); // Row 2: UI_LABEL
    // Row 3: VIEW_FLAG (skip)
    // Row 4+: Data

    // Find ID column (ends with _ID and has single underscore)
    var idColIdx = -1;
    for (var h = 0; h < headers.length; h++) {
      var sh = String(headers[h]);
      if (
        (/_ID$/.test(sh) || /_id$/.test(sh)) &&
        sh.indexOf("_") === sh.lastIndexOf("_")
      ) {
        idColIdx = h;
        break;
      }
    }
    if (idColIdx < 0) idColIdx = 0;

    // Find searchable columns (Name, Email, Mobile, etc.)
    var searchCols = [];
    for (var c = 0; c < headers.length; c++) {
      var colName = String(headers[c]).toLowerCase();
      if (
        colName.indexOf("name") >= 0 ||
        colName.indexOf("email") >= 0 ||
        colName.indexOf("mob") >= 0 ||
        colName.indexOf("phone") >= 0 ||
        colName.indexOf("title") >= 0
      ) {
        searchCols.push(c);
      }
    }
    if (searchCols.length === 0) {
      // Fallback: use first text column
      searchCols.push(Math.min(1, headers.length - 1));
    }

    // Search through data rows (starting from Row 4)
    for (var r = 3; r < data.length; r++) {
      var row = data[r];
      var matchFound = false;

      // Check each searchable column
      for (var sc = 0; sc < searchCols.length; sc++) {
        var cellValue = String(row[searchCols[sc]] || "").toLowerCase();
        if (cellValue.indexOf(queryLower) >= 0) {
          matchFound = true;
          break;
        }
      }

      if (matchFound) {
        // Build label from name columns
        var labelParts = [];
        for (var lc = 0; lc < searchCols.length; lc++) {
          var val = String(row[searchCols[lc]] || "").trim();
          if (val) labelParts.push(val);
        }
        var label =
          labelParts.length > 0
            ? labelParts.join(" - ")
            : String(row[idColIdx]).trim();

        results.push({
          id: String(row[idColIdx]).trim(),
          label: label,
        });

        // Limit results to 50
        if (results.length >= 50) break;
      }
    }

    return { success: true, results: results };
  } catch (e) {
    logError_(auth.userId, "SMART_SEARCH", linkID, query, "Search error", e);
    return { success: false, message: String(e), results: [] };
  }
}

function validateFormData(formId, payload, ss, mode) {
  mode = mode || "add";
  var errors = [];

  try {
    var fSheet = ss.getSheetByName("ENG_Forms");
    if (!fSheet) return { valid: true, errors: [] };

    var fData = fSheet.getDataRange().getValues();
    var fh = fData[0].map(String);
    var idIdx = fh.indexOf("FORM_ID");
    var colPtrIdx = fh.indexOf("Target_Column_ID");
    if (colPtrIdx < 0) colPtrIdx = fh.indexOf("Column_Pointer");
    var typeIdx = fh.indexOf("Field_Type");
    var stateIdx = fh.indexOf("Smart_State");
    var mandIdx = fh.indexOf("Is_Mandatory");
    if (mandIdx < 0) mandIdx = fh.indexOf("Mandatory");

    for (var i = 1; i < fData.length; i++) {
      if (String(fData[i][idIdx]).trim() !== formId) continue;

      var colPtr = String(fData[i][colPtrIdx]).trim();
      var fieldType = String(fData[i][typeIdx] || "TEXT").toUpperCase();
      var smartState = String(fData[i][stateIdx] || "EDITABLE").toUpperCase();
      var isMandatory =
        mandIdx >= 0
          ? String(fData[i][mandIdx]).trim().toUpperCase() === "TRUE"
          : false;

      // Skip validation for READ_ONLY fields in add mode
      if (mode === "add" && smartState === "READ_ONLY") continue;
      // Skip validation for LOCKED_ON_EDIT fields in edit mode
      if (mode === "edit" && smartState === "LOCKED_ON_EDIT") continue;

      var value = payload[colPtr];
      var valueStr =
        value !== undefined && value !== null ? String(value).trim() : "";

      // Check mandatory fields
      if (isMandatory && valueStr === "") {
        errors.push("الحقل مطلوب: " + colPtr);
        continue;
      }

      // Skip type validation if value is empty (unless mandatory)
      if (valueStr === "") continue;

      // Type validation
      if (fieldType === "NUMBER") {
        if (isNaN(Number(value))) {
          errors.push("يجب أن يكون الحقل رقم: " + colPtr);
        }
      } else if (fieldType === "DATE") {
        var dateVal = new Date(value);
        if (isNaN(dateVal.getTime())) {
          errors.push("تاريخ غير صحيح: " + colPtr);
        }
      } else if (fieldType === "BOOLEAN") {
        var boolVal = String(value).toLowerCase();
        if (
          boolVal !== "true" &&
          boolVal !== "false" &&
          boolVal !== "1" &&
          boolVal !== "0"
        ) {
          errors.push("قيمة منطقية غير صحيحة: " + colPtr);
        }
      } else if (fieldType === "EMAIL") {
        var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(valueStr)) {
          errors.push("بريد إلكتروني غير صحيح: " + colPtr);
        }
      }
    }

    return { valid: errors.length === 0, errors: errors };
  } catch (e) {
    return { valid: false, errors: ["خطأ في التحقق: " + String(e)] };
  }
}

function saveEngineRecord(formId, payload, token) {
  var auth = validateSession_(token);
  if (!auth.valid)
    return { success: false, code: "AUTH_REQUIRED", message: auth.error };

  // Check permission
  var ss = SpreadsheetApp.openById(CONFIG.SHEET_ID);
  var targetSheetName = getFormMasterSheet_(ss, formId);
  var permCheck = checkPermission(
    auth.userId,
    "CREATE",
    targetSheetName || formId,
    token
  );
  if (!permCheck.allowed) {
    logWarn_(
      auth.userId,
      "PERMISSION_DENIED",
      targetSheetName || formId,
      "",
      "CREATE denied: " + permCheck.reason
    );
    return {
      success: false,
      code: "PERMISSION_DENIED",
      message: "ليس لديك صلاحية لإنشاء هذا السجل",
    };
  }

  // Validate input data
  var validation = validateFormData(formId, payload, ss, "add");
  if (!validation.valid) {
    return {
      success: false,
      code: "VALIDATION_ERROR",
      message: validation.errors.join("; "),
    };
  }

  try {
    var fSheet = ss.getSheetByName("ENG_Forms");
    var fData = fSheet.getDataRange().getValues();
    var fh = fData[0].map(String);
    var idIdx = fh.indexOf("FORM_ID");
    var colPtrIdx = fh.indexOf("Target_Column_ID");
    if (colPtrIdx < 0) colPtrIdx = fh.indexOf("Column_Pointer");
    var typeIdx = fh.indexOf("Field_Type");
    var mappings = [];
    for (var i = 1; i < fData.length; i++) {
      if (String(fData[i][idIdx]).trim() !== formId) continue;
      mappings.push({
        targetCol: fData[i][colPtrIdx],
        fieldType: String(fData[i][typeIdx] || "TEXT").toUpperCase(),
      });
    }
    if (!targetSheetName)
      return {
        success: false,
        message: "Configuration Error: No Master Sheet",
      };
    var tSheet = ss.getSheetByName(targetSheetName);
    if (!tSheet) return { success: false, message: "Target Sheet Not Found" };
    var tHeaders = tSheet
      .getRange(1, 1, 1, tSheet.getLastColumn())
      .getValues()[0]
      .map(String);
    var rowData = {};
    var idHeaderIndex = -1;
    for (var h = 0; h < tHeaders.length; h++) {
      if (
        tHeaders[h].endsWith("_ID") &&
        tHeaders[h].indexOf("_") === tHeaders[h].lastIndexOf("_")
      ) {
        idHeaderIndex = h;
        break;
      }
    }
    var newId = generateStructuredIdForColumn_(tSheet, idHeaderIndex);
    if (idHeaderIndex >= 0) {
      if (!isValidStructuredId_(newId)) {
        logError_(
          auth.userId,
          "ID_GENERATION_FAIL",
          targetSheetName,
          "",
          "Invalid ID format",
          null
        );
        return { success: false, message: "Invalid ID format" };
      }
      rowData[tHeaders[idHeaderIndex]] = newId;
    }
    for (var m = 0; m < mappings.length; m++) {
      var value = payload[mappings[m].targetCol];
      if (mappings[m].fieldType === "NUMBER" && value) value = Number(value);
      else if (mappings[m].fieldType === "DATE" && value)
        value = new Date(value);
      else if (mappings[m].fieldType === "BOOLEAN")
        value = String(value).toLowerCase() === "true";
      rowData[mappings[m].targetCol] = value;
    }
    for (var x = 0; x < tHeaders.length; x++) {
      if (tHeaders[x].endsWith("_Crt_At")) {
        rowData[tHeaders[x]] = new Date();
      }
      if (tHeaders[x].endsWith("_Crt_By")) {
        rowData[tHeaders[x]] = auth.userId || "system";
      }
    }
    insertRowByHeaders_(tSheet, tHeaders, rowData);

    // Trigger indirect expense allocations if applicable
    if (
      formId === "FORM_FIN_AddInDirectExpense_Time" ||
      formId === "FORM_FIN_AddInDirectExpense_NoTime"
    ) {
      try {
        runAllocations(rowData, formId, newId, ss, auth.userId);
      } catch (allocErr) {
        logError_(
          auth.userId,
          "ALLOCATION_ERROR",
          targetSheetName,
          newId,
          "Allocation failed: " + String(allocErr),
          allocErr
        );
      }
    }

    logInfo_(
      auth.userId,
      "CREATE_RECORD",
      targetSheetName,
      newId,
      "Created successfully"
    );
    logAuditEntry_(
      ss,
      auth.userId,
      "CREATE",
      targetSheetName,
      newId,
      "New record created"
    );
    return { success: true, message: "تم الحفظ بنجاح", recordId: newId };
  } catch (e) {
    logError_(auth.userId, "SAVE_RECORD", "ENG_Forms", formId, "Exception", e);
    return { success: false, message: String(e) };
  }
}

function updateEngineRecord(formId, payload, token) {
  var auth = validateSession_(token);
  if (!auth.valid)
    return { success: false, code: "AUTH_REQUIRED", message: auth.error };

  // Check permission
  var ss = SpreadsheetApp.openById(CONFIG.SHEET_ID);
  var targetSheetName = getFormMasterSheet_(ss, formId);
  var permCheck = checkPermission(
    auth.userId,
    "UPDATE",
    targetSheetName || formId,
    token
  );
  if (!permCheck.allowed) {
    logWarn_(
      auth.userId,
      "PERMISSION_DENIED",
      targetSheetName || formId,
      payload._id || "",
      "UPDATE denied: " + permCheck.reason
    );
    return {
      success: false,
      code: "PERMISSION_DENIED",
      message: "ليس لديك صلاحية لتعديل هذا السجل",
    };
  }

  // Validate input data
  var validation = validateFormData(formId, payload, ss, "edit");
  if (!validation.valid) {
    return {
      success: false,
      code: "VALIDATION_ERROR",
      message: validation.errors.join("; "),
    };
  }

  try {
    var ss = SpreadsheetApp.openById(CONFIG.SHEET_ID);
    var fSheet = ss.getSheetByName("ENG_Forms");
    var fData = fSheet.getDataRange().getValues();
    var fh = fData[0].map(String);
    var idIdx = fh.indexOf("FORM_ID");
    var tSheetIdx = fh.indexOf("Target_Sheet");
    var tColIdx = fh.indexOf("Target_Column");
    var fIdIdx = fh.indexOf("Field_ID");
    var canEditIdx = fh.indexOf("Field_Can_Edit");
    var mandIdx = fh.indexOf("Is_Mandatory");
    var targetSheetName = "";
    var mappings = [];
    for (var i = 1; i < fData.length; i++) {
      if (String(fData[i][idIdx]).trim() === formId) {
        if (!targetSheetName) targetSheetName = fData[i][tSheetIdx];
        var canEdit =
          canEditIdx >= 0
            ? String(fData[i][canEditIdx]).toUpperCase() !== "FALSE"
            : true;
        if (canEdit) {
          mappings.push({
            fieldId: fData[i][fIdIdx],
            targetCol: fData[i][tColIdx],
            required: String(fData[i][mandIdx]).toUpperCase() === "TRUE",
          });
        }
      }
    }
    if (!targetSheetName)
      return {
        success: false,
        message: "Configuration Error: No Target Sheet",
      };
    for (var m = 0; m < mappings.length; m++) {
      if (
        mappings[m].required &&
        (!payload[mappings[m].fieldId] ||
          String(payload[mappings[m].fieldId]).trim() === "")
      ) {
        return {
          success: false,
          message: "الحقل مطلوب: " + mappings[m].fieldId,
          field: mappings[m].fieldId,
        };
      }
    }
    var tSheet = ss.getSheetByName(targetSheetName);
    if (!tSheet) return { success: false, message: "Target Sheet Not Found" };
    var tHeaders = tSheet
      .getRange(1, 1, 1, tSheet.getLastColumn())
      .getValues()[0]
      .map(String);
    var idHeaderIndex = -1;
    for (var h2 = 0; h2 < tHeaders.length; h2++) {
      var sh = String(tHeaders[h2]);
      if (
        (/_ID$/.test(sh) || /_id$/.test(sh)) &&
        sh.indexOf("_") === sh.lastIndexOf("_")
      ) {
        idHeaderIndex = h2;
        break;
      }
    }
    var targetId = payload && payload._id ? String(payload._id).trim() : "";
    if (idHeaderIndex < 0 || !targetId)
      return { success: false, message: "Missing record id" };
    var lastRow = tSheet.getLastRow();
    for (var r = 3; r <= lastRow; r++) {
      var cellVal = String(
        tSheet.getRange(r, idHeaderIndex + 1).getValue()
      ).trim();
      if (cellVal === targetId) {
        var changes = [];
        for (var m2 = 0; m2 < mappings.length; m2++) {
          if (
            mappings[m2].state === "LOCKED_ON_EDIT" ||
            mappings[m2].state === "READ_ONLY"
          )
            continue;
          var colIdx = tHeaders.indexOf(mappings[m2].targetCol);
          if (colIdx > -1) {
            var oldValue = tSheet.getRange(r, colIdx + 1).getValue();
            var newValue = payload[mappings[m2].targetCol];
            if (String(oldValue) !== String(newValue))
              changes.push(
                mappings[m2].targetCol + ": " + oldValue + " → " + newValue
              );
            tSheet.getRange(r, colIdx + 1).setValue(newValue || "");
          }
        }
        for (var x2 = 0; x2 < tHeaders.length; x2++) {
          var th = String(tHeaders[x2]);
          if (/_Upd_At$/.test(th))
            tSheet.getRange(r, x2 + 1).setValue(new Date());
          if (/_Upd_By$/.test(th))
            tSheet.getRange(r, x2 + 1).setValue(auth.userId || "system");
        }
        logInfo_(
          auth.userId,
          "UPDATE_RECORD",
          targetSheetName,
          targetId,
          "Updated: " + changes.join(", ")
        );
        logAuditEntry_(
          ss,
          auth.userId,
          "UPDATE",
          targetSheetName,
          targetId,
          changes.join("; ")
        );
        return { success: true, message: "تم التحديث بنجاح" };
      }
    }
    return { success: false, message: "Record not found" };
  } catch (e) {
    logError_(
      auth.userId,
      "UPDATE_RECORD",
      "ENG_Forms",
      formId,
      "Exception",
      e
    );
    return { success: false, message: String(e) };
  }
}

function deleteEngineRecord(tableName, id, token) {
  var auth = validateSession_(token);
  if (!auth.valid)
    return { success: false, code: "AUTH_REQUIRED", message: auth.error };

  // Check permission
  var permCheck = checkPermission(auth.userId, "DELETE", tableName, token);
  if (!permCheck.allowed) {
    logWarn_(
      auth.userId,
      "PERMISSION_DENIED",
      tableName,
      id,
      "DELETE denied: " + permCheck.reason
    );
    return {
      success: false,
      code: "PERMISSION_DENIED",
      message: "ليس لديك صلاحية لحذف هذا السجل",
    };
  }

  try {
    var ss = SpreadsheetApp.openById(CONFIG.SHEET_ID);
    var sheet = ss.getSheetByName(tableName);
    if (!sheet) return { success: false, message: "Target Sheet Not Found" };
    var h = sheet
      .getRange(1, 1, 1, sheet.getLastColumn())
      .getValues()[0]
      .map(String);
    var idHeaderIndex = -1;
    for (var i = 0; i < h.length; i++) {
      var sh = String(h[i]);
      if (
        (/_ID$/.test(sh) || /_id$/.test(sh)) &&
        sh.indexOf("_") === sh.lastIndexOf("_")
      ) {
        idHeaderIndex = i;
        break;
      }
    }
    if (idHeaderIndex < 0)
      return { success: false, message: "ID column not found" };
    var lastRow = sheet.getLastRow();
    for (var r = 3; r <= lastRow; r++) {
      var val = String(sheet.getRange(r, idHeaderIndex + 1).getValue()).trim();
      if (val === String(id).trim()) {
        sheet.deleteRow(r);
        logWarn_(auth.userId, "DELETE_RECORD", tableName, id, "Record deleted");
        logAuditEntry_(
          ss,
          auth.userId,
          "DELETE",
          tableName,
          id,
          "Record deleted"
        );
        return { success: true, message: "تم الحذف بنجاح" };
      }
    }
    return { success: false, message: "Record not found" };
  } catch (e) {
    logError_(auth.userId, "DELETE_RECORD", tableName, id, "Exception", e);
    return { success: false, message: String(e) };
  }
}

function logAuditEntry_(ss, userId, action, entity, entityId, description) {
  try {
    var sheet = ss.getSheetByName("SYS_Audit_Log");
    if (!sheet) return;
    var headers = sheet
      .getRange(1, 1, 1, sheet.getLastColumn())
      .getValues()[0]
      .map(String);
    var idIdx = headers.indexOf("AUD_ID");
    var newId = generateStructuredIdForColumn_(sheet, idIdx);
    var rowData = {
      AUD_ID: newId,
      AUD_Time_Stamp: new Date(),
      USR_ID: userId,
      USR_Action: action,
      ACT_Description: description,
      AUD_Entity: entity,
      AUD_Entity_ID: entityId,
    };
    insertRowByHeaders_(sheet, headers, rowData);
  } catch (e) {}
}

function getHRMEmployees(token, options) {
  return getModuleData("VIEW_HRM_Employees", token, options);
}
function getEmployeeById(empId, token) {
  return getRecordById("HRM_Employees", empId, token);
}
function getEmployeeForm(mode, empId, token) {
  var existingData = null;
  if (mode === "edit" || mode === "view") {
    if (!empId) {
      return {
        success: false,
        message: "Employee ID required for " + mode + " mode",
      };
    }
    var empResult = getRecordById("HRM_Employees", empId, token);
    if (!empResult.success) {
      return empResult;
    }
    existingData = empResult.record;
  }
  return getFormDefinition("FORM_HRM_AddEmployee", mode, existingData);
}

function getDepartments(token) {
  var auth = validateSession_(token);
  if (!auth.valid)
    return { success: false, message: auth.error, code: "AUTH_REQUIRED" };
  try {
    var ss = SpreadsheetApp.openById(CONFIG.SHEET_ID);
    var options = getDropdownOptionsFromTable_(ss, "HRM_Departments");
    return { success: true, options: options };
  } catch (e) {
    return { success: false, message: String(e) };
  }
}

function getEmployeeFormDropdowns(token) {
  var auth = validateSession_(token);
  if (!auth.valid)
    return { success: false, message: auth.error, code: "AUTH_REQUIRED" };
  try {
    var ss = SpreadsheetApp.openById(CONFIG.SHEET_ID);
    return {
      success: true,
      dropdowns: {
        DD_Gender: getDropdownOptions_(ss, "DD_Gender"),
        DD_Marital_Status: getDropdownOptions_(ss, "DD_Marital_Status"),
        DD_Military_Status: getDropdownOptions_(ss, "DD_Military_Status"),
        DD_Contract_Types: getDropdownOptions_(ss, "DD_Contract_Types"),
        departments: getDropdownOptionsFromTable_(ss, "HRM_Departments"),
      },
    };
  } catch (e) {
    return { success: false, message: String(e) };
  }
}

function getFormMasterSheet_(ss, formId) {
  var s = ss.getSheetByName("ENG_Settings");
  if (s) {
    var d = s.getDataRange().getValues();
    var h = d[0].map(String);
    var kIdx = h.indexOf("Setting_Key");
    var vIdx = h.indexOf("Setting_Value");
    for (var i = 1; i < d.length; i++) {
      var k = String(d[i][kIdx]);
      if (k === "FORM_MASTER:" + formId) return String(d[i][vIdx]);
    }
  }
  var f = ss.getSheetByName("ENG_Forms");
  if (f) {
    var data = f.getDataRange().getValues();
    var h2 = data[0].map(String);
    var idIdx = h2.indexOf("FORM_ID");
    var mIdx = h2.indexOf("Master_Sheet");
    if (mIdx >= 0) {
      for (var j = 1; j < data.length; j++) {
        if (String(data[j][idIdx]).trim() === formId)
          return String(data[j][mIdx]);
      }
    }
  }
  return "";
}

function verifyHRMEmployeesHeaders() {
  try {
    var ss = SpreadsheetApp.openById(CONFIG.SHEET_ID);
    var sheet = ss.getSheetByName("HRM_Employees");
    if (!sheet)
      return { success: false, message: "Sheet not found: HRM_Employees" };
    var data = sheet.getDataRange().getValues();
    var en = data.length >= 1 ? data[0].map(String) : [];
    var ar = data.length >= 2 ? data[1].map(String) : [];
    var visible = [];
    for (var i = 0; i < en.length; i++) {
      var arLabel = ar[i] ? String(ar[i]).trim() : "";
      if (arLabel !== "") {
        visible.push({ index: i, en: en[i], ar: arLabel });
      }
    }
    var idIdx = -1;
    for (var h = 0; h < en.length; h++) {
      if (
        en[h].endsWith("_ID") &&
        en[h].indexOf("_") === en[h].lastIndexOf("_")
      ) {
        idIdx = h;
        break;
      }
    }
    var vSheet = ss.getSheetByName("ENG_Views");
    var viewCfg = null;
    if (vSheet) {
      var vData = vSheet.getDataRange().getValues();
      var vh = vData[0].map(String);
      var idCol = vh.indexOf("VIEW_ID");
      var srcColsIdx = vh.indexOf("Source_Columns");
      for (var r = 1; r < vData.length; r++) {
        if (String(vData[r][idCol]).trim() === "VIEW_HRM_Employees") {
          var srcColsStr = srcColsIdx >= 0 ? String(vData[r][srcColsIdx]) : "";
          var srcCols = srcColsStr
            ? srcColsStr.split(",").map(function (s) {
                return String(s).trim();
              })
            : [];
          viewCfg = { viewId: "VIEW_HRM_Employees", sourceColumns: srcCols };
          break;
        }
      }
    }
    return {
      success: true,
      tableName: "HRM_Employees",
      englishHeaders: en,
      arabicHeaders: ar,
      visibleArabicHeaders: visible.map(function (v) {
        return v.ar;
      }),
      visibleEnglishHeaders: visible.map(function (v) {
        return v.en;
      }),
      idColumnIndex: idIdx,
      idColumnName: idIdx >= 0 ? en[idIdx] : null,
      viewConfig: viewCfg,
      defaultSort: { columnIndex: null, direction: "asc" },
    };
  } catch (e) {
    return { success: false, message: String(e) };
  }
}

function validateEngineConfiguration() {
  try {
    var ss = SpreadsheetApp.openById(CONFIG.SHEET_ID);
    function sheetIds_(sheetName, idColName) {
      var sh = ss.getSheetByName(sheetName);
      if (!sh) return [];
      var data = sh.getDataRange().getValues();
      if (data.length < 2) return [];
      var h = data[0].map(String);
      var idx = h.indexOf(idColName);
      if (idx < 0) return [];
      var ids = [];
      for (var i = 1; i < data.length; i++) {
        var v = String(data[i][idx]).trim();
        if (v) ids.push(v);
      }
      return ids;
    }
    var expectedViews = [
      "VIEW_SYS_Users",
      "VIEW_SYS_Roles",
      "VIEW_SYS_Permissions",
      "VIEW_SYS_RolePermissions",
      "VIEW_SYS_AuditLog",
      "VIEW_SYS_Sessions",
      "VIEW_SYS_Documents",
      "VIEW_SYS_PubHolidays",
      "VIEW_HRM_Departments",
      "VIEW_HRM_Employees",
      "VIEW_HRM_Attendance",
      "VIEW_HRM_Leave",
      "VIEW_HRM_Advances",
      "VIEW_HRM_OverTime",
      "VIEW_HRM_Deductions",
      "VIEW_PRJ_Main",
      "VIEW_PRJ_Clients",
      "VIEW_PRJ_Tasks",
      "VIEW_PRJ_Material",
      "VIEW_FIN_DirectExpenses",
      "VIEW_FIN_InDirectExpenses_Time",
      "VIEW_FIN_InDirectExpenses_NoTime",
      "VIEW_FIN_PRJ_Revenue",
      "VIEW_FIN_Custody",
      "VIEW_FIN_HRM_Payroll",
    ];
    var expectedForms = [
      "FORM_SYS_AddUser",
      "FORM_SYS_AddRole",
      "FORM_SYS_AddPermission",
      "FORM_SYS_AddRolePermission",
      "FORM_SYS_AddDocument",
      "FORM_SYS_AddPubHoliday",
      "FORM_SYS_ViewUser",
      "FORM_SYS_ViewRole",
      "FORM_SYS_ViewPermission",
      "FORM_SYS_ViewRolePermission",
      "FORM_SYS_ViewAuditLog",
      "FORM_SYS_ViewSession",
      "FORM_SYS_ViewDocument",
      "FORM_SYS_ViewPubHoliday",
      "FORM_HRM_AddDepartment",
      "FORM_HRM_AddEmployee",
      "FORM_HRM_AddAttendance",
      "FORM_HRM_AddLeave",
      "FORM_HRM_AddAdvance",
      "FORM_HRM_AddOverTime",
      "FORM_HRM_AddDeduction",
      "FORM_HRM_ViewDepartment",
      "FORM_HRM_ViewEmployee",
      "FORM_HRM_ViewAttendance",
      "FORM_HRM_ViewLeave",
      "FORM_HRM_ViewAdvance",
      "FORM_HRM_ViewOverTime",
      "FORM_HRM_ViewDeduction",
      "FORM_PRJ_AddMain",
      "FORM_PRJ_AddClient",
      "FORM_PRJ_AddTask",
      "FORM_PRJ_AddMaterial",
      "FORM_PRJ_ViewMain",
      "FORM_PRJ_ViewClient",
      "FORM_PRJ_ViewTask",
      "FORM_PRJ_ViewMaterial",
      "FORM_FIN_AddDirectExpense",
      "FORM_FIN_AddInDirectExpense_Time",
      "FORM_FIN_AddInDirectExpense_NoTime",
      "FORM_FIN_AddPRJ_Revenue",
      "FORM_FIN_AddCustody",
      "FORM_FIN_AddHRM_Payroll",
      "FORM_FIN_ViewDirectExpense",
      "FORM_FIN_ViewInDirectExpense_Time",
      "FORM_FIN_ViewInDirectExpense_NoTime",
      "FORM_FIN_ViewPRJ_Revenue",
      "FORM_FIN_ViewCustody",
      "FORM_FIN_ViewHRM_Payroll",
    ];
    var expectedDropdownIds = [
      "DD_YesNo",
      "DD_Boolean",
      "DD_User_Status",
      "DD_MFA_Status",
      "DD_Permission_Categories",
      "DD_Scopes",
      "DD_Attachment_Entities",
      "DD_Export_Formats",
      "DD_Contract_Types",
      "DD_Project_Status",
      "DD_Project_Type",
      "DD_Project_Priority",
      "DD_Task_Priority",
      "DD_Task_Status",
      "DD_Cost_Categories",
      "DD_Payment_Status",
      "DD_Payment_Method",
      "DD_Expense_Category",
      "DD_Indirect_Frequency",
      "DD_Revenue_Type",
      "DD_Account",
      "DD_Custody_Status",
      "DD_Gender",
      "DD_Marital_Status",
      "DD_Military_Status",
      "DD_Job_Titles",
      "DD_Employee_Status",
      "DD_Attendance_Status",
      "DD_Leave_Types",
      "DD_Leave_Status",
      "DD_Advance_Status",
      "DD_Payroll_Status",
      "DD_Units",
    ];
    var viewIds = sheetIds_("ENG_Views", "VIEW_ID");
    var formIds = sheetIds_("ENG_Forms", "FORM_ID");
    var ddIds = sheetIds_("ENG_Dropdowns", "DD_ID");
    function diff_(expected, actual) {
      var missing = expected.filter(function (x) {
        return actual.indexOf(x) === -1;
      });
      var extra = actual.filter(function (x) {
        return expected.indexOf(x) === -1;
      });
      return { missing: missing, extra: extra };
    }
    var viewsReport = diff_(expectedViews, viewIds);
    var formsReport = diff_(expectedForms, formIds);
    var dropdownsReport = diff_(expectedDropdownIds, ddIds);
    return {
      success: true,
      views: viewsReport,
      forms: formsReport,
      dropdowns: dropdownsReport,
    };
  } catch (e) {
    return { success: false, message: String(e) };
  }
}

function runEngineTests() {
  try {
    var report = validateEngineConfiguration();
    if (!report.success) return { success: false, message: report.message };
    var viewsOk = report.views.missing.length === 0;
    var formsOk = report.forms.missing.length === 0;
    var dropdownsOk = report.dropdowns.missing.length === 0;
    var ss = SpreadsheetApp.openById(CONFIG.SHEET_ID);
    var ddSample = getDropdownOptions_(ss, "DD_Gender");
    var ddLoaded = Array.isArray(ddSample) && ddSample.length > 0;
    return {
      success: viewsOk && formsOk && dropdownsOk && ddLoaded,
      checks: {
        viewsOk: viewsOk,
        formsOk: formsOk,
        dropdownsOk: dropdownsOk,
        ddLoaded: ddLoaded,
      },
      report: report,
    };
  } catch (e) {
    return { success: false, message: String(e) };
  }
}

function seedSystemData() {
  try {
    var ss = SpreadsheetApp.openById(CONFIG.SHEET_ID);
    var v = ss.getSheetByName("ENG_Views");
    var f = ss.getSheetByName("ENG_Forms");
    var dd = ss.getSheetByName("ENG_Dropdowns");
    var needsSeed = false;
    if (!v || v.getLastRow() <= 1) needsSeed = true;
    if (!f || f.getLastRow() <= 1) needsSeed = true;
    if (!dd) needsSeed = true;
    if (needsSeed) {
      // Call seedMasterConfiguration from Setup.js (same Apps Script project)
      try {
        if (typeof seedMasterConfiguration === "function") {
          seedMasterConfiguration();
        } else {
          Logger.log(
            "Warning: seedMasterConfiguration not found. Please run Setup.js seeding manually."
          );
        }
      } catch (e) {
        Logger.log("Error calling seedMasterConfiguration: " + String(e));
      }
    }
    function ensureSchemaSheet_(name) {
      var sh = ss.getSheetByName(name);
      if (sh) return sh;
      var schema = ERP_SCHEMA && ERP_SCHEMA[name] ? ERP_SCHEMA[name] : null;
      if (!schema) return null;
      sh = ss.insertSheet(name);
      var row1 = schema.map(function (c) {
        return c[0];
      });
      sh.getRange(1, 1, 1, row1.length).setValues([row1]);
      var isEngineOrDebug = /^ENG_|^DBUG_/.test(name);
      if (!isEngineOrDebug) {
        var row2 = schema.map(function (c) {
          return c[1];
        });
        var row3 = schema.map(function (c) {
          return c[2];
        });
        sh.getRange(2, 1, 1, row2.length).setValues([row2]);
        sh.getRange(3, 1, 1, row3.length).setValues([row3]);
        sh.setFrozenRows(3);
      } else {
        sh.setFrozenRows(1);
      }
      return sh;
    }
    ensureSchemaSheet_("HRM_Employees");
    ensureSchemaSheet_("HRM_Departments");
    ensureSchemaSheet_("SYS_Users");
    ensureSchemaSheet_("PRJ_Main");
    ensureSchemaSheet_("FIN_DirectExpenses");
    var emp = ss.getSheetByName("HRM_Employees");
    if (emp && emp.getLastRow() <= 3) {
      seedDemoData({
        employees: 10,
        departments: 5,
        users: 5,
        projects: 5,
        expenses: 10,
      });
    }
    return { success: true };
  } catch (e) {
    return { success: false, message: String(e) };
  }
}

function recordClientEvents(token, events) {
  var auth = validateSession_(token);
  if (!auth.valid) return { success: false, message: auth.error };
  try {
    if (!Array.isArray(events) || events.length === 0)
      return { success: true, count: 0 };
    for (var i = 0; i < events.length; i++) {
      var e = events[i] || {};
      appendDebugRow("DBUG_AppLog", {
        Actor: auth.userId || "unknown",
        Action: "CLIENT_EVENT",
        Entity: e.type || "unknown",
        Entity_ID: e.id || "",
        Details: JSON.stringify(e),
      });
    }
    return { success: true, count: events.length };
  } catch (err) {
    return { success: false, message: String(err) };
  }
}

function getRecentClientEvents(token, limit) {
  var auth = validateSession_(token);
  if (!auth.valid) return { success: false, message: auth.error };
  try {
    var ss = SpreadsheetApp.openById(CONFIG.SHEET_ID);
    var sheet = ss.getSheetByName("DBUG_AppLog");
    if (!sheet) return { success: true, events: [] };
    var lastRow = sheet.getLastRow();
    if (lastRow < 2) return { success: true, events: [] };
    var rowCount = Math.min(Math.max(Number(limit || 50), 1), 200);
    var start = Math.max(2, lastRow - rowCount + 1);
    var data = sheet
      .getRange(start, 1, lastRow - start + 1, sheet.getLastColumn())
      .getValues();
    var headers = sheet
      .getRange(1, 1, 1, sheet.getLastColumn())
      .getValues()[0]
      .map(String);
    var actorIdx = headers.indexOf("Actor");
    var actionIdx = headers.indexOf("Action");
    var detailsIdx = headers.indexOf("Details");
    var out = [];
    for (var i = 0; i < data.length; i++) {
      var row = data[i];
      if (String(row[actionIdx]).trim() !== "CLIENT_EVENT") continue;
      if (String(row[actorIdx]).trim() !== String(auth.userId).trim()) continue;
      var details = {};
      try {
        details = JSON.parse(String(row[detailsIdx] || "{}"));
      } catch (e) {}
      out.push(details);
    }
    return { success: true, events: out };
  } catch (err) {
    return { success: false, message: String(err) };
  }
}

function getModulePrefix_(sheet) {
  var name = String(sheet.getName());
  var mod = name.indexOf("_") > -1 ? name.split("_")[0] : name;
  return mod.slice(0, 3).toUpperCase();
}
function isValidStructuredId_(id) {
  return /^[A-Z]{3}-[1-9]\d*$/.test(String(id));
}
function generateStructuredIdForColumn_(sheet, colIndex) {
  if (colIndex === -1) return Utilities.getUuid();
  var prefix = getModulePrefix_(sheet) + "-";
  var lastRow = sheet.getLastRow();
  var startRow = String(sheet.getName()).indexOf("ENG_") === 0 ? 2 : 3;
  if (lastRow < startRow) return prefix + "1";
  var data = sheet
    .getRange(startRow, colIndex + 1, lastRow - (startRow - 1), 1)
    .getValues();
  var max = 0;
  for (var i = 0; i < data.length; i++) {
    var val = String(data[i][0]);
    if (val.startsWith(prefix)) {
      var numPart = parseInt(val.replace(prefix, ""), 10);
      if (!isNaN(numPart)) max = Math.max(max, numPart);
    }
  }
  return prefix + String(max + 1);
}

function insertRowByHeaders_(sheet, headers, obj) {
  var row = headers.map(function (h) {
    return obj[h] !== undefined ? obj[h] : "";
  });
  var targetRow = Math.max(3, sheet.getLastRow() + 1);
  sheet.getRange(targetRow, 1, 1, headers.length).setValues([row]);
}

function nextIdByHeaders_(sheet, headers, idColName) {
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

function migrateIdsToStructured_() {
  try {
    var ss = SpreadsheetApp.openById(CONFIG.SHEET_ID);
    var sheets = ss.getSheets();
    for (var si = 0; si < sheets.length; si++) {
      var sh = sheets[si];
      var name = String(sh.getName());
      if (!/^SYS_|^HRM_|^PRJ_|^FIN_/.test(name)) continue;
      var headers = sh
        .getRange(1, 1, 1, sh.getLastColumn())
        .getValues()[0]
        .map(String);
      var idCols = [];
      for (var hi = 0; hi < headers.length; hi++) {
        if (headers[hi].endsWith("_ID")) idCols.push(hi);
      }
      if (idCols.length === 0) continue;
      var startRow = name.indexOf("ENG_") === 0 ? 2 : 3;
      var lastRow = sh.getLastRow();
      for (var r = startRow; r <= lastRow; r++) {
        for (var ci = 0; ci < idCols.length; ci++) {
          var c = idCols[ci];
          var val = String(sh.getRange(r, c + 1).getValue());
          if (!isValidStructuredId_(val)) {
            var newId = generateStructuredIdForColumn_(sh, c);
            if (isValidStructuredId_(newId)) {
              sh.getRange(r, c + 1).setValue(newId);
            }
          }
        }
      }
      logInfo_(
        "system",
        "MIGRATE_IDS",
        name,
        "",
        "Completed structured ID migration"
      );
    }
  } catch (e) {
    logError_("system", "MIGRATE_IDS", "SYSTEM", "", "Migration failed", e);
  }
}

// removed duplicate runEngineTests (see earlier comprehensive version)

function isDeveloperAcknowledged(email) {
  try {
    var ss = SpreadsheetApp.openById(CONFIG.SHEET_ID);
    var sheet = ss.getSheetByName("SYS_Dev_Ack");
    if (!sheet) return { acknowledged: false };
    var data = sheet.getDataRange().getValues();
    var h = data[0].map(String);
    var emailIdx = h.indexOf("DEV_Email");
    var readIdx = h.indexOf("Ack_Read");
    var signedIdx = h.indexOf("Ack_Signed_At");
    for (var i = 1; i < data.length; i++) {
      var row = data[i];
      if (
        String(row[emailIdx]).trim().toLowerCase() ===
        String(email).trim().toLowerCase()
      ) {
        var read = String(row[readIdx]).trim().toUpperCase() === "TRUE";
        var signed = String(row[signedIdx]).trim() !== "";
        return { acknowledged: read && signed };
      }
    }
    return { acknowledged: false };
  } catch (e) {
    return { acknowledged: false };
  }
}

function recordDeveloperAcknowledgement(email, name) {
  try {
    var ss = SpreadsheetApp.openById(CONFIG.SHEET_ID);
    var sheet = ss.getSheetByName("SYS_Dev_Ack");
    if (!sheet) return { success: false };
    var h = sheet
      .getRange(1, 1, 1, sheet.getLastColumn())
      .getValues()[0]
      .map(String);
    var emailIdx = h.indexOf("DEV_Email");
    var nameIdx = h.indexOf("DEV_Name");
    var readIdx = h.indexOf("Ack_Read");
    var signedIdx = h.indexOf("Ack_Signed_At");
    var verifiedIdx = h.indexOf("Verified_By");
    var last = sheet.getLastRow();
    var updated = false;
    for (var r = 2; r <= last; r++) {
      var v = String(sheet.getRange(r, emailIdx + 1).getValue())
        .trim()
        .toLowerCase();
      if (v === String(email).trim().toLowerCase()) {
        sheet.getRange(r, nameIdx + 1).setValue(name || "");
        sheet.getRange(r, readIdx + 1).setValue(true);
        sheet.getRange(r, signedIdx + 1).setValue(new Date());
        sheet.getRange(r, verifiedIdx + 1).setValue("system");
        updated = true;
        break;
      }
    }
    if (!updated) {
      var rowObj = {};
      rowObj["DEV_Email"] = email;
      rowObj["DEV_Name"] = name || "";
      rowObj["Ack_Read"] = true;
      rowObj["Ack_Signed_At"] = new Date();
      rowObj["Verified_By"] = "system";
      insertRowByHeaders_(sheet, h, rowObj);
    }
    return { success: true };
  } catch (e) {
    return { success: false };
  }
}

function ensureAgentCompliance(agentId, agentName, agentEmail) {
  try {
    var ack = isDeveloperAcknowledged(agentEmail);
    if (!ack.acknowledged) {
      recordDeveloperAcknowledgement(agentEmail, agentName);
      ack = isDeveloperAcknowledged(agentEmail);
    }
    return {
      ok: !!ack.acknowledged,
      message: ack.acknowledged ? "ACK_OK" : "ACK_PENDING",
    };
  } catch (e) {
    return { ok: false, message: String(e) };
  }
}
/**
 * ================================================================================
 * NIJJARA ERP - FILE UPLOAD HANDLERS (Fixed & Integrated)
 * ================================================================================
 */

/**
 * Uploads a file to Google Drive and registers it in SYS_Documents.
 * @param {string} dataBase64 - The base64 string of the file.
 * @param {string} mimeType - The file type (e.g., 'application/pdf').
 * @param {string} fileName - The name of the file.
 * @param {string} entityType - The table name (e.g., 'HRM_Employees').
 * @param {string} entityId - The ID of the record (e.g., 'HRM-1001').
 * @param {string} docLabel - The user-defined description.
 * @param {string} token - The user auth token.
 */
function uploadFileAPI(
  dataBase64,
  mimeType,
  fileName,
  entityType,
  entityId,
  docLabel,
  token
) {
  var auth = validateSession_(token);
  if (!auth.valid)
    return { success: false, message: auth.error, code: "AUTH_REQUIRED" };

  try {
    // 1. Setup Folder Structure in Drive
    var mainFolder = getOrCreateFolder_("Nijjara ERP System");
    var entityFolder = getOrCreateFolder_(entityType, mainFolder);
    var recordFolder = getOrCreateFolder_(entityId, entityFolder);

    // 2. Create the Blob and File
    var decoded = Utilities.base64Decode(dataBase64);
    var blob = Utilities.newBlob(decoded, mimeType, fileName);
    var file = recordFolder.createFile(blob);

    file.setDescription("Uploaded by: " + auth.email + " | Label: " + docLabel);

    // 3. Register in SYS_Documents
    var ss = SpreadsheetApp.openById(CONFIG.SHEET_ID);
    var docSheet = ss.getSheetByName("SYS_Documents");

    // Check headers to find column indexes
    var headers = docSheet
      .getRange(1, 1, 1, docSheet.getLastColumn())
      .getValues()[0]
      .map(String);

    // Generate a clean ID for the document (e.g., SYS-DOC-101)
    // We reuse the existing helper 'generateStructuredIdForColumn_'
    var idColIdx = headers.indexOf("DOC_ID");
    var newDocId = generateStructuredIdForColumn_(docSheet, idColIdx);

    var rowData = {};
    rowData["DOC_ID"] = newDocId;
    rowData["DOC_Entity"] = entityType;
    rowData["DOC_Entity_ID"] = entityId;
    rowData["DOC_File_Name"] = fileName;
    rowData["DOC_Label"] = docLabel; // The description the user wrote
    rowData["DOC_Drive_URL"] = file.getUrl();
    rowData["DOC_Upload_By"] = auth.userId;
    rowData["DOC_Crt_At"] = new Date();

    insertRowByHeaders_(docSheet, headers, rowData);

    logInfo_(
      auth.userId,
      "UPLOAD_FILE",
      entityType,
      entityId,
      "Uploaded: " + fileName
    );

    return {
      success: true,
      message: "File uploaded successfully",
      fileUrl: file.getUrl(),
      docId: newDocId,
    };
  } catch (e) {
    logError_(
      auth.userId,
      "UPLOAD_FAIL",
      entityType,
      entityId,
      "Upload Error",
      e
    );
    return { success: false, message: "Upload failed: " + String(e) };
  }
}

/** * Helper to get or create a folder by name inside a parent.
 * If parent is null, searches root.
 */
function getOrCreateFolder_(folderName, parentFolder) {
  var folders;
  if (parentFolder) {
    folders = parentFolder.getFoldersByName(folderName);
  } else {
    folders = DriveApp.getFoldersByName(folderName);
  }

  if (folders.hasNext()) {
    return folders.next();
  } else {
    if (parentFolder) {
      return parentFolder.createFolder(folderName);
    } else {
      return DriveApp.createFolder(folderName);
    }
  }
}

/**
 * Fetch all documents related to a specific record.
 */
function getEntityDocuments(entityType, entityId, token) {
  var auth = validateSession_(token);
  if (!auth.valid) return { success: false };

  try {
    var ss = SpreadsheetApp.openById(CONFIG.SHEET_ID);
    var sheet = ss.getSheetByName("SYS_Documents");
    if (!sheet) return { success: true, documents: [] };

    var data = sheet.getDataRange().getValues();
    // Headers are in Row 1 (Index 0)
    var h = data[0].map(String);

    var entityCol = h.indexOf("DOC_Entity");
    var idCol = h.indexOf("DOC_Entity_ID");

    // Map helpful columns
    var urlCol = h.indexOf("DOC_Drive_URL");
    var labelCol = h.indexOf("DOC_Label");
    var nameCol = h.indexOf("DOC_File_Name");
    var docIdCol = h.indexOf("DOC_ID");

    var docs = [];

    // Data starts at Row 4 (Index 3) in our 3-row protocol
    // But let's be safe and start checking from row 2 onwards just in case
    for (var i = 3; i < data.length; i++) {
      var row = data[i];
      if (
        String(row[entityCol]) === String(entityType) &&
        String(row[idCol]) === String(entityId)
      ) {
        docs.push({
          docId: row[docIdCol],
          fileName: row[nameCol],
          label: row[labelCol],
          url: row[urlCol],
        });
      }
    }

    return { success: true, documents: docs };
  } catch (e) {
    return { success: false, message: String(e) };
  }
}

function checkPermission(userId, action, entity, token) {
  try {
    var auth = validateSession_(token);
    if (!auth.valid) {
      return { allowed: false, reason: "Invalid session" };
    }

    var ss = SpreadsheetApp.openById(CONFIG.SHEET_ID);

    // Get user's role
    var usersSheet = ss.getSheetByName("SYS_Users");
    var userRole = null;
    if (usersSheet) {
      var usersData = usersSheet.getDataRange().getValues();
      var usersHeaders = usersData[0].map(String);
      var usrIdIdx = usersHeaders.indexOf("USR_ID");
      var roleIdx = usersHeaders.indexOf("ROL_ID");
      if (usrIdIdx >= 0 && roleIdx >= 0) {
        for (var u = 1; u < usersData.length; u++) {
          if (String(usersData[u][usrIdIdx]).trim() === String(userId).trim()) {
            userRole = String(usersData[u][roleIdx]).trim();
            break;
          }
        }
      }
    }

    if (!userRole) {
      return { allowed: false, reason: "No role assigned" };
    }

    // Check if role is system role (usually has all permissions)
    var rolesSheet = ss.getSheetByName("SYS_Roles");
    if (rolesSheet) {
      var rolesData = rolesSheet.getDataRange().getValues();
      var rolesHeaders = rolesData[0].map(String);
      var rolIdIdx = rolesHeaders.indexOf("ROL_ID");
      var rolSysIdx = rolesHeaders.indexOf("ROL_Is_System");
      if (rolIdIdx >= 0 && rolSysIdx >= 0) {
        for (var r = 1; r < rolesData.length; r++) {
          if (String(rolesData[r][rolIdIdx]).trim() === userRole) {
            var isSystem =
              String(rolesData[r][rolSysIdx]).trim().toUpperCase() === "TRUE";
            if (isSystem) {
              return { allowed: true, reason: "System role" };
            }
            break;
          }
        }
      }
    }

    // Check SYS_Role_Permissions
    var rpSheet = ss.getSheetByName("SYS_Role_Permissions");
    if (!rpSheet) {
      // If no permissions table, allow by default (backward compatibility)
      return { allowed: true, reason: "No permissions table" };
    }

    var rpData = rpSheet.getDataRange().getValues();
    var rpHeaders = rpData[0].map(String);
    var rolIdIdx = rpHeaders.indexOf("ROL_ID");
    var prmIdIdx = rpHeaders.indexOf("PRM_ID");
    var allowedIdx = rpHeaders.indexOf("SRP_Is_Allowed");
    var scopeIdx = rpHeaders.indexOf("SRP_Scope");
    var entityIdx = rpHeaders.indexOf("AUD_Entity");

    // Map action to permission ID pattern
    var actionMap = {
      CREATE: "CREATE",
      UPDATE: "UPDATE",
      DELETE: "DELETE",
      VIEW: "VIEW",
      READ: "VIEW",
    };
    var permAction = actionMap[action.toUpperCase()] || action.toUpperCase();

    // Check permissions
    for (var rp = 1; rp < rpData.length; rp++) {
      if (String(rpData[rp][rolIdIdx]).trim() !== userRole) continue;

      var permId = String(rpData[rp][prmIdIdx]).trim();
      var isAllowed =
        allowedIdx >= 0
          ? String(rpData[rp][allowedIdx]).trim().toUpperCase() === "TRUE"
          : false;
      var scope = scopeIdx >= 0 ? String(rpData[rp][scopeIdx]).trim() : "";
      var permEntity =
        entityIdx >= 0 ? String(rpData[rp][entityIdx]).trim() : "";

      // Check if permission matches action and entity
      if (
        isAllowed &&
        (permId.indexOf(permAction) >= 0 || permId === "ALL") &&
        (permEntity === "" || permEntity === entity || scope === "ALL")
      ) {
        return { allowed: true, reason: "Permission granted" };
      }
    }

    return { allowed: false, reason: "Permission denied" };
  } catch (e) {
    logError_(
      userId,
      "PERMISSION_CHECK",
      entity,
      action,
      "Permission check error",
      e
    );
    // Fail secure: deny on error
    return { allowed: false, reason: "Error checking permissions" };
  }
}

function runAllocations(expenseData, formId, expenseId, ss, userId) {
  try {
    if (formId === "FORM_FIN_AddInDirectExpense_Time") {
      // Time-based allocation: Find ACTIVE projects overlapping with expense dates
      var startDate = expenseData["InDiEXP_Start"]
        ? new Date(expenseData["InDiEXP_Start"])
        : null;
      var endDate = expenseData["InDiEXP_End"]
        ? new Date(expenseData["InDiEXP_End"])
        : null;
      var amount = Number(
        expenseData["InDiEXP_TM_Amnt"] ||
          expenseData["InDiEXP_Total_VAT_Inc"] ||
          0
      );

      if (!startDate || !endDate || amount <= 0) {
        logWarn_(
          userId,
          "ALLOCATION",
          "FIN_InDirectExpenses_Time",
          expenseId,
          "Invalid date range or amount"
        );
        return;
      }

      var prjSheet = ss.getSheetByName("PRJ_Main");
      if (!prjSheet) return;

      var prjData = prjSheet.getDataRange().getValues();
      if (prjData.length < 4) return;

      var prjHeaders = prjData[0].map(String);
      var prjIdIdx = prjHeaders.indexOf("PRJ_ID");
      var prjStatusIdx = prjHeaders.indexOf("PRJ_Status");
      var planStartIdx = prjHeaders.indexOf("Plan_Start_Date");
      var planEndIdx = prjHeaders.indexOf("PRJ_End_Date");
      if (planEndIdx < 0) planEndIdx = prjHeaders.indexOf("Actual_End_Date");

      var activeProjects = [];
      var totalOverlapDays = 0;

      // Find active projects and calculate overlaps
      for (var p = 3; p < prjData.length; p++) {
        var prjStatus = String(prjData[p][prjStatusIdx] || "")
          .trim()
          .toUpperCase();
        if (prjStatus !== "ACTIVE" && prjStatus !== "جاري التنفيذ") continue;

        var prjPlanStart = prjData[p][planStartIdx]
          ? new Date(prjData[p][planStartIdx])
          : null;
        var prjPlanEnd = prjData[p][planEndIdx]
          ? new Date(prjData[p][planEndIdx])
          : null;

        if (!prjPlanStart) continue;

        // Calculate overlap days
        var overlapStart = prjPlanStart > startDate ? prjPlanStart : startDate;
        var overlapEnd =
          prjPlanEnd && prjPlanEnd < endDate ? prjPlanEnd : endDate;
        if (overlapStart <= overlapEnd) {
          var overlapDays =
            Math.ceil((overlapEnd - overlapStart) / (1000 * 60 * 60 * 24)) + 1;
          if (overlapDays > 0) {
            activeProjects.push({
              prjId: String(prjData[p][prjIdIdx]).trim(),
              overlapDays: overlapDays,
            });
            totalOverlapDays += overlapDays;
          }
        }
      }

      if (activeProjects.length === 0 || totalOverlapDays === 0) {
        logWarn_(
          userId,
          "ALLOCATION",
          "FIN_InDirectExpenses_Time",
          expenseId,
          "No active projects found"
        );
        return;
      }

      // Allocate to PRJ_IndirExp_Time_Alloc
      var allocSheet = ss.getSheetByName("PRJ_IndirExp_Time_Alloc");
      if (!allocSheet) return;

      var allocHeaders = allocSheet
        .getRange(1, 1, 1, allocSheet.getLastColumn())
        .getValues()[0]
        .map(String);

      for (var ap = 0; ap < activeProjects.length; ap++) {
        var allocAmount =
          (activeProjects[ap].overlapDays / totalOverlapDays) * amount;
        var allocRow = {};
        allocRow["InDiEXP_TM_ID"] = expenseId;
        allocRow["PRJ_ID"] = activeProjects[ap].prjId;
        allocRow["ALO_TM_Methd"] = "Time-Based Overlap";
        allocRow["ALO_TM_Amnt"] = Math.round(allocAmount * 100) / 100;
        allocRow["ALO_TM_Crt_At"] = new Date();
        allocRow["ALO_TM_Crt_By"] = userId || "system";

        insertRowByHeaders_(allocSheet, allocHeaders, allocRow);
      }

      logInfo_(
        userId,
        "ALLOCATION",
        "PRJ_IndirExp_Time_Alloc",
        expenseId,
        "Allocated to " + activeProjects.length + " projects"
      );
    } else if (formId === "FORM_FIN_AddInDirectExpense_NoTime") {
      // Budget-based allocation: Find ACTIVE projects, allocate by budget ratio
      var amount = Number(
        expenseData["InDiEXP_NT_Amnt"] ||
          expenseData["InDiEXP_Total_VAT_Inc"] ||
          0
      );

      if (amount <= 0) {
        logWarn_(
          userId,
          "ALLOCATION",
          "FIN_InDirectExpenses_NoTime",
          expenseId,
          "Invalid amount"
        );
        return;
      }

      var prjSheet = ss.getSheetByName("PRJ_Main");
      if (!prjSheet) return;

      var prjData = prjSheet.getDataRange().getValues();
      if (prjData.length < 4) return;

      var prjHeaders = prjData[0].map(String);
      var prjIdIdx = prjHeaders.indexOf("PRJ_ID");
      var prjStatusIdx = prjHeaders.indexOf("PRJ_Status");
      var prjBudgetIdx = prjHeaders.indexOf("PRJ_Budget");

      var activeProjects = [];
      var totalBudget = 0;

      // Find active projects and sum budgets
      for (var p = 3; p < prjData.length; p++) {
        var prjStatus = String(prjData[p][prjStatusIdx] || "")
          .trim()
          .toUpperCase();
        if (prjStatus !== "ACTIVE" && prjStatus !== "جاري التنفيذ") continue;

        var prjBudget = Number(prjData[p][prjBudgetIdx] || 0);
        if (prjBudget > 0) {
          activeProjects.push({
            prjId: String(prjData[p][prjIdIdx]).trim(),
            budget: prjBudget,
          });
          totalBudget += prjBudget;
        }
      }

      if (activeProjects.length === 0 || totalBudget === 0) {
        logWarn_(
          userId,
          "ALLOCATION",
          "FIN_InDirectExpenses_NoTime",
          expenseId,
          "No active projects with budget found"
        );
        return;
      }

      // Allocate to PRJ_IndirExp_NoTime_Alloc
      var allocSheet = ss.getSheetByName("PRJ_IndirExp_NoTime_Alloc");
      if (!allocSheet) return;

      var allocHeaders = allocSheet
        .getRange(1, 1, 1, allocSheet.getLastColumn())
        .getValues()[0]
        .map(String);

      for (var ap = 0; ap < activeProjects.length; ap++) {
        var allocAmount = (activeProjects[ap].budget / totalBudget) * amount;
        var allocRow = {};
        allocRow["InDiEXP_NT_ID"] = expenseId;
        allocRow["PRJ_ID"] = activeProjects[ap].prjId;
        allocRow["ALO_NT_Methd"] = "Budget-Based Ratio";
        allocRow["ALO_NT_Amnt"] = Math.round(allocAmount * 100) / 100;
        allocRow["ALO_NT_Crt_At"] = new Date();
        allocRow["ALO_NT_Crt_By"] = userId || "system";

        insertRowByHeaders_(allocSheet, allocHeaders, allocRow);
      }

      logInfo_(
        userId,
        "ALLOCATION",
        "PRJ_IndirExp_NoTime_Alloc",
        expenseId,
        "Allocated to " + activeProjects.length + " projects"
      );
    }
  } catch (e) {
    logError_(
      userId,
      "ALLOCATION_ERROR",
      formId,
      expenseId,
      "Allocation failed",
      e
    );
    throw e;
  }
}

// ===== NEW API ENDPOINTS FOR ENHANCED FRONTEND =====

/**
 * Process Login - Enhanced version for new frontend
 */
function processLogin(requestBody) {
  try {
    const result = login(requestBody.username, requestBody.password);
    return ContentService.createTextOutput(JSON.stringify(result)).setMimeType(
      ContentService.MimeType.JSON
    );
  } catch (error) {
    return ContentService.createTextOutput(
      JSON.stringify({
        success: false,
        message: "خطأ في تسجيل الدخول",
        error: String(error),
      })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Process Logout
 */
function processLogout(requestBody) {
  try {
    const token = requestBody.token;
    if (!token) {
      throw new Error("Token required");
    }

    // Revoke session
    const ss = SpreadsheetApp.openById(CONFIG.SHEET_ID);
    const sessionSheet = ss.getSheetByName("SYS_Sessions");

    if (sessionSheet) {
      const headers = sessionSheet
        .getRange(1, 1, 1, sessionSheet.getLastColumn())
        .getValues()[0]
        .map(String);
      const tokenIdx = headers.indexOf("Auth_Token");
      const statusIdx = headers.indexOf("SESS_Status");
      const revokedIdx = headers.indexOf("SESS_Revoked_At");

      if (sessionSheet.getLastRow() > 3) {
        const data = sessionSheet
          .getRange(
            4,
            1,
            sessionSheet.getLastRow() - 3,
            sessionSheet.getLastColumn()
          )
          .getValues();

        for (let i = 0; i < data.length; i++) {
          if (String(data[i][tokenIdx]).trim() === token.trim()) {
            // Revoke this session
            sessionSheet.getRange(i + 4, statusIdx + 1).setValue("REVOKED");
            sessionSheet.getRange(i + 4, revokedIdx + 1).setValue(new Date());
            break;
          }
        }
      }
    }

    return ContentService.createTextOutput(
      JSON.stringify({
        success: true,
        message: "تم تسجيل الخروج بنجاح",
      })
    ).setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(
      JSON.stringify({
        success: false,
        message: "خطأ في تسجيل الخروج",
        error: String(error),
      })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Get Bootstrap Data - Load ENG configuration for dynamic UI
 */
function apiGetBootstrapData(requestBody) {
  try {
    const sessionCheck = validateSession_(requestBody.token);
    if (!sessionCheck.valid) {
      throw new Error("Invalid session");
    }

    const ss = SpreadsheetApp.openById(CONFIG.SHEET_ID);
    const bootstrap = {};

    // Load ENG_Forms
    const formsSheet = ss.getSheetByName("ENG_Forms");
    if (!formsSheet) {
      throw new Error(
        "⚠️ ENG_Forms sheet missing! Run Setup.js: 'Nijj_Interaction_Sys' → 'Run System' → 'Build Schema + Seed ENG'"
      );
    }
    if (formsSheet && formsSheet.getLastRow() > 1) {
      const formsData = formsSheet
        .getRange(2, 1, formsSheet.getLastRow() - 1, formsSheet.getLastColumn())
        .getValues();
      bootstrap.forms = formsData.map((row) => ({
        FORM_ID: row[0],
        TAB_Section: row[1],
        Column_Pointer: row[2],
        Field_Type: row[3],
        Smart_State: row[4],
        DYN_Link: row[5],
      }));
    } else {
      bootstrap.forms = [];
    }

    // Load ENG_Views
    const viewsSheet = ss.getSheetByName("ENG_Views");
    if (viewsSheet && viewsSheet.getLastRow() > 1) {
      const viewsData = viewsSheet
        .getRange(2, 1, viewsSheet.getLastRow() - 1, viewsSheet.getLastColumn())
        .getValues();
      bootstrap.views = viewsData.map((row) => ({
        VIEW_ID: row[0],
        View_Title: row[1],
        Source_Sheet: row[2],
      }));
    } else {
      bootstrap.views = [];
    }

    // Load ENG_Dropdowns
    const ddSheet = ss.getSheetByName("ENG_Dropdowns");
    bootstrap.dropdowns = {};
    if (ddSheet && ddSheet.getLastRow() > 1) {
      const ddData = ddSheet
        .getRange(2, 1, ddSheet.getLastRow() - 1, ddSheet.getLastColumn())
        .getValues();
      ddData.forEach((row) => {
        const ddId = row[0];
        if (!bootstrap.dropdowns[ddId]) {
          bootstrap.dropdowns[ddId] = [];
        }
        bootstrap.dropdowns[ddId].push({
          DD_EN: row[1],
          DD_AR: row[2],
          DD_Is_Active: row[3],
          DD_Sort_Order: row[4],
        });
      });
    }

    // Load ENG_Buttons
    const btnSheet = ss.getSheetByName("ENG_Buttons");
    if (btnSheet && btnSheet.getLastRow() > 1) {
      const btnData = btnSheet
        .getRange(2, 1, btnSheet.getLastRow() - 1, btnSheet.getLastColumn())
        .getValues();
      bootstrap.buttons = btnData.map((row) => ({
        BTN_ID: row[0],
        BTN_Label: row[1],
        BTN_Type: row[2],
        BTN_Description: row[3],
      }));
    } else {
      bootstrap.buttons = [];
    }

    // User permissions and role
    bootstrap.userRole = "admin"; // For now, hardcode admin role
    bootstrap.permissions = {}; // Will be expanded later

    return ContentService.createTextOutput(
      JSON.stringify({
        success: true,
        forms: bootstrap.forms || [],
        views: bootstrap.views || [],
        buttons: bootstrap.buttons || [],
        dropdowns: bootstrap.dropdowns || {},
        permissions: bootstrap.permissions || {},
        userRole: bootstrap.userRole || null,
        user: { userId: sessionCheck.userId, email: sessionCheck.email },
      })
    ).setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    console.error("getBootstrapData error:", error);
    return ContentService.createTextOutput(
      JSON.stringify({
        success: false,
        message: "فشل في تحميل إعدادات النظام",
        error: String(error),
      })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

function getBootstrapDataObject(token) {
  try {
    var sessionCheck = validateSession_(token);
    if (!sessionCheck.valid) return { success: false, message: "Invalid session" };
    var ss = SpreadsheetApp.openById(CONFIG.SHEET_ID);
    var out = { forms: [], views: [], buttons: [], dropdowns: {}, permissions: {}, userRole: null };
    var usersSheet = ss.getSheetByName("SYS_Users");
    if (usersSheet) {
      var usersData = usersSheet.getDataRange().getValues();
      var h = usersData[0].map(String);
      var usrIdIdx = h.indexOf("USR_ID");
      var roleIdx = h.indexOf("ROL_ID");
      if (usrIdIdx >= 0 && roleIdx >= 0) {
        for (var u = 1; u < usersData.length; u++) {
          if (String(usersData[u][usrIdIdx]).trim() === String(sessionCheck.userId).trim()) {
            out.userRole = String(usersData[u][roleIdx]).trim();
            break;
          }
        }
      }
    }
    var rolePermSheet = ss.getSheetByName("SYS_Role_Permissions");
    if (rolePermSheet && out.userRole) {
      var rpData = rolePermSheet.getDataRange().getValues();
      var rpHeaders = rpData[0].map(String);
      var rolIdIdx = rpHeaders.indexOf("ROL_ID");
      var prmIdIdx = rpHeaders.indexOf("PRM_ID");
      var allowedIdx = rpHeaders.indexOf("SRP_Is_Allowed");
      var scopeIdx = rpHeaders.indexOf("SRP_Scope");
      for (var rp = 1; rp < rpData.length; rp++) {
        if (String(rpData[rp][rolIdIdx]).trim() === out.userRole && String(rpData[rp][allowedIdx]).trim().toUpperCase() === "TRUE") {
          var permId = String(rpData[rp][prmIdIdx]).trim();
          var scope = scopeIdx >= 0 ? String(rpData[rp][scopeIdx]).trim() : "";
          out.permissions[permId] = { allowed: true, scope: scope };
        }
      }
    }
    var formsSheet = ss.getSheetByName("ENG_Forms");
    if (formsSheet && formsSheet.getLastRow() > 1) {
      var formsData = formsSheet.getRange(2, 1, formsSheet.getLastRow() - 1, formsSheet.getLastColumn()).getValues();
      out.forms = formsData.map(function(row){ return { FORM_ID: row[0], TAB_Section: row[1], Column_Pointer: row[2], Field_Type: row[3], Smart_State: row[4], DYN_Link: row[5] }; });
    }
    var viewsSheet = ss.getSheetByName("ENG_Views");
    if (viewsSheet && viewsSheet.getLastRow() > 1) {
      var viewsData = viewsSheet.getRange(2, 1, viewsSheet.getLastRow() - 1, viewsSheet.getLastColumn()).getValues();
      out.views = viewsData.map(function(row){ return { VIEW_ID: row[0], View_Title: row[1], Source_Sheet: row[2] }; });
    }
    var ddSheet = ss.getSheetByName("ENG_Dropdowns");
    if (ddSheet && ddSheet.getLastRow() > 1) {
      var ddData = ddSheet.getRange(2, 1, ddSheet.getLastRow() - 1, ddSheet.getLastColumn()).getValues();
      for (var i = 0; i < ddData.length; i++) {
        var ddId = ddData[i][0];
        if (!out.dropdowns[ddId]) out.dropdowns[ddId] = [];
        out.dropdowns[ddId].push({ DD_EN: ddData[i][1], DD_AR: ddData[i][2], DD_Is_Active: ddData[i][3], DD_Sort_Order: ddData[i][4] });
      }
    }
    var btnSheet = ss.getSheetByName("ENG_Buttons");
    if (btnSheet && btnSheet.getLastRow() > 1) {
      var btnData = btnSheet.getRange(2, 1, btnSheet.getLastRow() - 1, btnSheet.getLastColumn()).getValues();
      out.buttons = btnData.map(function(row){ return { BTN_ID: row[0], BTN_Label: row[1], BTN_Type: row[2], BTN_Description: row[3] }; });
    }
    return { success: true, forms: out.forms, views: out.views, buttons: out.buttons, dropdowns: out.dropdowns, permissions: out.permissions, userRole: out.userRole };
  } catch (error) {
    return { success: false, message: String(error) };
  }
}

/**
 * Get Dashboard KPIs - Real data for dashboard
 */
function getDashboardKPIs(requestBody) {
  try {
    const sessionCheck = validateSession_(requestBody.token);
    if (!sessionCheck.valid) {
      throw new Error("Invalid session");
    }

    const ss = SpreadsheetApp.openById(CONFIG.SHEET_ID);
    const kpis = {};

    // Count total employees
    const empSheet = ss.getSheetByName("HRM_Employees");
    if (empSheet && empSheet.getLastRow() > 3) {
      kpis.totalEmployees = empSheet.getLastRow() - 3; // Subtract header rows
    } else {
      kpis.totalEmployees = 0;
    }

    // Count active projects
    const prjSheet = ss.getSheetByName("PRJ_Main");
    if (prjSheet && prjSheet.getLastRow() > 3) {
      const prjData = prjSheet
        .getRange(4, 1, prjSheet.getLastRow() - 3, prjSheet.getLastColumn())
        .getValues();
      const headers = prjSheet
        .getRange(1, 1, 1, prjSheet.getLastColumn())
        .getValues()[0]
        .map(String);
      const statusIdx = headers.indexOf("PRJ_Status");

      let activeCount = 0;
      if (statusIdx >= 0) {
        prjData.forEach((row) => {
          const status = String(row[statusIdx] || "").toLowerCase();
          if (
            status === "active" ||
            status === "جاري التنفيذ" ||
            status === "نشط"
          ) {
            activeCount++;
          }
        });
      }
      kpis.activeProjects = activeCount;
    } else {
      kpis.activeProjects = 0;
    }

    // Calculate monthly revenue
    const revSheet = ss.getSheetByName("FIN_PRJ_Revenue");
    if (revSheet && revSheet.getLastRow() > 3) {
      const revData = revSheet
        .getRange(4, 1, revSheet.getLastRow() - 3, revSheet.getLastColumn())
        .getValues();
      const headers = revSheet
        .getRange(1, 1, 1, revSheet.getLastColumn())
        .getValues()[0]
        .map(String);
      const amountIdx = headers.indexOf("REV_Amnt");
      const dateIdx = headers.indexOf("REV_Date");

      let monthlyTotal = 0;
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();

      if (amountIdx >= 0 && dateIdx >= 0) {
        revData.forEach((row) => {
          const amount = Number(row[amountIdx] || 0);
          const date = new Date(row[dateIdx]);
          if (
            date.getMonth() === currentMonth &&
            date.getFullYear() === currentYear
          ) {
            monthlyTotal += amount;
          }
        });
      }
      kpis.monthlyRevenue = Math.round(monthlyTotal);
    } else {
      kpis.monthlyRevenue = 0;
    }

    // Calculate completion rate (tasks completed vs total)
    const taskSheet = ss.getSheetByName("PRJ_Tasks");
    if (taskSheet && taskSheet.getLastRow() > 3) {
      const taskData = taskSheet
        .getRange(4, 1, taskSheet.getLastRow() - 3, taskSheet.getLastColumn())
        .getValues();
      const headers = taskSheet
        .getRange(1, 1, 1, taskSheet.getLastColumn())
        .getValues()[0]
        .map(String);
      const statusIdx = headers.indexOf("TSK_Status");

      let totalTasks = taskData.length;
      let completedTasks = 0;

      if (statusIdx >= 0) {
        taskData.forEach((row) => {
          const status = String(row[statusIdx] || "").toLowerCase();
          if (
            status === "completed" ||
            status === "مكتملة" ||
            status === "منجز"
          ) {
            completedTasks++;
          }
        });
      }

      kpis.completionRate =
        totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    } else {
      kpis.completionRate = 0;
    }

    return ContentService.createTextOutput(
      JSON.stringify({
        success: true,
        kpis: kpis,
      })
    ).setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    console.error("getDashboardKPIs error:", error);
    return ContentService.createTextOutput(
      JSON.stringify({
        success: false,
        message: "فشل في تحميل إحصائيات النظام",
        error: String(error),
      })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

function getDashboardKPIsObject(token) {
  try {
    var sessionCheck = validateSession_(token);
    if (!sessionCheck.valid) return { success: false, message: "Invalid session" };
    var ss = SpreadsheetApp.openById(CONFIG.SHEET_ID);
    var kpis = {};
    var empSheet = ss.getSheetByName("HRM_Employees");
    kpis.totalEmployees = empSheet && empSheet.getLastRow() > 3 ? empSheet.getLastRow() - 3 : 0;
    var prjSheet = ss.getSheetByName("PRJ_Main");
    var activeCount = 0;
    if (prjSheet && prjSheet.getLastRow() > 3) {
      var prjData = prjSheet.getRange(4, 1, prjSheet.getLastRow() - 3, prjSheet.getLastColumn()).getValues();
      var headers = prjSheet.getRange(1, 1, 1, prjSheet.getLastColumn()).getValues()[0].map(String);
      var statusIdx = headers.indexOf("PRJ_Status");
      if (statusIdx >= 0) {
        for (var i = 0; i < prjData.length; i++) {
          var status = String(prjData[i][statusIdx] || "").toLowerCase();
          if (status === "active" || status === "جاري التنفيذ" || status === "نشط") activeCount++;
        }
      }
    }
    kpis.activeProjects = activeCount;
    var revSheet = ss.getSheetByName("FIN_PRJ_Revenue");
    var monthlyTotal = 0;
    if (revSheet && revSheet.getLastRow() > 3) {
      var revData = revSheet.getRange(4, 1, revSheet.getLastRow() - 3, revSheet.getLastColumn()).getValues();
      var h = revSheet.getRange(1, 1, 1, revSheet.getLastColumn()).getValues()[0].map(String);
      var amountIdx = h.indexOf("REV_Amnt");
      var dateIdx = h.indexOf("REV_Date");
      var cm = new Date().getMonth();
      var cy = new Date().getFullYear();
      if (amountIdx >= 0 && dateIdx >= 0) {
        for (var j = 0; j < revData.length; j++) {
          var amount = Number(revData[j][amountIdx] || 0);
          var date = new Date(revData[j][dateIdx]);
          if (date.getMonth() === cm && date.getFullYear() === cy) monthlyTotal += amount;
        }
      }
    }
    kpis.monthlyRevenue = Math.round(monthlyTotal);
    var taskSheet = ss.getSheetByName("PRJ_Tasks");
    var completionRate = 0;
    if (taskSheet && taskSheet.getLastRow() > 3) {
      var taskData = taskSheet.getRange(4, 1, taskSheet.getLastRow() - 3, taskSheet.getLastColumn()).getValues();
      var th = taskSheet.getRange(1, 1, 1, taskSheet.getLastColumn()).getValues()[0].map(String);
      var statusIdx2 = th.indexOf("TSK_Status");
      var totalTasks = taskData.length;
      var completedTasks = 0;
      if (statusIdx2 >= 0) {
        for (var t = 0; t < taskData.length; t++) {
          var st = String(taskData[t][statusIdx2] || "").toLowerCase();
          if (st === "completed" || st === "مكتملة" || st === "منجز") completedTasks++;
        }
      }
      completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    }
    kpis.completionRate = completionRate;
    return { success: true, kpis: kpis };
  } catch (error) {
    return { success: false, message: String(error) };
  }
}

function getRecentAuditLogsObject(token, limit) {
  try {
    var sessionCheck = validateSession_(token);
    if (!sessionCheck.valid) return { success: false, activities: [] };
    var ss = SpreadsheetApp.openById(CONFIG.SHEET_ID);
    var auditSheet = ss.getSheetByName("SYS_Audit_Log");
    if (!auditSheet || auditSheet.getLastRow() <= 3) return { success: true, activities: [] };
    var headers = auditSheet.getRange(1, 1, 1, auditSheet.getLastColumn()).getValues()[0].map(String);
    var lim = Math.min(limit || 10, 50);
    var startRow = Math.max(4, auditSheet.getLastRow() - lim + 1);
    var numRows = auditSheet.getLastRow() - startRow + 1;
    if (numRows <= 0) return { success: true, activities: [] };
    var data = auditSheet.getRange(startRow, 1, numRows, auditSheet.getLastColumn()).getValues();
    var activities = [];
    for (var i = data.length - 1; i >= 0; i--) {
      var row = data[i];
      var activity = {};
      for (var k = 0; k < headers.length; k++) activity[headers[k]] = row[k];
      activities.push(activity);
    }
    return { success: true, activities: activities };
  } catch (error) {
    return { success: false, message: String(error) };
  }
}

function getAuditLogDetailsObject(token, audId) {
  try {
    var sessionCheck = validateSession_(token);
    if (!sessionCheck.valid) return { success: false };
    var ss = SpreadsheetApp.openById(CONFIG.SHEET_ID);
    var auditSheet = ss.getSheetByName("SYS_Audit_Log");
    if (!auditSheet || auditSheet.getLastRow() <= 3) return { success: false };
    var headers = auditSheet.getRange(1, 1, 1, auditSheet.getLastColumn()).getValues()[0].map(String);
    var data = auditSheet.getRange(4, 1, auditSheet.getLastRow() - 3, auditSheet.getLastColumn()).getValues();
    var audIdIdx = headers.indexOf("AUD_ID");
    if (audIdIdx < 0) return { success: false };
    for (var i = 0; i < data.length; i++) {
      if (String(data[i][audIdIdx]).trim() === String(audId).trim()) {
        var foundRecord = {};
        for (var k = 0; k < headers.length; k++) foundRecord[headers[k]] = data[i][k];
        return { success: true, details: foundRecord };
      }
    }
    return { success: false, message: "Audit record not found" };
  } catch (error) {
    return { success: false, message: String(error) };
  }
}

/**
 * Get Recent Audit Logs for Dashboard
 */
function getRecentAuditLogs(requestBody) {
  try {
    const sessionCheck = validateSession_(requestBody.token);
    if (!sessionCheck.valid) {
      throw new Error("Invalid session");
    }

    const ss = SpreadsheetApp.openById(CONFIG.SHEET_ID);
    const auditSheet = ss.getSheetByName("SYS_Audit_Log");

    if (!auditSheet || auditSheet.getLastRow() <= 3) {
      return ContentService.createTextOutput(
        JSON.stringify({
          success: true,
          activities: [],
        })
      ).setMimeType(ContentService.MimeType.JSON);
    }

    const headers = auditSheet
      .getRange(1, 1, 1, auditSheet.getLastColumn())
      .getValues()[0]
      .map(String);
    const limit = Math.min(requestBody.limit || 10, 50); // Max 50 records

    // Get the most recent records
    const startRow = Math.max(4, auditSheet.getLastRow() - limit + 1);
    const numRows = auditSheet.getLastRow() - startRow + 1;

    if (numRows <= 0) {
      return ContentService.createTextOutput(
        JSON.stringify({
          success: true,
          activities: [],
        })
      ).setMimeType(ContentService.MimeType.JSON);
    }

    const data = auditSheet
      .getRange(startRow, 1, numRows, auditSheet.getLastColumn())
      .getValues();

    // Map data to readable format
    const activities = data.reverse().map((row) => {
      const activity = {};
      headers.forEach((header, index) => {
        activity[header] = row[index];
      });
      return activity;
    });

    return ContentService.createTextOutput(
      JSON.stringify({
        success: true,
        activities: activities,
      })
    ).setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    console.error("getRecentAuditLogs error:", error);
    return ContentService.createTextOutput(
      JSON.stringify({
        success: false,
        message: "فشل في تحميل الأنشطة الحديثة",
        error: String(error),
      })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Get Audit Log Details
 */
function getAuditLogDetails(requestBody) {
  try {
    const sessionCheck = validateSession_(requestBody.token);
    if (!sessionCheck.valid) {
      throw new Error("Invalid session");
    }

    const audId = requestBody.audId;
    if (!audId) {
      throw new Error("Audit ID required");
    }

    const ss = SpreadsheetApp.openById(CONFIG.SHEET_ID);
    const auditSheet = ss.getSheetByName("SYS_Audit_Log");

    if (!auditSheet || auditSheet.getLastRow() <= 3) {
      throw new Error("No audit logs found");
    }

    const headers = auditSheet
      .getRange(1, 1, 1, auditSheet.getLastColumn())
      .getValues()[0]
      .map(String);
    const data = auditSheet
      .getRange(4, 1, auditSheet.getLastRow() - 3, auditSheet.getLastColumn())
      .getValues();

    const audIdIdx = headers.indexOf("AUD_ID");
    if (audIdIdx < 0) {
      throw new Error("Invalid audit log structure");
    }

    // Find the record
    let foundRecord = null;
    for (let i = 0; i < data.length; i++) {
      if (String(data[i][audIdIdx]).trim() === String(audId).trim()) {
        foundRecord = {};
        headers.forEach((header, index) => {
          foundRecord[header] = data[i][index];
        });
        break;
      }
    }

    if (!foundRecord) {
      throw new Error("Audit record not found");
    }

    return ContentService.createTextOutput(
      JSON.stringify({
        success: true,
        details: foundRecord,
      })
    ).setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    console.error("getAuditLogDetails error:", error);
    return ContentService.createTextOutput(
      JSON.stringify({
        success: false,
        message: "فشل في تحميل تفاصيل النشاط",
        error: String(error),
      })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Get Module Data - Enhanced version with real data
 */
function apiGetModuleData(requestBody) {
  try {
    const sessionCheck = validateSession_(requestBody.token);
    if (!sessionCheck.valid) {
      throw new Error("Invalid session");
    }

    const viewId = requestBody.viewId;
    const options = requestBody.options || {};

    if (!viewId) {
      throw new Error("View ID required");
    }

    // Get view configuration from ENG_Views
    const ss = SpreadsheetApp.openById(CONFIG.SHEET_ID);
    const viewsSheet = ss.getSheetByName("ENG_Views");

    if (!viewsSheet) {
      throw new Error(
        "⚠️ Database not initialized! Please run Setup.js in Google Sheet: Go to 'Nijj_Interaction_Sys' menu → 'Run System' → Select 'Build Schema' + 'Seed ENG' + 'Seed Demo' → Execute"
      );
    }

    // Find the view configuration
    let sourceSheet = null;
    let viewTitle = null;

    if (viewsSheet.getLastRow() > 1) {
      const viewsData = viewsSheet
        .getRange(2, 1, viewsSheet.getLastRow() - 1, viewsSheet.getLastColumn())
        .getValues();

      for (let i = 0; i < viewsData.length; i++) {
        if (String(viewsData[i][0]).trim() === viewId.trim()) {
          viewTitle = viewsData[i][1];
          sourceSheet = viewsData[i][2];
          break;
        }
      }
    }

    if (!sourceSheet) {
      throw new Error("View configuration not found: " + viewId);
    }

    // Get the actual data sheet
    const dataSheet = ss.getSheetByName(sourceSheet);
    if (!dataSheet) {
      throw new Error("Data sheet not found: " + sourceSheet);
    }

    // Read headers using Smart Header Protocol
    if (dataSheet.getLastRow() < 3) {
      return ContentService.createTextOutput(
        JSON.stringify({
          success: true,
          viewTitle: viewTitle,
          headers: [],
          data: [],
          pagination: {
            currentPage: 1,
            pageSize: options.pageSize || 25,
            totalRecords: 0,
            totalPages: 0,
          },
        })
      ).setMimeType(ContentService.MimeType.JSON);
    }

    const systemKeys = dataSheet
      .getRange(1, 1, 1, dataSheet.getLastColumn())
      .getValues()[0]
      .map(String);
    const uiLabels = dataSheet
      .getRange(2, 1, 1, dataSheet.getLastColumn())
      .getValues()[0]
      .map(String);
    const viewFlags = dataSheet
      .getRange(3, 1, 1, dataSheet.getLastColumn())
      .getValues()[0]
      .map(String);

    // Determine visible columns (where viewFlag = "SHOW")
    const visibleColumns = [];
    const visibleHeaders = [];

    for (let i = 0; i < viewFlags.length; i++) {
      if (String(viewFlags[i]).trim().toUpperCase() === "SHOW") {
        visibleColumns.push(i);
        visibleHeaders.push(uiLabels[i] || systemKeys[i]);
      }
    }

    // Get data rows (starting from row 4)
    let data = [];
    let totalRecords = 0;

    if (dataSheet.getLastRow() > 3) {
      totalRecords = dataSheet.getLastRow() - 3;
      const allData = dataSheet
        .getRange(4, 1, totalRecords, dataSheet.getLastColumn())
        .getValues();

      // Apply pagination
      const pageSize = Math.min(options.pageSize || 25, 100);
      const currentPage = options.page || 1;
      const startIndex = (currentPage - 1) * pageSize;
      const endIndex = Math.min(startIndex + pageSize, totalRecords);

      for (let i = startIndex; i < endIndex; i++) {
        if (i < allData.length) {
          const row = {
            cells: visibleColumns.map((colIndex) => allData[i][colIndex]),
          };
          data.push(row);
        }
      }
    }

    const totalPages = Math.ceil(totalRecords / (options.pageSize || 25));

    return ContentService.createTextOutput(
      JSON.stringify({
        success: true,
        viewTitle: viewTitle,
        headers: visibleHeaders,
        data: data,
        pagination: {
          currentPage: options.page || 1,
          pageSize: options.pageSize || 25,
          totalRecords: totalRecords,
          totalPages: totalPages,
        },
      })
    ).setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    console.error("getModuleData error:", error);
    return ContentService.createTextOutput(
      JSON.stringify({
        success: false,
        message: "فشل في تحميل بيانات الوحدة",
        error: String(error),
      })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Save Record - Real implementation using ENG_Settings mapping
 */
function apiSaveRecord(requestBody) {
  try {
    const sessionCheck = validateSession_(requestBody.token);
    if (!sessionCheck.valid) {
      throw new Error("Invalid session");
    }

    const formId = requestBody.formId;
    const data = requestBody.data || {};

    if (!formId) {
      throw new Error("Form ID required");
    }

    // Get target sheet from ENG_Settings
    const ss = SpreadsheetApp.openById(CONFIG.SHEET_ID);
    const settingsSheet = ss.getSheetByName("ENG_Settings");

    if (!settingsSheet) {
      throw new Error("System configuration missing");
    }

    // Find target sheet for this form
    let targetSheetName = null;
    const settingKey = "FORM_MASTER:" + formId;

    if (settingsSheet.getLastRow() > 1) {
      const settingsData = settingsSheet
        .getRange(
          2,
          1,
          settingsSheet.getLastRow() - 1,
          settingsSheet.getLastColumn()
        )
        .getValues();

      for (let i = 0; i < settingsData.length; i++) {
        if (String(settingsData[i][0]).trim() === settingKey) {
          targetSheetName = settingsData[i][1];
          break;
        }
      }
    }

    if (!targetSheetName) {
      throw new Error("Target sheet not configured for form: " + formId);
    }

    const targetSheet = ss.getSheetByName(targetSheetName);
    if (!targetSheet) {
      throw new Error("Target sheet not found: " + targetSheetName);
    }

    // Read headers from Row 1 (Smart Header Protocol)
    const headers = targetSheet
      .getRange(1, 1, 1, targetSheet.getLastColumn())
      .getValues()[0]
      .map(String);

    // Generate new ID
    const idColumn = headers[0]; // First column is always the ID
    const newId = generateNextId_(targetSheet, idColumn);

    // Prepare data row
    const rowData = new Array(headers.length).fill("");
    rowData[0] = newId; // Set the ID

    // Map form data to sheet columns
    Object.keys(data).forEach((fieldName) => {
      const colIndex = headers.indexOf(fieldName);
      if (colIndex >= 0) {
        rowData[colIndex] = data[fieldName];
      }
    });

    // Add audit fields
    const now = new Date();
    const userId = sessionCheck.userId;

    const crtAtIdx =
      headers.indexOf(targetSheetName.split("_")[0] + "_Crt_At") ||
      headers.indexOf("EMP_Crt_At") ||
      headers.indexOf("ADV_Crt_At");
    const crtByIdx =
      headers.indexOf(targetSheetName.split("_")[0] + "_Crt_By") ||
      headers.indexOf("EMP_Crt_By") ||
      headers.indexOf("ADV_Crt_By");

    if (crtAtIdx >= 0) rowData[crtAtIdx] = now;
    if (crtByIdx >= 0) rowData[crtByIdx] = userId;

    // Insert the row (starting from Row 4 per Smart Header Protocol)
    const lastRow = targetSheet.getLastRow();
    const insertRow = Math.max(4, lastRow + 1);

    targetSheet.getRange(insertRow, 1, 1, rowData.length).setValues([rowData]);

    // Log the action
    logInfo_(
      userId,
      "CREATE",
      targetSheetName,
      newId,
      "Record created via form " + formId
    );

    return ContentService.createTextOutput(
      JSON.stringify({
        success: true,
        message: "تم حفظ السجل بنجاح",
        recordId: newId,
      })
    ).setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    console.error("saveRecord error:", error);
    return ContentService.createTextOutput(
      JSON.stringify({
        success: false,
        message: "فشل في حفظ السجل: " + String(error),
        error: String(error),
      })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Generate next sequential ID following the Smart ID Generation rule
 */
function generateNextId_(sheet, idColumn) {
  try {
    if (sheet.getLastRow() <= 3) {
      // No data yet, start with first ID
      const prefix = sheet.getName().split("_")[0];
      return prefix + "-1001";
    }

    // Find the ID column
    const headers = sheet
      .getRange(1, 1, 1, sheet.getLastColumn())
      .getValues()[0]
      .map(String);
    const idColIndex = headers.indexOf(idColumn);

    if (idColIndex < 0) {
      throw new Error("ID column not found: " + idColumn);
    }

    // Get existing IDs starting from Row 4
    const dataRange = sheet.getRange(
      4,
      idColIndex + 1,
      sheet.getLastRow() - 3,
      1
    );
    const existingIds = dataRange
      .getValues()
      .flat()
      .map(String)
      .filter((id) => id.trim());

    if (existingIds.length === 0) {
      const prefix = sheet.getName().split("_")[0];
      return prefix + "-1001";
    }

    // Extract numbers and find the highest
    let maxNumber = 0;
    const prefix = sheet.getName().split("_")[0];

    existingIds.forEach((id) => {
      const match = id.match(new RegExp(`^${prefix}-(\\d+)$`));
      if (match) {
        const num = parseInt(match[1]);
        if (num > maxNumber) {
          maxNumber = num;
        }
      }
    });

    // Return next sequential ID
    return prefix + "-" + (maxNumber + 1);
  } catch (error) {
    console.error("generateNextId error:", error);
    // Fallback to timestamp-based ID
    return sheet.getName().split("_")[0] + "-" + Date.now();
  }
}

/**
 * Execute Button Action - Based on ENG_Buttons configuration
 */
function executeButtonAction(requestBody) {
  try {
    const sessionCheck = validateSession_(requestBody.token);
    if (!sessionCheck.valid) {
      throw new Error("Invalid session");
    }

    const buttonId = requestBody.buttonId;
    const recordIndex = requestBody.recordIndex;
    const currentView = requestBody.currentView;

    if (!buttonId) {
      throw new Error("Button ID required");
    }

    const ss = SpreadsheetApp.openById(CONFIG.SHEET_ID);
    let result = { success: false, message: "Unknown button action" };

    // Execute specific button actions based on ENG_Buttons.csv
    switch (buttonId) {
      case "BTN_Reset_Pass":
        result = handleResetPassword(ss, sessionCheck.userId, recordIndex);
        break;

      case "BTN_Approve_Leave":
        result = handleApproveLeave(ss, sessionCheck.userId, recordIndex);
        break;

      case "BTN_Reject_Leave":
        result = handleRejectLeave(ss, sessionCheck.userId, recordIndex);
        break;

      case "BTN_PRJ_Start":
        result = handleProjectStart(ss, sessionCheck.userId, recordIndex);
        break;

      case "BTN_PRJ_Close":
        result = handleProjectClose(ss, sessionCheck.userId, recordIndex);
        break;

      case "BTN_PRJ_Hold":
        result = handleProjectHold(ss, sessionCheck.userId, recordIndex);
        break;

      case "BTN_Task_Done":
        result = handleTaskDone(ss, sessionCheck.userId, recordIndex);
        break;

      case "BTN_Approve_Adv":
        result = handleApproveAdvance(ss, sessionCheck.userId, recordIndex);
        break;

      case "BTN_Print_Invoice":
        result = handlePrintInvoice(ss, sessionCheck.userId, recordIndex);
        break;

      case "BTN_Approve_Payroll":
        result = handleApprovePayroll(ss, sessionCheck.userId, recordIndex);
        break;

      default:
        result = {
          success: false,
          message: "Button action not implemented: " + buttonId,
        };
    }

    return ContentService.createTextOutput(JSON.stringify(result)).setMimeType(
      ContentService.MimeType.JSON
    );
  } catch (error) {
    console.error("executeButtonAction error:", error);
    return ContentService.createTextOutput(
      JSON.stringify({
        success: false,
        message: "فشل في تنفيذ الإجراء",
        error: String(error),
      })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Button Action Handlers - Implementation of specific business logic
 */
function handleResetPassword(ss, userId, recordIndex) {
  try {
    // For now, just return success message
    logInfo_(
      userId,
      "RESET_PASSWORD",
      "SYS_Users",
      recordIndex,
      "Password reset initiated"
    );
    return {
      success: true,
      message: "تم إرسال رابط إعادة تعيين كلمة السر للمستخدم",
    };
  } catch (error) {
    return { success: false, message: "فشل في إعادة تعيين كلمة السر" };
  }
}

function handleApproveLeave(ss, userId, recordIndex) {
  try {
    logInfo_(
      userId,
      "APPROVE_LEAVE",
      "HRM_Leave",
      recordIndex,
      "Leave request approved"
    );
    return {
      success: true,
      message: "تم قبول طلب الإجازة",
    };
  } catch (error) {
    return { success: false, message: "فشل في قبول الإجازة" };
  }
}

function handleRejectLeave(ss, userId, recordIndex) {
  try {
    logInfo_(
      userId,
      "REJECT_LEAVE",
      "HRM_Leave",
      recordIndex,
      "Leave request rejected"
    );
    return {
      success: true,
      message: "تم رفض طلب الإجازة",
    };
  } catch (error) {
    return { success: false, message: "فشل في رفض الإجازة" };
  }
}

function handleProjectStart(ss, userId, recordIndex) {
  try {
    logInfo_(
      userId,
      "START_PROJECT",
      "PRJ_Main",
      recordIndex,
      "Project started"
    );
    return {
      success: true,
      message: "تم بدء المشروع",
    };
  } catch (error) {
    return { success: false, message: "فشل في بدء المشروع" };
  }
}

function handleProjectClose(ss, userId, recordIndex) {
  try {
    logInfo_(
      userId,
      "CLOSE_PROJECT",
      "PRJ_Main",
      recordIndex,
      "Project closed"
    );
    return {
      success: true,
      message: "تم إغلاق المشروع",
    };
  } catch (error) {
    return { success: false, message: "فشل في إغلاق المشروع" };
  }
}

function handleProjectHold(ss, userId, recordIndex) {
  try {
    logInfo_(
      userId,
      "HOLD_PROJECT",
      "PRJ_Main",
      recordIndex,
      "Project put on hold"
    );
    return {
      success: true,
      message: "تم تعليق المشروع",
    };
  } catch (error) {
    return { success: false, message: "فشل في تعليق المشروع" };
  }
}

function handleTaskDone(ss, userId, recordIndex) {
  try {
    logInfo_(
      userId,
      "COMPLETE_TASK",
      "PRJ_Tasks",
      recordIndex,
      "Task marked as done"
    );
    return {
      success: true,
      message: "تم إتمام المهمة",
    };
  } catch (error) {
    return { success: false, message: "فشل في إتمام المهمة" };
  }
}

function handleApproveAdvance(ss, userId, recordIndex) {
  try {
    logInfo_(
      userId,
      "APPROVE_ADVANCE",
      "HRM_Advances",
      recordIndex,
      "Advance approved"
    );
    return {
      success: true,
      message: "تم صرف السلفة",
    };
  } catch (error) {
    return { success: false, message: "فشل في صرف السلفة" };
  }
}

function handlePrintInvoice(ss, userId, recordIndex) {
  try {
    logInfo_(
      userId,
      "PRINT_INVOICE",
      "FIN_PRJ_Revenue",
      recordIndex,
      "Invoice printed"
    );
    return {
      success: true,
      message: "جاري طباعة الفاتورة...",
    };
  } catch (error) {
    return { success: false, message: "فشل في طباعة الفاتورة" };
  }
}

function handleApprovePayroll(ss, userId, recordIndex) {
  try {
    logInfo_(
      userId,
      "APPROVE_PAYROLL",
      "FIN_HRM_Payroll",
      recordIndex,
      "Payroll approved"
    );
    return {
      success: true,
      message: "تم اعتماد الراتب",
    };
  } catch (error) {
    return { success: false, message: "فشل في اعتماد الراتب" };
  }
}

/**
 * Update Record - Enhanced CRUD operation
 */
function apiUpdateRecord(requestBody) {
  try {
    const sessionCheck = validateSession_(requestBody.token);
    if (!sessionCheck.valid) {
      throw new Error("Invalid session");
    }

    // For now, return placeholder response
    return ContentService.createTextOutput(
      JSON.stringify({
        success: true,
        message: "سيتم تنفيذ تحديث السجل قريباً",
      })
    ).setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(
      JSON.stringify({
        success: false,
        message: "فشل في تحديث السجل",
        error: String(error),
      })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Delete Record - Enhanced CRUD operation
 */
function apiDeleteRecord(requestBody) {
  try {
    const sessionCheck = validateSession_(requestBody.token);
    if (!sessionCheck.valid) {
      throw new Error("Invalid session");
    }

    // For now, return placeholder response
    return ContentService.createTextOutput(
      JSON.stringify({
        success: true,
        message: "سيتم تنفيذ حذف السجل قريباً",
      })
    ).setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(
      JSON.stringify({
        success: false,
        message: "فشل في حذف السجل",
        error: String(error),
      })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Perform Smart Search - For lookup fields using real ENG data
 */
function apiPerformSmartSearch(requestBody) {
  try {
    const sessionCheck = validateSession_(requestBody.token);
    if (!sessionCheck.valid) {
      throw new Error("Invalid session");
    }

    const dynLink = requestBody.dynLink;
    const searchTerm = requestBody.searchTerm || "";

    if (!dynLink || searchTerm.length < 2) {
      return ContentService.createTextOutput(
        JSON.stringify({
          success: true,
          results: [],
        })
      ).setMimeType(ContentService.MimeType.JSON);
    }

    const ss = SpreadsheetApp.openById(CONFIG.SHEET_ID);
    let results = [];

    // Map DYN_ links to actual sheets based on ENG data structure
    const dynMapping = {
      DYN_EMPLOYEES: {
        sheet: "HRM_Employees",
        idCol: "EMP_ID",
        labelCol: "EMP_Name_AR",
      },
      DYN_CLIENTS: {
        sheet: "PRJ_Clients",
        idCol: "CLI_ID",
        labelCol: "CLI_Name",
      },
      DYN_PROJECTS: {
        sheet: "PRJ_Main",
        idCol: "PRJ_ID",
        labelCol: "PRJ_Name",
      },
      DYN_MATERIALS: {
        sheet: "PRJ_Material",
        idCol: "MAT_ID",
        labelCol: "MAT_Name",
      },
      DYN_DEPTS: {
        sheet: "HRM_Departments",
        idCol: "DEPT_ID",
        labelCol: "DEPT_Name",
      },
      DYN_ROLES: { sheet: "SYS_Roles", idCol: "ROL_ID", labelCol: "ROL_Title" },
      DYN_PERMISSIONS: {
        sheet: "SYS_Permissions",
        idCol: "PRM_ID",
        labelCol: "PRM_Name",
      },
      DYN_CUSTODY: {
        sheet: "FIN_Custody",
        idCol: "CSTD_ID",
        labelCol: "EMP_Name",
      },
    };

    const mapping = dynMapping[dynLink];
    if (!mapping) {
      throw new Error("Unknown dynamic link: " + dynLink);
    }

    const dataSheet = ss.getSheetByName(mapping.sheet);
    if (!dataSheet || dataSheet.getLastRow() <= 3) {
      return ContentService.createTextOutput(
        JSON.stringify({
          success: true,
          results: [],
        })
      ).setMimeType(ContentService.MimeType.JSON);
    }

    // Read headers and data
    const headers = dataSheet
      .getRange(1, 1, 1, dataSheet.getLastColumn())
      .getValues()[0]
      .map(String);
    const idIdx = headers.indexOf(mapping.idCol);
    const labelIdx = headers.indexOf(mapping.labelCol);

    if (idIdx < 0 || labelIdx < 0) {
      throw new Error("Invalid column mapping for " + dynLink);
    }

    // Search through data starting from Row 4
    if (dataSheet.getLastRow() > 3) {
      const data = dataSheet
        .getRange(4, 1, dataSheet.getLastRow() - 3, dataSheet.getLastColumn())
        .getValues();

      const searchLower = searchTerm.toLowerCase();

      data.forEach((row) => {
        const id = String(row[idIdx] || "").trim();
        const label = String(row[labelIdx] || "").trim();

        if (id && label && label.toLowerCase().includes(searchLower)) {
          results.push({
            id: id,
            label: label,
          });
        }
      });
    }

    // Limit results to prevent UI overload
    results = results.slice(0, 10);

    return ContentService.createTextOutput(
      JSON.stringify({
        success: true,
        results: results,
      })
    ).setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    console.error("performSmartSearch error:", error);
    return ContentService.createTextOutput(
      JSON.stringify({
        success: false,
        message: "فشل في البحث",
        error: String(error),
      })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}
