const CONFIG = {
  HARDCODED_ID: "1anq5RkM_vEIyYtMpakE69kXP2XWQkPlxdfYgvmVF3ls",
  get SHEET_ID() {
    return (
      PropertiesService.getScriptProperties().getProperty("SHEET_ID") ||
      this.HARDCODED_ID
    );
  },
};

function setupScriptProperties() {
  PropertiesService.getScriptProperties().setProperty(
    "SHEET_ID",
    CONFIG.HARDCODED_ID
  );
}
