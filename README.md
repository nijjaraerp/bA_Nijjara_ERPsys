# Nijjara ERP System

<div align="center">

**A Serverless, Google Workspace-Powered Enterprise Resource Planning System**

[![License](https://img.shields.io/badge/license-UNLICENSED-red.svg)](LICENSE)
[![Playwright Tests](https://img.shields.io/badge/tests-playwright-45ba4b.svg)](https://playwright.dev/)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Architecture](#-architecture)
- [Technology Stack](#-technology-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Core Modules](#-core-modules)
- [Database Schema](#-database-schema)
- [Development](#-development)
- [Testing](#-testing)
- [Documentation](#-documentation)
- [Contributing](#-contributing)

---

## 🎯 Overview

**Nijjara ERP** is a custom, serverless, web-based Enterprise Resource Planning (ERP) platform built entirely on Google Workspace. It's designed as a Single-Page Application (SPA) to provide a fast, dynamic, and responsive user experience for managing core business operations.

The system centralizes and manages operations across **four main modules**:

- 🔐 **System Administration (SYS)** - User management, roles, permissions, and audit logs
- 👥 **Human Resources (HRM)** - Employee management, attendance, leave, and payroll
- 📊 **Project Management (PRJ)** - Project tracking, tasks, clients, and materials
- 💰 **Finance (FIN)** - Revenue, expenses, custody, and P&L statements

---

## ✨ Features

### Core Capabilities

- **🌐 Serverless Architecture** - Fully hosted on Google Workspace (no external servers required)
- **🔄 Real-time Data Sync** - Live updates using Google Sheets as the database
- **🎨 Metadata-Driven UI** - Dynamic interface generation based on configuration
- **🔐 Robust Security** - Role-based access control and comprehensive audit logging
- **📱 Responsive Design** - Mobile-friendly interface with dark mode support
- **🌍 Arabic-First Interface** - Complete RTL support with Cairo font family
- **🔍 Smart Search & Lookups** - Dynamic autocomplete for efficient data entry
- **📎 Document Management** - Integrated file attachments with Google Drive
- **📈 Real-time Analytics** - Dashboard metrics and reporting

### Smart Header Protocol

Every data sheet follows a **3-Row Rule** for consistency:

- **Row 1**: System keys (e.g., `emp_id`, `full_name`)
- **Row 2**: Arabic UI labels (e.g., `كود الموظف`, `الاسم بالكامل`)
- **Row 3**: Visibility flags (`SHOW` or empty)
- **Row 4+**: Actual data records

This protocol enables automatic form and table generation without hardcoding UI elements.

---

## 🏗️ Architecture

### The 3-File System

The entire application runs on **exactly three files**:

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  1. Code.gs (Backend)                                       │
│     ├─ Authentication & Sessions                            │
│     ├─ Engine Core (Form/View Configuration)                │
│     ├─ CRUD Operations                                      │
│     ├─ Business Logic                                       │
│     └─ Logging & Audit                                      │
│                                                             │
│  2. Dashboard.html (Frontend SPA)                           │
│     ├─ HTML Shell                                           │
│     ├─ CSS Styles (Glassmorphism, Dark Mode)                │
│     ├─ Vue.js Application Logic                             │
│     ├─ Smart Components (Form, Grid, Navbar)                │
│     └─ API Handler                                          │
│                                                             │
│  3. Setup.js (Database Architect)                           │
│     ├─ Schema Management                                    │
│     ├─ Data Seeding                                         │
│     ├─ Wipe & Reset Utilities                               │
│     └─ GUI Sidebar Interface                                │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Engine System (ENG_)

Configuration sheets that drive the entire system:

- **ENG_Settings** - Maps form IDs to target sheets
- **ENG_Forms** - Defines form fields, types, and validation rules
- **ENG_Views** - Configures list views and data grids
- **ENG_Dropdowns** - Centralized dropdown options (EN/AR)
- **ENG_Buttons** - Action button definitions

---

## 🛠️ Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Backend** | Google Apps Script (.js) | Server-side logic, API, authentication |
| **Frontend** | HTML5 + CSS3 + JavaScript | Single-Page Application |
| **Framework** | Vue.js (CDN) | Reactive UI components |
| **Styling** | TailwindCSS (CDN) | Utility-first CSS framework |
| **Database** | Google Sheets | Transparent, auditable data store |
| **Typography** | Cairo Font Family | Arabic-optimized font |
| **Testing** | Playwright | End-to-end automated testing |

---

## 📁 Project Structure

```
bA_Nijjara_ERPsys/
├── src/                              # Source code (Apps Script files)
│   ├── Code.gs                       # Backend core
│   ├── Dashboard.html                # Frontend SPA
│   └── Setup.js                      # Database management
├── tests/                            # Playwright E2E tests
├── docs/                             # Documentation
│   ├── Onboarding.md                 # Developer onboarding
│   └── Core Architecture & Smart Engine Protocol.md
├── artifacts/                        # Test artifacts
├── playwright-report/                # Test reports
├── .clasp.json                       # Google Apps Script configuration
├── package.json                      # Node.js dependencies
├── playwright.config.js              # Playwright configuration
└── Nijjara ERP Implementation Guidelines.md  # Full technical specs
```

---

## 🚀 Getting Started

### Prerequisites

- **Google Account** with access to Google Workspace
- **Node.js** (v14 or higher) for testing
- **clasp** CLI tool for Apps Script deployment

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/nijjaraerp/bA_Nijjara_ERPsys.git
   cd bA_Nijjara_ERPsys
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure clasp**

   ```bash
   npm install -g @google/clasp
   clasp login
   ```

4. **Deploy to Google Apps Script**

   ```bash
   clasp push
   ```

5. **Set up the database**

   - Open the Google Sheet: `bA_Nijjara_ERPsys`
   - Run the Setup.js menu: **Nijj_Interaction_Sys → Run System**
   - Select schema creation and data seeding options

### First Login

- Open the web app URL from Google Apps Script deployment
- Default admin credentials (change after first login):
  - Username: `admin`
  - Password: As configured in `SYS_Users`

---

## 📦 Core Modules

### 🔐 System Administration (SYS)

Manage users, roles, permissions, and system configuration.

**Key Features:**
- User management with role-based access control
- Audit logging for all system activities
- Session management
- Document repository
- Public holidays calendar

**Main Sheets:**
- `SYS_Users`, `SYS_Roles`, `SYS_Permissions`
- `SYS_Audit_Log`, `SYS_Sessions`
- `SYS_Documents`, `SYS_PubHolidays`

### 👥 Human Resources (HRM)

Complete employee lifecycle management.

**Key Features:**
- Employee profiles with personal, job, and financial data
- Attendance tracking with overtime calculations
- Leave management (requests, approvals, balance)
- Salary advances and deductions
- Department organization

**Main Sheets:**
- `HRM_Employees`, `HRM_Departments`
- `HRM_Attendance`, `HRM_Leave`, `HRM_OverTime`
- `HRM_Advances`, `HRM_Deductions`

### 📊 Project Management (PRJ)

Track projects from initiation to completion.

**Key Features:**
- Project portfolio management
- Task assignment and tracking
- Client relationship management
- Material catalog and pricing
- Plan vs. Actual analysis

**Main Sheets:**
- `PRJ_Main`, `PRJ_Clients`, `PRJ_Tasks`
- `PRJ_Material`, `PRJ_Plan_vs_Actual`
- `PRJ_IndirExp_Time_Alloc`, `PRJ_IndirExp_NoTime_Alloc`

### 💰 Finance (FIN)

Comprehensive financial operations management.

**Key Features:**
- Project revenue tracking
- Direct and indirect expense management
- Automated expense allocation (time-based & budget-based)
- Custody management for employees
- Payroll processing
- Profit & Loss statements

**Main Sheets:**
- `FIN_PRJ_Revenue`, `FIN_DirectExpenses`
- `FIN_InDirectExpenses_Time`, `FIN_InDirectExpenses_NoTime`
- `FIN_Custody`, `FIN_HRM_Payroll`
- `FIN_PandL_Statements`

---

## 🗄️ Database Schema

All data is stored in **one Google Sheet** (`bA_Nijjara_ERPsys`) with tabs organized by prefix:

- **SYS_*** - System administration tables
- **HRM_*** - Human resources tables
- **PRJ_*** - Project management tables
- **FIN_*** - Finance tables
- **ENG_*** - Engine configuration tables
- **DBUG_*** - Debug and logging tables

### Smart ID Generation

No random UUIDs - all IDs follow a clean, sequential format:

```
Format: [PREFIX]-[NUMBER]

Examples:
  SYS_Users    → SYS-1001, SYS-1002
  HRM_Employees → HRM-1001, HRM-1002
  PRJ_Main     → PRJ-5001, PRJ-5002
```

---

## 💻 Development

### Running Tests

```bash
# Run all E2E tests
npm run test:e2e

# Run tests in headed mode (see browser)
npm run test:e2e:headed

# Run tests across all browsers
npm run test:e2e:all

# List all available tests
npm run test:list
```

### Development Workflow

1. **Make changes** to Apps Script files in `src/`
2. **Push to Google** using `clasp push`
3. **Test changes** in the deployed web app
4. **Run E2E tests** to ensure no regressions
5. **Commit and push** to version control

### Debugging

Three debug tabs are available in the Google Sheet:

- **DBUG_AppLog** - Application logs (successful operations)
- **DBUG_WarnLog** - Warnings and potential issues
- **DBUG_ErrorLog** - Errors and exceptions with stack traces

Log format:
```
2025-12-03T10:15:12.345Z | level=INFO | actor=USR-17 | action=CLICK | component=UI | id=app-hrm :: User clicked on app-hrm
```

---

## 🧪 Testing

The project uses **Playwright** for end-to-end testing to ensure system reliability.

### Test Structure

```
tests/
├── auth/           # Authentication tests
├── hrm/            # HR module tests
├── prj/            # Project module tests
└── fin/            # Finance module tests
```

### Configuration

Playwright is configured to run tests on:
- Chromium
- Firefox
- WebKit (Safari)

Test reports are generated in `playwright-report/` and artifacts in `test-results/`.

---

## 📚 Documentation

| Document | Description |
|----------|-------------|
| [Implementation Guidelines](Nijjara%20ERP%20Implementation%20Guidelines.md) | Complete technical specifications |
| [Onboarding](docs/Onboarding.md) | Developer onboarding and logging policy |
| [Core Architecture](docs/Core%20Architecture%20&%20Smart%20Engine%20Protocol.md) | Detailed architecture documentation |

### Key Concepts

- **Smart Header Protocol** (3-Row Rule)
- **Metadata-Driven UI**
- **Engine System (ENG_)**
- **Dynamic Form & View Generation**
- **Smart Search & Lookups**

---

## 👤 Contributing

This is a private project. For team members:

1. Read the [Onboarding](docs/Onboarding.md) document
2. Acknowledge the aggressive logging policy
3. Follow the development workflow
4. Ensure all tests pass before committing
5. Maintain logging standards in all code

### Coding Standards

- All UI text must be in Arabic
- Use Cairo font family
- Follow the 3-Row Header protocol
- Maintain comprehensive logging
- Write E2E tests for new features

---

## 📄 License

This project is **UNLICENSED** - proprietary software for internal use only.

---

## 🤝 Support

For support and questions:

- Review the [Implementation Guidelines](Nijjara%20ERP%20Implementation%20Guidelines.md)
- Check debug logs in `DBUG_*` sheets
- Contact the system administrator

---

<div align="center">

**Built with ❤️ using Google Workspace**

Made for efficient business management

</div>
