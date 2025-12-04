/**
 * ================================================================================
 * NIJJARA ERP - Code.js (Backend API Layer)
 * ================================================================================
 */

function doGet(e) {
  var t = HtmlService.createTemplateFromFile("Dashboard");
  var html = t
    .evaluate()
    .setTitle("Nijjara ERP")
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  return html;
}

function getSpreadsheet_(actor, action, entity) {
  var sheetId;
  try {
    sheetId = CONFIG.SHEET_ID;
  } catch (configErr) {
    try {
      Logger.log("CONFIG.SHEET_ID missing: " + configErr);
    } catch (logErr) {}
    throw configErr;
  }
  try {
    return SpreadsheetApp.openById(sheetId);
  } catch (sheetErr) {
    try {
      logError_(
        actor || "system",
        action || "OPEN_SPREADSHEET",
        entity || "CONFIG",
        sheetId || "",
        "فشل فتح قاعدة البيانات",
        sheetErr
      );
    } catch (logErr2) {
      try {
        Logger.log("logError_ failed while opening sheet: " + logErr2);
      } catch (_) {}
    }
    throw sheetErr;
  }
}

function validateSession_(token) {
  try {
    if (!token) return { valid: false, error: "Missing token" };
    var ss = getSpreadsheet_("system", "AUTH_CHECK", "SYS_Sessions");
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
    try {
      logError_("system", "AUTH_CHECK", "SYS_Sessions", token, "Auth check failed", e);
    } catch (_) {}
    return { valid: false, error: "Auth check failed" };
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

function getUserRoleId_(ss, userId) {
  try {
    var userSheet = ss.getSheetByName("SYS_Users");
    if (!userSheet) return "";
    var data = userSheet.getDataRange().getValues();
    if (data.length < 2) return "";
    var h = data[0].map(String);
    var idIdx = h.indexOf("USR_ID");
    var roleIdx = h.indexOf("ROL_ID");
    if (idIdx < 0 || roleIdx < 0) return "";
    for (var i = 1; i < data.length; i++) {
      if (String(data[i][idIdx]).trim() === String(userId).trim()) {
        return String(data[i][roleIdx]).trim();
      }
    }
    return "";
  } catch (e) {
    try {
      logError_(userId || "unknown", "LOAD_ROLE", "SYS_Users", userId, "تعذر جلب الدور", e);
    } catch (_) {}
    return "";
  }
}

function getRolePermissionMap_(ss, roleId) {
  var map = { views: {}, forms: {}, buttons: {}, dropdowns: {} };
  if (!roleId) return map;
  try {
    var roleSheet = ss.getSheetByName("SYS_Role_Permissions");
    if (!roleSheet) return map;
    var data = roleSheet.getDataRange().getValues();
    if (data.length < 2) return map;
    var h = data[0].map(String);
    var roleIdx = h.indexOf("ROL_ID");
    var permIdx = h.indexOf("PRM_ID");
    var scopeIdx = h.indexOf("SRP_Scope");
    var allowIdx = h.indexOf("SRP_Is_Allowed");
    for (var i = 1; i < data.length; i++) {
      if (String(data[i][roleIdx]).trim() !== String(roleId).trim()) continue;
      var allowed = allowIdx >= 0 ? String(data[i][allowIdx]).toUpperCase() !== "FALSE" : true;
      if (!allowed) continue;
      var scope = scopeIdx >= 0 ? String(data[i][scopeIdx]).toUpperCase() : "";
      var permId = permIdx >= 0 ? String(data[i][permIdx]).trim() : "";
      if (!permId) continue;
      if (scope === "VIEW") map.views[permId] = true;
      else if (scope === "FORM") map.forms[permId] = true;
      else if (scope === "BUTTON") map.buttons[permId] = true;
      else if (scope === "DROPDOWN") map.dropdowns[permId] = true;
    }
    return map;
  } catch (e) {
    try {
      logError_(roleId || "unknown", "LOAD_PERMISSIONS", "SYS_Role_Permissions", roleId, "تعذر تحميل صلاحيات الدور", e);
    } catch (_) {}
    return map;
  }
}

function isPermitted_(permMap, scope, id) {
  if (!id) return false;
  var bucket = permMap[scope] || {};
  return !!bucket[id];
}

function buildAuthContext_(token, action) {
  var base = validateSession_(token);
  if (!base.valid) return { valid: false, error: base.error };
  var ss = getSpreadsheet_(base.userId || "system", action || "CTX", "SYS_Sessions");
  var roleId = getUserRoleId_(ss, base.userId);
  var permissions = getRolePermissionMap_(ss, roleId);
  return {
    valid: true,
    userId: base.userId,
    email: base.email,
    ss: ss,
    roleId: roleId,
    permissions: permissions,
  };
}

function login(username, password) {
  try {
    var ss = getSpreadsheet_(username || "system", "LOGIN", "SYS_Users");
    var sheet = ss.getSheetByName("SYS_Users");
    if (!sheet) return { success: false };
    var headers = sheet
      .getRange(1, 1, 1, sheet.getLastColumn())
      .getValues()[0]
      .map(function (v) {
        return String(v).trim();
      });
    var nameIdx = headers.indexOf("USR_Name");
    var idIdx = headers.indexOf("USR_ID");
    var roleIdx = headers.indexOf("ROL_ID");
    var emailIdx = headers.indexOf("EMP_Email");
    var passIdx = headers.indexOf("Password_Hash");
    var saltIdx = headers.indexOf("Password_Salt");
    if (nameIdx < 0 || passIdx < 0) return { success: false };
    var rows =
      sheet.getLastRow() > 2
        ? sheet
            .getRange(3, 1, sheet.getLastRow() - 2, sheet.getLastColumn())
            .getValues()
        : [];
    var inputHashUnsalted = hashSha256Hex_(password);
    var found = null;
    for (var i = 0; i < rows.length; i++) {
      var r = rows[i];
      var uname = String(r[nameIdx]).trim();
      var phash = String(r[passIdx]).trim();
      var match = false;
      if (saltIdx >= 0) {
        var salt = String(r[saltIdx]).trim();
        var inputHashSalted = hashPasswordWithSalt_(password, salt);
        match = phash === inputHashSalted;
      } else {
        match = phash === inputHashUnsalted;
      }
      if (uname.toLowerCase() === String(username).toLowerCase() && match) {
        found = {
          USR_ID: r[idIdx],
          USR_Name: uname,
          EMP_Email: r[emailIdx],
          ROL_ID: roleIdx >= 0 ? r[roleIdx] : "",
        };
        break;
      }
    }
    if (!found) return { success: false };
    var token = Utilities.getUuid();
    var sess = ss.getSheetByName("SYS_Sessions");
    if (!sess) return { success: false };
    var sHeaders = sess
      .getRange(1, 1, 1, sess.getLastColumn())
      .getValues()[0]
      .map(function (v) {
        return String(v).trim();
      });
    var sIdIdx = sHeaders.indexOf("SESS_ID");
    var targetRow = Math.max(3, sess.getLastRow() + 1);
    var now = new Date();
    var rowObj = {};
    var sessId = generateStructuredIdForColumn_(sess, sIdIdx);
    if (!isValidStructuredId_(sessId)) return { success: false };
    rowObj["SESS_ID"] = sessId;
    rowObj["USR_ID"] = found.USR_ID;
    rowObj["EMP_Email"] = found.EMP_Email;
    rowObj["Actor_USR_ID"] = found.USR_ID;
    rowObj["SESS_Type"] = "WEB";
    rowObj["SESS_Status"] = "ACTIVE";
    rowObj["IP_Address"] = "";
    rowObj["Auth_Token"] = token;
    rowObj["SESS_Start_At"] = now;
    rowObj["SESS_Crt_At"] = now;
    rowObj["SESS_Crt_By"] = "system";
    insertRowByHeaders_(sess, sHeaders, rowObj);
    logInfo_(found.USR_ID, "LOGIN", "SYS_Sessions", sessId, "Login success");
    return { success: true, token: token, user: found };
  } catch (e) {
    logError_(username, "LOGIN", "SYS_Sessions", "", "Login failure", e);
    return { success: false };
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

function appendDebugRow(sheetName, dataObj) {
  try {
    var ss = getSpreadsheet_(dataObj.Actor || "system", "DBUG", sheetName);
    var primary = ss.getSheetByName("DBUG") || ss.getSheetByName(sheetName);
    var sheet = primary || ss.getSheetByName("DBUG_AppLog");
    if (!sheet)
      throw new Error("DBUG sheets are missing: DBUG, " + sheetName + " or DBUG_AppLog");
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
    return { success: true, sheet: sheetName };
  } catch (e) {
    try {
      Logger.log("appendDebugRow failure for " + sheetName + ": " + e);
    } catch (_) {}
    return { success: false, error: e };
  }
}

function logInfo_(actor, action, entity, id, details) {
  var res = appendDebugRow("DBUG_AppLog", {
    Actor: actor || "system",
    Action: action,
    Entity: entity,
    Entity_ID: id || "",
    Details: details || "",
  });
  if (!res || res.success === false) {
    try {
      Logger.log(
        "logInfo_ fallback => " +
          JSON.stringify({ actor: actor, action: action, entity: entity, id: id, details: details })
      );
    } catch (_) {}
  }
}

function logWarn_(actor, action, entity, id, details) {
  var res = appendDebugRow("DBUG_WarnLog", {
    Actor: actor || "system",
    Action: action,
    Entity: entity,
    Entity_ID: id || "",
    Details: details || "",
  });
  if (!res || res.success === false) {
    try {
      Logger.log(
        "logWarn_ fallback => " +
          JSON.stringify({ actor: actor, action: action, entity: entity, id: id, details: details })
      );
    } catch (_) {}
  }
}

function logError_(actor, action, entity, id, message, errorObject) {
  var res = appendDebugRow("DBUG_ErrorLog", {
    Actor: actor || "system",
    Action: action,
    Entity: entity,
    Entity_ID: id || "",
    Message:
      (message || "") + (errorObject ? " :: " + String(errorObject) : ""),
  });
  if (!res || res.success === false) {
    try {
      Logger.log(
        "logError_ fallback => " +
          JSON.stringify({
            actor: actor,
            action: action,
            entity: entity,
            id: id,
            message: message,
            error: errorObject,
          })
      );
    } catch (_) {}
  }
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

  var auth = buildAuthContext_(token, "VIEW_DATA");
  if (!auth.valid) {
    return {
      success: false,
      message: auth.error || "فشل المصادقة",
      code: "AUTH_REQUIRED",
    };
  }

  if (!isPermitted_(auth.permissions, "views", viewId)) {
    logWarn_(auth.userId, "VIEW_DENIED", "ENG_Views", viewId, "المستخدم غير مصرح له بالعرض");
    return {
      success: false,
      message: "ليست لديك صلاحية لفتح هذا العرض",
      code: "FORBIDDEN_VIEW",
    };
  }

  try {
    var ss = auth.ss || getSpreadsheet_(auth.userId, "VIEW_DATA", viewId);

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
      logWarn_(
        auth.userId || "unknown",
        "VIEW_DATA",
        "ENG_Views",
        viewId,
        "View definition not found"
      );
      return {
        success: false,
        message:
          "تعريف العرض غير موجود: " +
          viewId +
          " - تأكد من وجود السجل في ENG_Views",
        code: "VIEW_NOT_FOUND",
      };
    }

    var srcSheetName = foundRow[srcSheetIdx];
    if (!srcSheetName || String(srcSheetName).trim() === "") {
      return {
        success: false,
        message: "لم يتم تحديد جدول المصدر في تعريف العرض",
      };
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
      var show = lvFlags[c] && String(lvFlags[c]).trim() !== "";
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

    var buttons = getViewButtons_(ss, viewId, auth.userId, auth.permissions);

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

function getBootstrapMetadata(token) {
  var auth = buildAuthContext_(token, "BOOTSTRAP");
  if (!auth.valid)
    return { success: false, code: "AUTH_REQUIRED", message: auth.error };
  try {
    var ss = auth.ss || getSpreadsheet_(auth.userId, "BOOTSTRAP", "ENG_Views");
    var perm = auth.permissions || { views: {}, forms: {}, buttons: {}, dropdowns: {} };
    var views = [];
    var vSheet = ss.getSheetByName("ENG_Views");
    if (vSheet) {
      var vData = vSheet.getDataRange().getValues();
      var vh = vData[0].map(String);
      var idIdx = vh.indexOf("VIEW_ID");
      var titleIdx = vh.indexOf("View_Title");
      var srcIdx = vh.indexOf("Source_Sheet");
      for (var i = 1; i < vData.length; i++) {
        var vid = vData[i][idIdx];
        if (!isPermitted_(perm, "views", vid)) continue;
        views.push({
          id: vid,
          title: vData[i][titleIdx],
          sheet: vData[i][srcIdx],
        });
      }
    }

    var forms = [];
    var fSheet = ss.getSheetByName("ENG_Forms");
    if (fSheet) {
      var fData = fSheet.getDataRange().getValues();
      var fh = fData[0].map(String);
      var idIdxF = fh.indexOf("FORM_ID");
      var tabIdx = fh.indexOf("Tab_Name");
      var targetIdx = fh.indexOf("Target_Sheet");
      for (var j = 1; j < fData.length; j++) {
        var fid = fData[j][idIdxF];
        if (!isPermitted_(perm, "forms", fid)) continue;
        forms.push({ id: fid, tab: fData[j][tabIdx], target: fData[j][targetIdx] });
      }
    }

    var buttons = [];
    var bSheet = ss.getSheetByName("ENG_Buttons");
    if (bSheet) {
      var bData = bSheet.getDataRange().getValues();
      var bh = bData[0].map(String);
      var idIdxB = bh.indexOf("BTN_ID");
      var viewIdx = bh.indexOf("VIEW_ID");
      var lblIdx = bh.indexOf("BTN_Label");
      for (var k = 1; k < bData.length; k++) {
        var bid = bData[k][idIdxB];
        if (!isPermitted_(perm, "buttons", bid)) continue;
        buttons.push({ id: bid, view: bData[k][viewIdx], label: bData[k][lblIdx] });
      }
    }

    var dropdowns = [];
    var dSheet = ss.getSheetByName("ENG_Dropdowns");
    if (dSheet) {
      var dData = dSheet.getDataRange().getValues();
      var dh = dData[0].map(String);
      var idIdxD = dh.indexOf("DD_ID");
      var enIdx = dh.indexOf("DD_EN");
      var arIdx = dh.indexOf("DD_AR");
      for (var m = 1; m < dData.length; m++) {
        var ddid = dData[m][idIdxD];
        if (!isPermitted_(perm, "dropdowns", ddid)) continue;
        dropdowns.push({ id: ddid, en: dData[m][enIdx], ar: dData[m][arIdx] });
      }
    }

    return {
      success: true,
      user: { id: auth.userId, roleId: auth.roleId, email: auth.email },
      views: views,
      forms: forms,
      buttons: buttons,
      dropdowns: dropdowns,
      permissions: perm,
    };
  } catch (e) {
    logError_(auth.userId, "BOOTSTRAP", "ENG_Metadata", "", "فشل تحميل البيانات", e);
    return { success: false, message: String(e) };
  }
}

function getViewButtons_(ss, viewId, userId, permMap) {
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
    if (permMap && Object.keys(permMap).length > 0) {
      buttons = buttons.filter(function (b) {
        return isPermitted_(permMap, "buttons", b.id);
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

function getFormDefinition(formId, mode, existingData, token) {
  try {
    var auth = buildAuthContext_(token, "FORM_DEFINITION");
    if (!auth.valid) {
      return { success: false, message: auth.error || "فشل المصادقة", code: "AUTH_REQUIRED" };
    }
    if (!isPermitted_(auth.permissions, "forms", formId)) {
      logWarn_(auth.userId, "FORM_DENIED", "ENG_Forms", formId, "المستخدم غير مصرح له بالنموذج");
      return { success: false, message: "ليست لديك صلاحية لفتح النموذج", code: "FORBIDDEN_FORM" };
    }
    var ss = auth.ss || getSpreadsheet_(auth.userId, "FORM_DEFINITION", formId);
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

function saveEngineRecord(formId, payload, token) {
  var auth = buildAuthContext_(token, "SAVE_RECORD");
  if (!auth.valid)
    return { success: false, code: "AUTH_REQUIRED", message: auth.error };
  if (!isPermitted_(auth.permissions, "forms", formId)) {
    logWarn_(auth.userId, "FORM_DENIED", "ENG_Forms", formId, "محاولة حفظ بدون صلاحية");
    return { success: false, code: "FORBIDDEN_FORM", message: "لا تملك صلاحية لحفظ هذا النموذج" };
  }
  try {
    var ss = auth.ss || getSpreadsheet_(auth.userId, "SAVE_RECORD", formId);
    var fSheet = ss.getSheetByName("ENG_Forms");
    var fData = fSheet.getDataRange().getValues();
    var fh = fData[0].map(String);
    var idIdx = fh.indexOf("FORM_ID");
    var colPtrIdx = fh.indexOf("Target_Column_ID");
    if (colPtrIdx < 0) colPtrIdx = fh.indexOf("Column_Pointer");
    var typeIdx = fh.indexOf("Field_Type");
    var targetSheetName = getFormMasterSheet_(ss, formId);
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
  var auth = buildAuthContext_(token, "UPDATE_RECORD");
  if (!auth.valid)
    return { success: false, code: "AUTH_REQUIRED", message: auth.error };
  if (!isPermitted_(auth.permissions, "forms", formId)) {
    logWarn_(auth.userId, "FORM_DENIED", "ENG_Forms", formId, "محاولة تعديل بدون صلاحية");
    return { success: false, code: "FORBIDDEN_FORM", message: "لا تملك صلاحية لتعديل هذا النموذج" };
  }
  try {
    var ss = auth.ss || getSpreadsheet_(auth.userId, "UPDATE_RECORD", formId);
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
  var auth = buildAuthContext_(token, "DELETE_RECORD");
  if (!auth.valid)
    return { success: false, code: "AUTH_REQUIRED", message: auth.error };
  var allowed = false;
  if (auth.permissions) {
    allowed = isPermitted_(auth.permissions, "forms", tableName);
    if (!allowed) {
      var setSheet = auth.ss.getSheetByName("ENG_Settings");
      if (setSheet) {
        var setData = setSheet.getDataRange().getValues();
        var sh = setData[0].map(String);
        var keyIdx = sh.indexOf("Setting_Key");
        var sheetIdx = sh.indexOf("Sheet_Name");
        for (var i = 1; i < setData.length; i++) {
          if (String(setData[i][sheetIdx]).trim() === tableName) {
            var key = String(setData[i][keyIdx]).replace("FORM_MASTER:", "");
            if (isPermitted_(auth.permissions, "forms", key)) {
              allowed = true;
              break;
            }
          }
        }
      }
    }
  }
  if (!allowed) {
    logWarn_(auth.userId, "DELETE_DENIED", tableName, id, "محاولة حذف بدون صلاحية");
    return { success: false, code: "FORBIDDEN_DELETE", message: "لا تملك صلاحية لحذف هذا السجل" };
  }
  try {
    var ss = auth.ss || getSpreadsheet_(auth.userId, "DELETE_RECORD", tableName);
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
  return getFormDefinition("FORM_HRM_AddEmployee", mode, existingData, token);
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
      seedFullEngineConfiguration();
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

function runEngineTests() {
  return validateEngineConfiguration();
}

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
