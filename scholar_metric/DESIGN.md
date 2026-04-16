# Design System Specification: The Academic Architect

## 1. Overview & Creative North Star
**Creative North Star: "The Focused Studio"**

This design system rejects the cluttered, "juvenile" aesthetic common in educational software. Instead, it treats the classroom as a high-performance productivity environment. We lean into a **"High-End Editorial"** approach: a sophisticated blend of utilitarian efficiency and premium spatial awareness. 

The system breaks the traditional "dashboard template" look by utilizing **intentional asymmetry** and **tonal layering**. Rather than rigid boxes, we use expansive breathing room and overlapping surfaces to create a sense of flow. This ensures that a teacher, often in a high-stress environment, experiences a UI that feels calm, authoritative, and impossibly organized.

---

## 2. Colors: Tonal Depth over Borders
Our palette is rooted in a deep, scholarly blue (`primary`) and supported by a sophisticated "semaphore" system for evaluation.

### The "No-Line" Rule
**Strict Mandate:** Designers are prohibited from using 1px solid borders to section content. Boundaries must be defined through background shifts or tonal transitions.
*   **Surface:** Use `surface` (#f8f9ff) for the base canvas.
*   **Nesting:** Place a `surface_container_low` section on the main surface to define a workspace. Use `surface_container_lowest` (#ffffff) for individual cards to create a "lifted" effect without lines.

### Signature Textures & Gradients
To avoid a "flat" SaaS feel, use subtle gradients for high-impact areas:
*   **Primary Action Surfaces:** Transition from `primary` (#0040e0) to `primary_container` (#2e5bff) at a 135° angle.
*   **The Glass Rule:** For floating navigation or mobile overlays, use `surface` at 80% opacity with a `24px` backdrop-blur. This creates a "frosted glass" effect that keeps the classroom context visible beneath the UI.

### Semaphore Evaluation States
*   **Critical (Red):** Use `error` (#ba1a1a) for urgent student interventions.
*   **Caution (Yellow):** Use `tertiary` (#784b00) for "at-risk" progress.
*   **Success (Green):** Use `secondary` (#006c49) for mastery and completion.

---

## 3. Typography: The Editorial Hierarchy
We use a dual-font strategy to balance character with extreme readability.

*   **Display & Headlines (Manrope):** A geometric sans-serif with a modern, technical soul. Use `display-md` or `headline-lg` for class names and primary data points to provide an authoritative "editorial" header.
*   **Body & Labels (Public Sans):** A high-performance typeface designed for clarity. Use `body-md` for student notes and `label-md` for metadata.
*   **The Power Scale:** Contrast a `headline-sm` title with a `label-sm` (all caps, 0.05em tracking) subtitle directly above it to create a professional, "Curated" information hierarchy.

---

## 4. Elevation & Depth: Tonal Layering
Traditional drop shadows are too "heavy" for a clean educational tool. We achieve depth through **Ambient Light Physics.**

*   **The Layering Principle:** Stack `surface_container_lowest` cards on `surface_container_low` backgrounds. This creates a soft, natural lift.
*   **Ambient Shadows:** If a card must float (e.g., a student profile modal), use a shadow with a 40px blur, 0px offset, and 6% opacity of `on_surface`.
*   **The Ghost Border:** If a boundary is required for accessibility, use `outline_variant` at **15% opacity**. Never use a 100% opaque border.

---

## 5. Components: Style & Execution

### Student Avatars & Status
*   **The Frame:** Avatars use the `xl` (0.75rem) roundedness. 
*   **Status Indicators:** Use a `6px` ring of `surface` (#f8f9ff) around the status dot (Green/Yellow/Red) to "cut" it out of the avatar, creating a custom, layered look.

### Buttons & Interaction
*   **Primary:** High-contrast `primary` with `on_primary` text. Shape: `md` (0.375rem).
*   **Secondary:** Never use a border. Use `secondary_container` background with `on_secondary_container` text.
*   **Tertiary:** No background. Use `primary` text with a subtle `surface_container_high` hover state.

### Input Fields
*   **Style:** Use "Soft Fill" instead of "Outlined." Apply `surface_container_highest` as the background with a `2px` bottom-only highlight in `primary` when focused.

### Progress Charts (Simple)
*   **The Linear Track:** Background track should be `surface_container_highest`. The progress fill should use the Semaphore colors based on the value.
*   **Asymmetric Data:** Don't center charts. Align them to the left of the card with generous `body-sm` metadata to the right to maintain the "Editorial" layout.

### Lists & Cards
*   **No Dividers:** Separate list items with `16px` of vertical white space or a subtle shift to `surface_container_low` on alternate rows.

---

## 6. Do's and Don'ts

### Do
*   **Do** use asymmetrical margins (e.g., a wider left margin than right) to create an editorial feel.
*   **Do** use `surface_bright` to highlight active student records during a live session.
*   **Do** ensure all touch targets are at least `48px` for mobile classroom use.

### Don't
*   **Don't** use pure black (#000000). Use `on_surface` (#0b1c30) for high-contrast text.
*   **Don't** use standard "Material Design" shadows. They are too aggressive for this refined palette.
*   **Don't** use 1px dividers. If you feel the need for a line, increase your `white-space` by 8px instead.