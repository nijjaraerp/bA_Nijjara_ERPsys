# Nijjara-OS Design System Documentation (v1.0)

**Design Philosophy:** "Futuristic Glassmorphism."
The interface mimics a desktop operating system environment using deep space backgrounds, translucent glass textures (`backdrop-filter`), neon accent colors, and physics-based interactions. The system is designed natively for **RTL (Right-to-Left)** orientation.

-----

## 1\. Style Dictionary & Design Tokens

### 1.1 Color Palette

The color scheme relies on a "Dark Matter" base with high-contrast neon accents for state indication.

| Token Name | Hex/RGBA Value | Usage / Rationale |
| :--- | :--- | :--- |
| **Backgrounds** | | |
| `var(--color-bg-dark-matter)` | `#07080D` | The deepest background layer; creates infinite depth. |
| `var(--color-bg-glass)` | `rgba(25, 28, 48, 0.6)` | **Primary UI Surface.** Used for Windows, Dock, and Panels. |
| `rgba(0,0,0,0.5)` | `rgba(0,0,0,0.5)` | Input fields and localized overlays. |
| **Borders** | | |
| `var(--color-border-glass)` | `rgba(255, 255, 255, 0.15)` | Subtle rim lighting to define glass edges. |
| **Typography** | | |
| `var(--color-text)` | `#e0e0e0` | Primary content text. Off-white to reduce eye strain. |
| `var(--color-text-muted)` | `#aaa` | Labels, placeholders, and inactive icons. |
| **Accents & States** | | |
| `var(--color-accent-primary)` | `#0078f0` | **Brand Color.** Buttons, active states, window headers. |
| `var(--color-accent-secondary)`| `#00a0f0` | Hover states, glowing effects. |
| `var(--color-accent-green)` | `#30d970` | Success states, boot logs, "Maximize" button. |
| `var(--color-accent-red)` | `#d93030` | Destructive actions, errors, "Close" button. |
| `#f0a000` | `#f0a000` | Warning/Minimize (Hardcoded in `.btn-min`). |

### 1.2 Typography

The system uses a pairing of a modern geometric sans-serif (UI) and a tech-inspired monospace (Logs/Data).

| Element | Font Family | Weights | Size | Line Height | CSS Selector |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **UI Body** | `'Cairo', sans-serif` | 300, 400, 700 | 1rem (16px) | Normal | `html, body`, `.window-content` |
| **Terminal/Log**| `'Share Tech Mono'` | 400 | 1rem | N/A | `#boot-log`, `.audit-log` |
| **Headers** | `'Cairo', sans-serif` | 700 | Variable | N/A | `.login-box h2`, `.window-title` |
| **Labels** | `'Cairo', sans-serif` | 400 | 0.75rem | N/A | `.dock-app-label` |

### 1.3 Depth & Effects (Shadows & Blurs)

The "Glass" feel is achieved through a combination of backdrop filters and layered shadows.

  * **Glass Blur:** `backdrop-filter: blur(15px);` (Used on Windows and Dock).
  * **Shadow MD:** `0 5px 15px rgba(0, 0, 0, 0.3)` (Buttons, Hovers).
  * **Shadow LG:** `0 10px 30px rgba(0, 0, 0, 0.4)` (Active Windows, Login Box).
  * **Glow:** `0 0 15px var(--color-accent-secondary)` (Focus states, Nexus container).

-----

## 2\. Component Library

### 2.1 The "Neural Dock" (Navigation)

A floating bar positioned at the bottom center.

  * **Selector:** `#neural-dock`
  * **Structure:** Flexbox container, hidden by default (`bottom: -85px`), reveals on hover (`bottom: 10px`).
  * **Item Styling:**
      * Size: `70px` x `70px`.
      * Base: Transparent with `rgba(255,255,255,0.05)` fill.
      * **Hover State:** Scales `1.1`, translates Y `-10px`, background changes to `var(--color-accent-primary)`.
      * **Tooltip:** Appears on hover, opacity transition `0.3s`.

### 2.2 App Windows

The core container for application modules.

  * **Selector:** `.app-window`
  * **Dimensions:** Default `600px` x `400px` (Resizable).
  * **Z-Index:** Starts at 10, increments on focus.
  * **Header (`.window-header`):**
      * Height: `35px`.
      * Background: Darker strip `rgba(0,0,0,0.3)`.
      * Cursor: `grab` (indicates draggable).
  * **Window Controls (Traffic Lights):**
      * Circular buttons `15px` x `15px`.
      * Colors: Red (Close), Amber (Minimize), Green (Maximize).
      * Iconography: SVG icons inside buttons, visible on hover only.

### 2.3 Form Elements

Designed for high contrast on dark backgrounds.

  * **Inputs (`input`, `select`, `textarea`):**
      * Background: `rgba(0,0,0,0.5)`.
      * Border: `1px solid var(--color-text-muted)`.
      * Text Align: `right` (inherited from body RTL).
      * **Focus State:** Border becomes Primary Blue, Box shadow glow appears.
  * **Primary Button:**
      * Background: `var(--color-accent-primary)`.
      * Hover: Shift to Secondary Blue, `transform: translateY(-2px)`.

### 2.4 Floating Action Button (FAB)

A radial menu system for sub-actions.

  * **Selector:** `.module-fab`
  * **Position:** Absolute/Draggable.
  * **Main Button:** `60px`, Circular, Primary Color.
  * **Interaction:** Clicking toggle expands `.fab-rays`.
  * **Rays (Sub-items):** `40px` white circles. Positioned via `transform: rotate` and `translate`.

-----

## 3\. Layout & Architecture

### 3.1 Layout Systems

  * **Global Layout:** Absolute positioning is used for the "Desktop" metaphor (`#nijjara-os`, `.app-window`, `#holo-deck`).
  * **Internal Layouts:**
      * **Flexbox:** Used extensively for centering content (`#boot-screen`), the Dock (`.dock-group`), and Window Headers.
      * **CSS Grid:** Used specifically in Forms (`.form-grid`) with a `100px 1fr` column structure for label alignment.

### 3.2 Z-Index Layering Strategy

The system uses specific z-index bands to manage depth:

1.  **Background/Particles:** `1`
2.  **App Windows:** `10` to `100` (Dynamic increment).
3.  **Floating Action Buttons (FAB):** `900` - `901`.
4.  **Status Bar / Task Switcher:** `998`.
5.  **Dock:** `999`.
6.  **Boot Screen:** `1000`.
7.  **Overlay / Nexus Command:** `1999` - `2000`.

### 3.3 Scrollbars

Custom Webkit styling to match the glass theme.

  * **Selector:** `::-webkit-scrollbar`
  * **Width:** `8px`.
  * **Track:** Transparent.
  * **Thumb:** `var(--color-border-glass)` with `8px` radius.

-----

## 4\. Animation Specifications

The system relies on CSS transitions for micro-interactions and Keyframes for entrance effects.

| Animation Name | Trigger | Duration | Easing | Properties Affected |
| :--- | :--- | :--- | :--- | :--- |
| **Window Open** | JS Creation | `0.5s` | `ease-out` | Opacity (0→1), Scale (0.7→1), RotateY (45deg→0). |
| **Dock Reveal** | Hover | `0.3s` | `ease` | Bottom position. |
| **Pulse** | Infinite | `15s` | N/A | Background particles scaling (1→1.1→1). |
| **Nexus Open** | Toggle | `0.7s` | `ease-out` | Opacity, Scale, Translate. |
| **Hover Effects** | Mouse Over | `0.3s` | `linear` | Transform (Scale/Translate), Background Color. |

-----

## 5\. Implementation Guide

To recreate this design system, follow these steps:

### 5.1 Prerequisites

1.  **Fonts:** Import 'Cairo' and 'Share Tech Mono' from Google Fonts.
2.  **Icons:** Use an SVG Sprite system (defined in `<defs>`) for performance.

### 5.2 CSS Reset & Base

Apply the following to ensure the full-screen app behavior:

```css
html, body {
    overflow: hidden; /* Prevents scroll on the desktop surface */
    height: 100vh;
    width: 100vw;
    direction: rtl; /* Crucial for Arabic layout */
    background-color: #07080D;
}
```

### 5.3 Cross-Browser Compatibility Notes

  * **Backdrop Filter:** The code uses `-webkit-backdrop-filter` alongside the standard property. This is required for Safari support.
  * **RTL:** The `dir="rtl"` attribute on `<html>` handles text direction, but `text-align: right` is explicitly enforced on inputs.
  * **Flexbox:** Supported in all modern browsers.

### 5.4 Performance Recommendations

1.  **Paint Flashing:** The extensive use of `backdrop-filter` over a gradient background (`#holo-deck`) is GPU intensive. Ensure the background gradient is static or separated onto a compositor layer (`will-change: transform` on moving parts).
2.  **SVG Sprites:** The code correctly uses `<symbol>` and `<use>`. Keep this pattern to reduce DOM nodes.
3.  **Reflows:** dragging windows (`elementDrag` function) modifies `top/left` properties directly. For smoother performance on low-end devices, consider using `transform: translate3d()` for dragging, then committing layout changes on `mouseup`.

### 5.5 Responsive Breakpoints

**Critical Note:** The current codebase **does not** contain `@media` queries. The interface relies on `100vh/100vw` scaling.

  * **Recommendation:** To support mobile, add a breakpoint at `768px`:
      * Hide `#neural-dock` and replace with a hamburger menu.
      * Force `.app-window` width to `100%` and top/left to `0`.
      * Hide the particle background animation to save battery.