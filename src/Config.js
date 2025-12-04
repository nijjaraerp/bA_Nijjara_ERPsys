const CONFIG = {
  get SHEET_ID() {
    var id = PropertiesService.getScriptProperties().getProperty("SHEET_ID");
    if (!id) {
      throw new Error(
        "SHEET_ID is not configured in Script Properties. Please set it via setupScriptProperties with the correct sheet ID."
      );
    }
    return id;
  },
};

function setupScriptProperties(sheetId) {
  if (!sheetId) {
    throw new Error(
      "setupScriptProperties requires an explicit sheetId. No hardcoded defaults are allowed."
    );
  }
  PropertiesService.getScriptProperties().setProperty("SHEET_ID", sheetId);
}
