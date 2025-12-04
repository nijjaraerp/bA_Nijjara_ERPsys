/**
 * ================================================================================
 * NIJJARA ERP - Code.js (Backend API Layer)
 * ================================================================================
 * Reference: SYSTEM ARCHITECTURE & TECHNICAL SPE.md
 *
 * This file implements the stateless API backend for the Nijjara ERP system.
 * All functions follow the metadata-driven architecture where:
 * - ENG_Views: Defines list view configurations
 * - ENG_Forms: Defines form field schemas
 * - ENG_Dropdowns: Provides dropdown options
 * - ENG_Buttons: Defines action buttons
 *
 * The "Row 2 Rule" (Section 4.0): Only columns with both Row 1 (English) AND
 * Row 2 (Arabic) headers are exposed to the frontend.
 * ================================================================================
 */

// ================================================================================
// 1.0 ENTRY POINT & HTML SERVICE
// Reference: Section 1.0 - SPA Architecture
// ================================================================================

function doGet(e) {
  var t = HtmlService.createTemplateFromFile("Dashboard");
  var html = t
    .evaluate()
    .setTitle("Nijjara ERP")
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  return html;
}

// ================================================================================
// 2.0 SESSION & AUTHENTICATION MANAGEMENT
// Reference: Section 7.1 - The Login Handshake
// ================================================================================

/**
 * Validates a session token against SYS_Sessions
 * @param {string} token - The authentication token to validate
 * @returns {Object} Validation result with userId and email if valid
 */
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

/**
 * Generates a cryptographic salt for password hashing
 */
function generateSalt_() {
  return Utilities.getUuid();
}

/**
 * Hashes a password with a salt using SHA-256
 */
function hashPasswordWithSalt_(password, salt) {
  return hashSha256Hex_(salt + ":" + password);
}

/**
 * SHA-256 hash helper
 */
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
 * Authenticates a user and creates a session
 * Reference: Section 7.1 - The Login Handshake
 */
function login(username, password) {
  try {
    var ss = SpreadsheetApp.openById(CONFIG.SHEET_ID);
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
        found = { USR_ID: r[idIdx], USR_Name: uname, EMP_Email: r[emailIdx] };
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

/**
 * Logs out a user by revoking their session
 */
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

function ensureUserPassword(username, password) {
  try {
    var ss = SpreadsheetApp.openById(CONFIG.SHEET_ID);
    var sheet = ss.getSheetByName("SYS_Users");
    if (!sheet) return { success: false };
    var headers = sheet
      .getRange(1, 1, 1, sheet.getLastColumn())
      .getValues()[0]
      .map(function (v) {
        return String(v).trim();
      });
    var nameIdx = headers.indexOf("USR_Name");
    var passIdx = headers.indexOf("Password_Hash");
    var saltIdx = headers.indexOf("Password_Salt");
    if (nameIdx < 0 || passIdx < 0 || saltIdx < 0) return { success: false };
    var rows =
      sheet.getLastRow() > 2
        ? sheet
            .getRange(3, 1, sheet.getLastRow() - 2, sheet.getLastColumn())
            .getValues()
        : [];
    var foundRow = -1;
    for (var i = 0; i < rows.length; i++) {
      var uname = String(rows[i][nameIdx]).trim().toLowerCase();
      if (uname === String(username).trim().toLowerCase()) {
        foundRow = i + 3;
        break;
      }
    }
    if (foundRow < 0) return { success: false };
    var salt = generateSalt_();
    var hash = hashPasswordWithSalt_(password, salt);
    sheet.getRange(foundRow, saltIdx + 1).setValue(salt);
    sheet.getRange(foundRow, passIdx + 1).setValue(hash);
    return { success: true };
  } catch (e) {
    return { success: false };
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

// ================================================================================
// 3.0 DEBUGGING & LOGGING
// Reference: Section 10.0 - Debugging & Logging Strategy
// ================================================================================

/**
 * Appends a row to a debug log sheet
 * Reference: Section 10.0 - Required Backend Implementation
 */
function appendDebugRow(sheetName, dataObj) {
  try {
    var ss = SpreadsheetApp.openById(CONFIG.SHEET_ID);
    var sheet = ss.getSheetByName(sheetName);
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
    dataObj["Time_Stamp"] = new Date();
    insertRowByHeaders_(sheet, headers, dataObj);
  } catch (e) {}
}

/**
 * Info level logging - "What happened?" (Success traces)
 * Reference: Section 10.1 - DBUG_AppLog
 */
function logInfo_(actor, action, entity, id, details) {
  appendDebugRow("DBUG_AppLog", {
    Actor: actor || "system",
    Action: action,
    Entity: entity,
    Entity_ID: id || "",
    Details: details || "",
  });
}

/**
 * Warning level logging - "What looks suspicious?"
 * Reference: Section 10.2 - DBUG_WarnLog
 */
function logWarn_(actor, action, entity, id, details) {
  appendDebugRow("DBUG_WarnLog", {
    Actor: actor || "system",
    Action: action,
    Entity: entity,
    Entity_ID: id || "",
    Details: details || "",
  });
}

/**
 * Error level logging - "Why did it crash?"
 * Reference: Section 10.3 - DBUG_ErrorLog
 */
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

// ================================================================================
// 4.0 ID GENERATION & UTILITIES
// Reference: Section 8.0 - ID Column Conventions
// ================================================================================

/**
 * Gets the module prefix from a sheet name (first 3 chars before underscore)
 */
function getModulePrefix_(sheet) {
  var name = String(sheet.getName());
  var mod = name.indexOf("_") > -1 ? name.split("_")[0] : name;
  return mod.slice(0, 3).toUpperCase();
}

/**
 * Validates structured ID format: XXX-N (e.g., HRM-1, SYS-42)
 */
function isValidStructuredId_(id) {
  return /^[A-Z]{3}-[1-9]\d*$/.test(String(id));
}

/**
 * Generates a structured ID for a column (e.g., HRM-1, HRM-2)
 */
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

/**
 * Inserts a row into a sheet using header mapping
 */
function insertRowByHeaders_(sheet, headers, obj) {
  var row = headers.map(function (h) {
    return obj[h] !== undefined ? obj[h] : "";
  });
  var targetRow = Math.max(3, sheet.getLastRow() + 1);
  sheet.getRange(targetRow, 1, 1, headers.length).setValues([row]);
}

/**
 * Gets the next numeric ID for a column
 */
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

// ================================================================================
// 5.0 VIEW ENGINE - Module Data Retrieval
// Reference: Section 7.2 - Loading a Module (The View Engine)
// Reference: Section 4.0 - Dynamic Display Logic (The "Row 2" Rule)
// ================================================================================

/**
 * Retrieves module data for a list view with pagination and filtering
 *
 * @param {string} viewId - The VIEW_ID from ENG_Views (e.g., "VIEW_HRM_EMP")
 * @param {string} token - Authentication token
 * @param {Object} options - Optional pagination and filter settings
 *   - page: Current page number (1-based)
 *   - pageSize: Number of records per page
 *   - searchTerm: Search text for filtering
 *   - sortColumn: Column index to sort by
 *   - sortDirection: 'asc' or 'desc'
 * @returns {Object} Response with headers, data, pagination info, and buttons
 */
function getModuleData(viewId, token, options) {
  // Input validation
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

    // Parse options with defaults
    options = options || {};
    var page = options.page || 1;
    var pageSize = options.pageSize || 25;
    var searchTerm = options.searchTerm || "";
    var sortColumn = options.sortColumn;
    var sortDirection = options.sortDirection || "asc";

    // 1. Find the View definition
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

    // 2. Get all data applying the "Row 2 Rule"
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

    // 3. Apply Row 3 Flags - only columns with non-empty List View flags are exposed
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

    // Find the primary ID column for row actions
    var idColumnIdx = -1;
    for (var h = 0; h < sHeaders.length; h++) {
      var sh = String(sHeaders[h]);
      var endsId = /_ID$/.test(sh) || /_id$/.test(sh);
      if (endsId && sh.indexOf("_") === sh.lastIndexOf("_")) {
        idColumnIdx = h;
        break;
      }
    }

    // 4. Extract and filter data rows
    var allRows = [];
    if (sData.length > 3) {
      for (var r = 3; r < sData.length; r++) {
        var row = {
          _rowIndex: r + 1, // 1-based sheet row number
          _id: idColumnIdx >= 0 ? sData[r][idColumnIdx] : null,
          cells: [],
        };

        for (var k = 0; k < colIndices.length; k++) {
          row.cells.push(sData[r][colIndices[k]]);
        }

        // Removed problematic 'show' filter that was causing data loss
        // This filter was incorrectly skipping legitimate data containing the word 'show'

        // Apply search filter
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

    // 5. Sort if requested
    if (
      sortColumn !== undefined &&
      sortColumn >= 0 &&
      sortColumn < outHeaders.length
    ) {
      allRows.sort(function (a, b) {
        var valA = a.cells[sortColumn];
        var valB = b.cells[sortColumn];

        // Handle numeric sorting
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

    // 6. Calculate pagination
    var totalRecords = allRows.length;
    var totalPages = Math.ceil(totalRecords / pageSize);
    var startIdx = (page - 1) * pageSize;
    var endIdx = Math.min(startIdx + pageSize, totalRecords);
    var paginatedRows = allRows.slice(startIdx, endIdx);

    // 7. Get action buttons for this view
    var buttons = getViewButtons_(ss, viewId, auth.userId);

    // 8. Format output data
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
    
    // Debug log the response structure
    Logger.log("getModuleData response: " + JSON.stringify(response));
    return response;
  } catch (e) {
    var errorMsg = "";
    try {
      errorMsg = e && e.message ? e.message : String(e);
    } catch (stringifyErr) {
      errorMsg = "خطأ غير معروف في الخادم";
    }

    // Safe logging - auth might not be defined if error occurred early
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
    } catch (logErr) {
      // Logging failed, continue anyway
    }

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
    Logger.log("debugGetModuleData returning: " + JSON.stringify({ success: true, res: res }));
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

/**
 * Gets action buttons defined for a view
 * Reference: Section 9.3 - ENG_Buttons
 */
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
      // Check if button is associated with this view (if VIEW_ID column exists)
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

    // If no specific buttons found, return default CRUD buttons
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

/**
 * Gets a single record by ID with all fields (including system fields)
 * Used for View and Edit operations
 *
 * @param {string} tableName - The sheet name (e.g., "HRM_Employees")
 * @param {string} recordId - The record's primary ID
 * @param {string} token - Authentication token
 * @returns {Object} The record data with English field names
 */
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

    var headers = data[0].map(String); // Row 1: English
    var arHeaders = data[1].map(String); // Row 2: Arabic

    // Find primary ID column
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

    // Search for the record
    for (var r = 2; r < data.length; r++) {
      if (String(data[r][idColIdx]).trim() === String(recordId).trim()) {
        var record = {
          _rowIndex: r + 1,
          _id: recordId,
        };

        // Build field map with both English key and Arabic label
        for (var c = 0; c < headers.length; c++) {
          record[headers[c]] = data[r][c];
        }

        // Also build a display-friendly version
        var displayRecord = [];
        for (var c = 0; c < headers.length; c++) {
          if (arHeaders[c] && arHeaders[c].trim() !== "") {
            displayRecord.push({
              key: headers[c],
              label: arHeaders[c],
              value: data[r][c],
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

// ================================================================================
// 6.0 FORM ENGINE - Dynamic Form Generation
// Reference: Section 7.3 - Data Entry (The Form Engine)
// Reference: Section 9.1 - ENG_Forms
// ================================================================================

/**
 * Gets the complete form definition for a form ID
 * Builds the form schema from ENG_Forms, resolves dropdowns from ENG_Dropdowns
 *
 * @param {string} formId - The FORM_ID from ENG_Forms
 * @param {string} mode - 'add', 'edit', or 'view'
 * @param {Object} existingData - Existing record data for edit/view modes
 * @returns {Object} Complete form schema with fields, validation rules, and options
 */
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

/**
 * Gets dropdown options from ENG_Dropdowns
 * Reference: Section 9.4 - ENG_Dropdowns
 */
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

    // Sort by DD_Sort_Order
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
    // DD_ID is a table name, get options from that table
    options = getDropdownOptionsFromTable_(ss, ddId);
  }

  return options;
}

/**
 * Gets dropdown options from a data table
 * Uses smart detection to find ID and Name columns
 */
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

  // Smart detection of ID and Name columns
  var idIdx = -1,
    nameIdx = -1,
    actIdx = -1;

  for (var i = 0; i < h.length; i++) {
    if (/_ID$/.test(h[i]) && idIdx === -1) idIdx = i;
    if (/_Name(_AR|_EN)?$/.test(h[i]) && nameIdx === -1) nameIdx = i;
    if (/_Is_Active$/.test(h[i])) actIdx = i;
  }

  // Fallbacks
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

// ================================================================================
// 7.0 CRUD OPERATIONS - Create, Read, Update, Delete
// Reference: Section 7.3 - Data Entry (The Form Engine)
// ================================================================================

/**
 * Saves a new record using the form engine mapping
 *
 * @param {string} formId - The FORM_ID that defines field-to-column mapping
 * @param {Object} payload - The form data keyed by Field_ID
 * @param {string} token - Authentication token
 * @returns {Object} Result with success status and new record ID
 */
function saveEngineRecord(formId, payload, token) {
  var auth = validateSession_(token);
  if (!auth.valid)
    return { success: false, code: "AUTH_REQUIRED", message: auth.error };

  try {
    var ss = SpreadsheetApp.openById(CONFIG.SHEET_ID);

    // 1. Get Form Definition to map fields
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

    // 3. Prepare Target Sheet
    var tSheet = ss.getSheetByName(targetSheetName);
    if (!tSheet) return { success: false, message: "Target Sheet Not Found" };

    var tHeaders = tSheet
      .getRange(1, 1, 1, tSheet.getLastColumn())
      .getValues()[0]
      .map(String);
    var rowData = {};

    // 4. Handle ID Generation (Structured ID)
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

    // 5. Map form data to target columns with type conversion
    for (var m = 0; m < mappings.length; m++) {
      var value = payload[mappings[m].targetCol];
      if (mappings[m].fieldType === "NUMBER" && value) value = Number(value);
      else if (mappings[m].fieldType === "DATE" && value)
        value = new Date(value);
      else if (mappings[m].fieldType === "BOOLEAN")
        value = String(value).toLowerCase() === "true";
      rowData[mappings[m].targetCol] = value;
    }

    // 6. Add Metadata (Created By/At)
    for (var x = 0; x < tHeaders.length; x++) {
      if (tHeaders[x].endsWith("_Crt_At")) {
        rowData[tHeaders[x]] = new Date();
      }
      if (tHeaders[x].endsWith("_Crt_By")) {
        rowData[tHeaders[x]] = auth.userId || "system";
      }
    }

    // 7. Insert the row
    insertRowByHeaders_(tSheet, tHeaders, rowData);

    logInfo_(
      auth.userId,
      "CREATE_RECORD",
      targetSheetName,
      newId,
      "Created successfully"
    );

    // 8. Log to SYS_Audit_Log if it exists
    logAuditEntry_(
      ss,
      auth.userId,
      "CREATE",
      targetSheetName,
      newId,
      "New record created"
    );

    return {
      success: true,
      message: "تم الحفظ بنجاح",
      recordId: newId,
    };
  } catch (e) {
    logError_(auth.userId, "SAVE_RECORD", "ENG_Forms", formId, "Exception", e);
    return { success: false, message: String(e) };
  }
}

/**
 * Updates an existing record using the form engine mapping
 *
 * @param {string} formId - The FORM_ID that defines field-to-column mapping
 * @param {Object} payload - The form data keyed by Field_ID, must include _id
 * @param {string} token - Authentication token
 * @returns {Object} Result with success status
 */
function updateEngineRecord(formId, payload, token) {
  var auth = validateSession_(token);
  if (!auth.valid)
    return { success: false, code: "AUTH_REQUIRED", message: auth.error };

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

        // Only include fields that can be edited
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

    // Validate mandatory fields
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
    for (var h = 0; h < tHeaders.length; h++) {
      var sh = String(tHeaders[h]);
      if (
        (/_ID$/.test(sh) || /_id$/.test(sh)) &&
        sh.indexOf("_") === sh.lastIndexOf("_")
      ) {
        idHeaderIndex = h;
        break;
      }
    }

    var targetId = payload && payload._id ? String(payload._id).trim() : "";
    if (idHeaderIndex < 0 || !targetId)
      return { success: false, message: "Missing record id" };

    // Find and update the row
    var lastRow = tSheet.getLastRow();
    for (var r = 3; r <= lastRow; r++) {
      var cellVal = String(
        tSheet.getRange(r, idHeaderIndex + 1).getValue()
      ).trim();
      if (cellVal === targetId) {
        var changes = [];
        for (var m = 0; m < mappings.length; m++) {
          if (
            mappings[m].state === "LOCKED_ON_EDIT" ||
            mappings[m].state === "READ_ONLY"
          )
            continue;
          var colIdx = tHeaders.indexOf(mappings[m].targetCol);
          if (colIdx > -1) {
            var oldValue = tSheet.getRange(r, colIdx + 1).getValue();
            var newValue = payload[mappings[m].targetCol];
            if (String(oldValue) !== String(newValue))
              changes.push(
                mappings[m].targetCol + ": " + oldValue + " → " + newValue
              );
            tSheet.getRange(r, colIdx + 1).setValue(newValue || "");
          }
        }

        // Update metadata columns
        for (var x = 0; x < tHeaders.length; x++) {
          var th = String(tHeaders[x]);
          if (/_Upd_At$/.test(th))
            tSheet.getRange(r, x + 1).setValue(new Date());
          if (/_Upd_By$/.test(th))
            tSheet.getRange(r, x + 1).setValue(auth.userId || "system");
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

/**
 * Deletes a record from a table
 *
 * @param {string} tableName - The sheet name
 * @param {string} id - The record ID to delete
 * @param {string} token - Authentication token
 * @returns {Object} Result with success status
 */
function deleteEngineRecord(tableName, id, token) {
  var auth = validateSession_(token);
  if (!auth.valid)
    return { success: false, code: "AUTH_REQUIRED", message: auth.error };

  try {
    var ss = SpreadsheetApp.openById(CONFIG.SHEET_ID);
    var sheet = ss.getSheetByName(tableName);
    if (!sheet) return { success: false, message: "Target Sheet Not Found" };

    var h = sheet
      .getRange(1, 1, 1, sheet.getLastColumn())
      .getValues()[0]
      .map(String);

    // Find primary ID column
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

/**
 * Logs an entry to SYS_Audit_Log for business compliance
 * Reference: Section 8.2 - SYS_Audit_Log
 */
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
  } catch (e) {
    // Silent fail - audit logging should not break main operations
  }
}

// ================================================================================
// 8.0 HRM-SPECIFIC FUNCTIONS
// Reference: Section 8.2 - HRM Module Schema
// ================================================================================

/**
 * Gets all employees for HRM module with summary statistics
 * This is a convenience function that wraps getModuleData with HRM-specific logic
 */
function getHRMEmployees(token, options) {
  return getModuleData("VIEW_HRM_Employees", token, options);
}

/**
 * Gets a single employee by ID with full details
 */
function getEmployeeById(empId, token) {
  return getRecordById("HRM_Employees", empId, token);
}

/**
 * Gets employee form definition for add/edit operations
 */
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

/**
 * Gets department list for dropdown
 */
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

/**
 * Gets all dropdown options needed for employee form
 */
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

function getHRMEmployeesHeaders(token) {
  var auth = validateSession_(token);
  if (!auth.valid)
    return { success: false, message: auth.error, code: "AUTH_REQUIRED" };
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
      visible.push({
        index: i,
        en: en[i],
        ar: arLabel,
        visible: arLabel !== "",
      });
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
      visibleArabicHeaders: visible
        .filter(function (v) {
          return v.visible;
        })
        .map(function (v) {
          return v.ar;
        }),
      visibleEnglishHeaders: visible
        .filter(function (v) {
          return v.visible;
        })
        .map(function (v) {
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

function updateHRMFormTabLabels() {
  try {
    var ss = SpreadsheetApp.openById(CONFIG.SHEET_ID);
    var sheet = ss.getSheetByName("ENG_Forms");
    if (!sheet) return { success: false, message: "ENG_Forms sheet not found" };

    var data = sheet.getDataRange().getValues();
    var h = data[0].map(String);
    var idIdx = h.indexOf("FORM_ID");
    var tabIdx = h.indexOf("Tab_Name");
    if (tabIdx < 0) tabIdx = h.indexOf("TAB_Section");
    if (idIdx < 0 || tabIdx < 0)
      return { success: false, message: "Invalid ENG_Forms headers" };

    var map = {
      "Basic Info": "المعلومات الأساسية",
      Contact: "بيانات الاتصال",
      "Job Info": "معلومات الوظيفة",
      Financial: "البيانات المالية",
    };
    var updates = 0;
    for (var i = 1; i < data.length; i++) {
      if (String(data[i][idIdx]).trim() === "FORM_HRM_AddEmployee") {
        var cur = String(data[i][tabIdx]).trim();
        var ar = map[cur];
        if (ar && cur !== ar) {
          sheet.getRange(i + 1, tabIdx + 1).setValue(ar);
          updates++;
        }
      }
    }
    return { success: true, updated: updates };
  } catch (e) {
    return { success: false, message: String(e) };
  }
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

// ================================================================================
// 9.0 SYSTEM UTILITIES
// ================================================================================

/**
 * Migrates old numeric IDs to structured format
 */
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

function validateEngineConfiguration() {
  try {
    var ss = SpreadsheetApp.openById(CONFIG.SHEET_ID);
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

/**
 * Seeds initial system data (triggered on first load)
 */
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
    // Ensure critical data sheets exist so views have sources
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

// ================================================================================
// END OF Code.js
// ================================================================================
