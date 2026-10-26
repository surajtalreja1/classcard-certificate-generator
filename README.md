# Classcard Certificate Generator (V2)

## Project Overview

The project is a lightweight, frontend-only web application designed to help users quickly customize and export professional-looking certificates. It functions entirely in the browser using plain HTML, CSS, and Vanilla JavaScript.

## Key Features & Capabilities

* **Live Preview & Sidebar Controls:** The application features a two-pane layout. The left sidebar contains all the input controls, while the right pane shows a live, dynamically updated preview of the A4 certificate.
* **Single & Batch Generation:** Users can generate a single certificate for one recipient, or use the "Batch" mode to paste a list of names. In Batch mode, the app automatically generates a separate certificate for each name.
* **Theming & Customization:**
  * **Orientation:** Certificates can be Horizontal (A4 landscape, the default) or Vertical (A4 portrait). The preview, background artwork and printed page size all follow the selected orientation.
  * **Skins:** Users can select different background themes (Plain, Gymnastics, Dance, Football, Swim, Academic, Wellness, or an uploaded image) which are stored as SVG assets. Each illustrated skin has a landscape design in `skins/` and a portrait design in `skins/portrait/`.
  * **Custom Backgrounds:** The Upload card opens a modal where users can click or drag and drop their own image. It previews live on the certificate, warns when the image's shape does not match the orientation (with a one-click switch), and can be changed or removed later from the same card.
  * **Adjust Layout:** The "Adjust layout" button in the preview lets users drag any element (logo, badge, seal, title, recipient, description, signature, business and contact lines) to line it up with their background. Arrow keys nudge the selected element, double-click resets it, and "Reset layout" restores the default design. Positions are kept separately for Horizontal and Vertical.
  * **Custom Text:** Fields for Award Title, Recipient, Narrative, Signatures, and Dates.
  * **Rank Seals:** Option to add Gold, Silver, or Bronze seals with customizable labels (e.g., 1st, 2nd, 3rd vs. Gold, Silver, Bronze).
  * **Logos:** Users can upload their own academy/school logo to appear alongside the default Classcard branding.
* **Native Browser Printing:** Instead of relying on error-prone third-party PDF libraries (like `html2pdf`), the application intelligently leverages the browser's native `window.print()` functionality. When exporting, it clones the live preview once per recipient into a print zone with print-specific CSS and page breaks, so every printed page matches the preview exactly, including any adjusted layout.
* **Responsive UI:** The workspace includes a draggable sidebar resizer, a zoom slider for the preview canvas, dark/light mode toggling, and a specific mobile-friendly tabbed view (Build vs. View).

## Design System

UI tokens, spacing, type, components and breakpoints are documented in [DESIGN.md](DESIGN.md). Check it before adding or changing sidebar controls.

## Architecture & Technical Details

* **Asset Management:** Background skins and the logo are managed via Base64 strings (in `skins.js` or `.b64` files) and SVGs in the `skins/` directory. This approach ensures images render reliably even when the application is run directly from the local filesystem (`file://`), bypassing strict browser CORS security policies.
* **Files:**
  * `index.html`: The main structural layout, including the sidebar inputs and the print-rendering zone.
  * `app.js`: Contains all the logic for real-time DOM updates, zooming, handling file uploads, managing the batch print array, and triggering the print dialog.
  * `style.css`: The styling rules, including specific `@media print` directives to ensure only the certificates are printed (hiding the UI).
