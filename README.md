# Classcard Certificate Generator (V2)

## Project Overview

The project is a lightweight, frontend-only web application designed to help users quickly customize and export professional-looking certificates. It functions entirely in the browser using plain HTML, CSS, and Vanilla JavaScript.

## Key Features & Capabilities

* **Live Preview & Sidebar Controls:** The application features a two-pane layout. The left sidebar contains all the input controls, while the right pane shows a live, dynamically updated preview of the A4 certificate.
* **Single & Batch Generation:** Users can generate a single certificate for one recipient, or use the "Batch" mode to paste a list of names. In Batch mode, the app automatically generates a separate certificate for each name.
* **Theming & Customization:**
  * **Skins:** Users can select different background themes (Plain, Gymnastics, Dance, Football) which are stored as SVG assets.
  * **Custom Text:** Fields for Award Title, Recipient, Narrative, Signatures, and Dates.
  * **Rank Seals:** Option to add Gold, Silver, or Bronze seals with customizable labels (e.g., 1st, 2nd, 3rd vs. Gold, Silver, Bronze).
  * **Logos:** Users can upload their own academy/school logo to appear alongside the default Classcard branding.
* **Native Browser Printing:** Instead of relying on error-prone third-party PDF libraries (like `html2pdf`), the application intelligently leverages the browser's native `window.print()` functionality. When exporting, it structures the DOM with print-specific CSS and page breaks, ensuring perfectly scaled, high-quality A4 PDFs.
* **Responsive UI:** The workspace includes a draggable sidebar resizer, a zoom slider for the preview canvas, dark/light mode toggling, and a specific mobile-friendly tabbed view (Build vs. View).

## Architecture & Technical Details

* **Asset Management:** Background skins and the logo are managed via Base64 strings (in `skins.js` or `.b64` files) and SVGs in the `skins/` directory. This approach ensures images render reliably even when the application is run directly from the local filesystem (`file://`), bypassing strict browser CORS security policies.
* **Files:**
  * `index.html`: The main structural layout, including the sidebar inputs and the print-rendering zone.
  * `app.js`: Contains all the logic for real-time DOM updates, zooming, handling file uploads, managing the batch print array, and triggering the print dialog.
  * `style.css`: The styling rules, including specific `@media print` directives to ensure only the certificates are printed (hiding the UI).
