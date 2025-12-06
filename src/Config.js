/**
 * ================================================================================
 * NIJJARA ERP - ENHANCED CONFIGURATION (PROFESSIONAL SYSTEM)
 * ================================================================================
 */

const CONFIG = {
  // Google Sheet Configuration
  HARDCODED_ID: "1anq5RkM_vEIyYtMpakE69kXP2XWQkPlxdfYgvmVF3ls",
  get SHEET_ID() {
    return (
      PropertiesService.getScriptProperties().getProperty("SHEET_ID") ||
      this.HARDCODED_ID
    );
  },

  // System Configuration
  SYSTEM_NAME: "نظام نجارة ERP",
  SYSTEM_VERSION: "2.0.0",
  SYSTEM_DESCRIPTION: "نظام إدارة موارد المؤسسة المتطور",

  // Session Configuration
  SESSION_TIMEOUT: 8 * 60 * 60 * 1000, // 8 hours in milliseconds
  TOKEN_LENGTH: 32,

  // Security Configuration
  MAX_LOGIN_ATTEMPTS: 5,
  LOGIN_LOCKOUT_TIME: 30 * 60 * 1000, // 30 minutes

  // Cache Configuration
  CACHE_TTL: 5 * 60, // 5 minutes

  // Pagination Configuration
  DEFAULT_PAGE_SIZE: 25,
  MAX_PAGE_SIZE: 100,

  // File Upload Configuration
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_FILE_TYPES: [
    "application/pdf",
    "image/jpeg",
    "image/png",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ],

  // Module Configuration
  MODULES: {
    SYS: {
      name: "إدارة النظام",
      icon: "bi-gear",
      color: "#667eea",
      enabled: true,
    },
    HRM: {
      name: "الموارد البشرية",
      icon: "bi-people",
      color: "#f093fb",
      enabled: true,
    },
    PRJ: {
      name: "إدارة المشاريع",
      icon: "bi-kanban",
      color: "#4facfe",
      enabled: true,
    },
    FIN: {
      name: "الشؤون المالية",
      icon: "bi-cash-stack",
      color: "#11998e",
      enabled: true,
    },
  },

  // Default User Credentials (as per guidelines)
  DEFAULT_ADMIN: {
    username: "mkhoraiby",
    passwordHash:
      "fc95978d640e8464044cbbb8cce09307f4aaa000868980baed4b6dc239b95458",
    passwordSalt: "7d0189a5-d7d6-450e-ab1c-196160317862",
    name: "Mohamed Sherif Elkhoraiby",
    email: "melkhoraiby@gmail.com",
  },

  // Logging Configuration
  LOGGING: {
    enabled: true,
    levels: ["INFO", "WARN", "ERROR"],
    maxLogSize: 10000, // Maximum log entries per sheet
  },

  // API Configuration
  API: {
    timeout: 30000, // 30 seconds
    retryAttempts: 3,
    retryDelay: 1000, // 1 second
  },

  // UI Configuration
  UI: {
    theme: "dark",
    language: "ar",
    direction: "rtl",
    animations: true,
    soundEffects: false,
  },
};

/**
 * Setup Script Properties for Enhanced Configuration
 */
function setupScriptProperties() {
  var properties = PropertiesService.getScriptProperties();

  properties.setProperties({
    SHEET_ID: CONFIG.HARDCODED_ID,
    SYSTEM_VERSION: CONFIG.SYSTEM_VERSION,
    SETUP_COMPLETE: "true",
    LAST_SETUP: new Date().toISOString(),
  });

  console.log("✅ Script properties configured successfully");
}

/**
 * Get System Configuration
 */
function getSystemConfig() {
  return {
    name: CONFIG.SYSTEM_NAME,
    version: CONFIG.SYSTEM_VERSION,
    description: CONFIG.SYSTEM_DESCRIPTION,
    modules: Object.keys(CONFIG.MODULES).filter(
      (key) => CONFIG.MODULES[key].enabled
    ),
    sheetId: CONFIG.SHEET_ID,
    setupComplete:
      PropertiesService.getScriptProperties().getProperty("SETUP_COMPLETE") ===
      "true",
  };
}

/**
 * Validate System Configuration
 */
function validateSystemConfig() {
  try {
    var ss = SpreadsheetApp.openById(CONFIG.SHEET_ID);
    var requiredSheets = [
      "ENG_Settings",
      "ENG_Forms",
      "ENG_Views",
      "ENG_Dropdowns",
      "ENG_Buttons",
      "SYS_Users",
      "SYS_Sessions",
      "SYS_Audit_Log",
      "HRM_Employees",
      "HRM_Departments",
      "PRJ_Main",
      "PRJ_Clients",
      "PRJ_Tasks",
      "FIN_DirectExpenses",
      "FIN_PRJ_Revenue",
    ];

    var missingSheets = [];
    for (var i = 0; i < requiredSheets.length; i++) {
      var sheet = ss.getSheetByName(requiredSheets[i]);
      if (!sheet) {
        missingSheets.push(requiredSheets[i]);
      }
    }

    return {
      valid: missingSheets.length === 0,
      missingSheets: missingSheets,
      totalSheets: ss.getSheets().length,
      sheetId: CONFIG.SHEET_ID,
    };
  } catch (error) {
    return {
      valid: false,
      error: String(error),
      sheetId: CONFIG.SHEET_ID,
    };
  }
}
