# Design System Documentation: The Kinetic Minimalist

## 1. Overview & Creative North Star: "The Kinetic Minimalist"
This design system moves beyond the "utility-first" approach of typical transit apps to create a **high-end editorial experience** for the urban cyclist. Our Creative North Star is **"The Kinetic Minimalist"**: a philosophy that pairs the high-speed energy of cycling with the serene clarity of a premium gallery.

We break the "template" look by rejecting rigid grids in favor of **intentional asymmetry**. Large-scale typography acts as a structural element, while content floats on deep, tonal layers. By utilizing extreme roundedness and vibrant "Electric Green" accents against a void-like dark canvas, we create an interface that feels less like a form and more like a precision instrument.

---

## 2. Colors & Surface Architecture
The color palette is anchored in high-contrast "Void Black" and "Electric Neon," providing maximum legibility for riders on the move.

### The "No-Line" Rule
**Strict Directive:** 1px solid borders are prohibited for sectioning. Boundaries must be defined solely through background color shifts. For example, a `surface_container_low` card sitting on a `surface` background creates a natural edge without visual clutter.

### Surface Hierarchy & Nesting
Treat the UI as a series of physical layers. Use the surface-container tiers to define depth:
- **Base Layer:** `surface` (#0e0e0e)
- **Primary Content Area:** `surface_container` (#1a1a1a)
- **Elevated Cards:** `surface_container_high` (#20201f)
- **Floating Overlays:** `surface_container_highest` (#262626)

### The "Glass & Gradient" Rule
To elevate the "Electric Green" (`primary`: #a2ffbf), use subtle gradients for primary CTAs. Transition from `primary` to `primary_container` (#00fd93) at a 135-degree angle. For floating elements, use **Glassmorphism**: apply `surface_variant` at 60% opacity with a `20px` backdrop-blur to allow the vibrant primary accents to bleed through the background.

---

## 3. Typography: Editorial Authority
We use a dual-font pairing to balance character with utility. **Manrope** provides a geometric, modern tech feel for high-impact moments, while **Inter** ensures crystal-clear readability for technical data.

*   **Display (Manrope):** `display-lg` (3.5rem) is used for "hero" numbers—like hours remaining on a parking session—utilizing tight letter-spacing (-0.04em).
*   **Headlines (Manrope):** `headline-md` (1.75rem) serves as the primary entry point for screens, often placed with asymmetrical left-padding to create "white space tension."
*   **Body (Inter):** `body-lg` (1rem) is the workhorse. We never use pure white for body text; use `on_surface_variant` (#adaaaa) to reduce eye strain, reserving `on_surface` (#ffffff) for active titles.

---

## 4. Elevation & Depth: Tonal Layering
Traditional drop shadows are largely replaced by **Tonal Layering**.

*   **The Layering Principle:** Depth is achieved by "stacking." Place a `surface_container_lowest` (#000000) element inside a `surface_container` (#1a1a1a) block to create an "inset" look, perfect for input fields.
*   **Ambient Shadows:** If a "floating" ticket must stand out, use an ultra-diffused shadow: `box-shadow: 0 20px 40px rgba(162, 255, 191, 0.08)`. The shadow color is a tinted version of the `primary` token, mimicking the glow of a neon sign.
*   **The "Ghost Border" Fallback:** For accessibility in high-glare outdoor settings, use a "Ghost Border": the `outline_variant` (#484847) token at **15% opacity**. Never use 100% opaque lines.

---

## 5. Components & Primitives

### Buttons
*   **Primary:** A pill-shaped (`full` roundedness) container using the `primary` color. Text is `on_primary_fixed` (#004624) for maximum contrast.
*   **Secondary:** No fill. A `Ghost Border` (15% opacity) with `on_surface` text.
*   **States:** On press, the button should scale down to `0.96` to provide tactile, "kinetic" feedback.

### Cards & Tickets
*   **The Ticket Primitive:** Use `xl` (3rem) corner radius. Forbid dividers. Separate the "Ticket Header" from the "QR Code" using a `1.5rem` (`spacing.6`) vertical gap and a subtle shift from `surface_container_high` to `surface_container_highest`.

### Input Fields
*   **Styling:** Use `surface_container_lowest` for the field background. This creates a "hollow" feel that draws the eye. Labels should use `label-md` in `on_surface_variant`.

### Contextual Components for Bike Parking:
*   **The Occupancy Gauge:** A thick, rounded stroke using `primary_dim` with a `surface_variant` track. No numbers; use visual weight to convey availability.
*   **The "Active Session" Floating Bar:** A glassmorphic bar anchored to the bottom of the screen using `backdrop-blur` and a `primary` glow effect on the text.

---

## 6. Do’s and Don’ts

### Do:
*   **DO** use extreme white space. If you think there is enough padding, add `spacing.4` (1rem) more.
*   **DO** use the `lg` (2rem) and `xl` (3rem) border-radius for almost everything. Sharp corners are forbidden.
*   **DO** align text-heavy content to the left while keeping "Action" elements (like a 'Start Parking' button) full-width and centered.

### Don't:
*   **DON'T** use 1px dividers to separate list items. Use a `spacing.2` (0.5rem) gap or a slight tonal shift between `surface_container` and `surface_container_low`.
*   **DON'T** use standard "Grey" for shadows. Use the `primary` or `tertiary` tint at very low opacity to maintain the "Electric" atmosphere.
*   **DON'T** use `Inter` for headers. It lacks the architectural weight required for this system’s editorial feel. Use `Manrope`.