function doGet(e) {
  var t = HtmlService.createTemplateFromFile("Dashboard");
  var html = t
    .evaluate()
    .setTitle("Nijjara ERP")
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  return html;
}
function login(username, password) {
  try {
    var ss = SpreadsheetApp.openById(
      "1anq5RkM_vEIyYtMpakE69kXP2XWQkPlxdfYgvmVF3ls"
    );
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
    if (nameIdx < 0 || passIdx < 0) return { success: false };
    var rows =
      sheet.getLastRow() > 2
        ? sheet
            .getRange(3, 1, sheet.getLastRow() - 2, sheet.getLastColumn())
            .getValues()
        : [];
    var inputHash = hashSha256Hex_(password);
    var found = null;
    for (var i = 0; i < rows.length; i++) {
      var r = rows[i];
      var uname = String(r[nameIdx]).trim();
      var phash = String(r[passIdx]).trim();
      if (
        uname.toLowerCase() === String(username).toLowerCase() &&
        phash === inputHash
      ) {
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
    rowObj["SESS_ID"] = nextIdByHeaders_(sess, sHeaders, "SESS_ID");
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
    return { success: true, token: token, user: found };
  } catch (e) {
    return { success: false };
  }
}
function logout(token) {
  try {
    var ss = SpreadsheetApp.openById(
      "1anq5RkM_vEIyYtMpakE69kXP2XWQkPlxdfYgvmVF3ls"
    );
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
        return { success: true };
      }
    }
    return { success: false };
  } catch (e) {
    return { success: false };
  }
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
