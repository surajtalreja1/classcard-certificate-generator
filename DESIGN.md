# Design System

Reference for the Certificate Studio UI. Every value here comes from
`src/assets/style.css`. When the two disagree, fix one so they match.

The UI is a two-pane studio: a **sidebar** of controls on the left and a
**preview pane** on the right. The certificate itself is a separate, fixed
design that should not inherit UI styling.

## Principles

- Black is the accent. Selected cards, primary buttons and active toggles
  use near-black (`rgba(24,24,27,0.9)`). Blue is kept for focus rings,
  the zoom slider thumb and layout-editing outlines.
- Match the schedule printer. Shared patterns (modal, buttons, cards,
  sidebar) should look identical across the two Classcard free tools.
- Every certificate element has a control in the sidebar, and an empty
  input hides its element. Nothing on the certificate is hard-coded except
  the "Generated on Classcardapp.com" print footer.
- Email stays required for printing (lead capture). Do not add a way to
  hide it.

## Tokens

Defined on `body.v2-ui`, with dark overrides on `body.v2-ui.theme-dark`.
Use the variable, not the hex.

| Token | Light | Dark | Use |
|---|---|---|---|
| `--bg-app` | `#F7F7F8` | `#050a14` | Preview pane background |
| `--bg-sidebar` | `#ffffff` | `#0a192f` | Sidebar, toolbars, mobile bars |
| `--bg-input` | `#ffffff` | `rgba(255,255,255,0.03)` | Inputs, drop zones |
| `--bg-promo` | `#EBF5FB` | `rgba(255,255,255,0.02)` | Hover fill on dashed areas |
| `--text-main` | `#241c15` | `#e6f1ff` | Body text |
| `--text-muted` | `#9b9b9b` | `rgba(148,163,184,1)` | Hints, descriptions |
| `--border-ui` | `#e2e2e2` | `rgba(255,255,255,0.1)` | Dividers, toolbar borders |
| `--classcard-blue` | `#0071b2` | same | Slider thumb, edit outlines, drop-zone hover |

Fixed greys used directly (Tailwind zinc scale):

| Value | Use |
|---|---|
| `rgba(24,24,27,1)` | Labels, headings, button text |
| `rgba(24,24,27,0.9)` | Primary button and selected-card fill |
| `rgba(24,24,27,0.15)` | Card borders |
| `rgba(24,24,27,0.1)` | Input and outline-button borders |
| `rgba(113,113,122,1)` | Field descriptions, modal close icon |
| `#dc2626` | Error toast |
| `#3b82f6` | Focus rings: 2px inset on inputs, 2px outline elsewhere |

## Spacing

Base grid is 8px (`--grid`).

| Where | Value |
|---|---|
| Between sections | 32px |
| Section body padding | 12px 16px |
| Between fields in a section | 20px |
| Label to its input | 12px |
| Gap inside toolbars and button rows | 6px |
| Modal panel padding | 24px |
| Floating toolbar offset from pane edge | 24px |
| Sidebar width | 380px default, 300–800px draggable |

## Type

Sidebar and UI use the system font stack. The certificate uses **Lato**
for text and **Ballet** for the recipient name, loaded from Google Fonts.

| Role | Size / weight |
|---|---|
| Page title (sidebar `h1`) | 20px / 600 |
| Section heading (`h3`) | 14px / 600 |
| Field label | 14px / 500, line-height 1.5rem |
| Input text, buttons, descriptions | 14px |
| Secondary text, card labels, toast | 13px |
| Smallest UI text (hints, dims, powered-by) | 12px |
| `.btn-xs` label | 11px / 600 (shared with the schedule printer) |
| Modal title | 16px / 600 (shared with the schedule printer) |

Certificate type (do not change casually, it is the product):

| Element | Style |
|---|---|
| Award title | Lato 900, 52px landscape / 46px portrait, `#030712` |
| Recipient | Ballet, 84px, `#030712` |
| Badge | Lato 500, 12px, tinted pill |
| Body lines | Lato, 14px, `#374151` |

## Radius

| Value | Use |
|---|---|
| 2–4px | Tiny inner shapes: thumbnails, slider tracks, orientation icons |
| 6px | Small buttons (`.btn-xs`), badge pill |
| 8px | Buttons, inputs, cards, dropdown menus, warning banners |
| 10px | Floating toolbars |
| 12px | Drop zones, image preview wells |
| 16px | Modal panel (20px top corners as a mobile bottom sheet) |
| 50% | Colour swatches, seals, icon wells |
| 100px | Toast pill |

Inner highlight pseudo-elements use the parent radius minus 1px.

## Components

**Buttons** (`.btn` + variant). Height comes from 5px 11px padding and
1.5rem line-height.
- `.btn-primary` black fill, white text. One per view: Print Certificate,
  modal confirm, and the active "Done" state of Adjust layout.
- `.btn-outline` transparent with a 10% border. Default for secondary
  actions.
- `.btn-plain` borderless. Tertiary actions such as Reset layout, Cancel
  in tight spaces, and the zoom value.
- `.btn-icon` 34px square for +/- controls. `.btn-xs` for inline actions
  inside a row (Remove, Replace, Switch to Vertical). Buttons keep their
  default 14px size everywhere, toolbars and mobile included.
- Disabled: 45% opacity, default cursor. Hidden-until-relevant beats
  disabled when the action makes no sense yet (Reset layout).

**Inputs** (`.input-field`). Full width, 8px radius, 10% border, focus
shows a 2px blue inset ring with no outline. Textareas use the same class
with a fixed height and `resize: none`.

**Field** (`.field`). Column of label, control, optional
`.field-description`. Hide a whole field with the `hidden` attribute.

**Card radios** (`.card-radio` in a `.card-radio-grid.cols-4`). White
card with a 15% border; the checked card inverts to the black fill with
white text. Thumbnail cards add `.card-radio-thumb-host` and a 50px
`.card-radio-thumb`.

**Colour swatches** (`.color-swatch`). 28px circles; the checked swatch
gets a 2px ring in its own colour, offset 2px.

**Listbox** (`.listbox`). Custom select used for Seal Label Style. One
open at a time; click outside closes.

**Upload area** (`.upload-area`). Dashed `.custom-file-upload` button,
replaced after upload by a `.upload-preview-row` of 36px thumb, filename
and a `.btn.btn-outline.btn-xs` Remove. Used for logo and signature.
Backgrounds use the modal below.

**Modal** (`.modal-overlay` > `.modal-panel`). 25% black backdrop,
440px white panel, header / body / footer. Closes on Escape, the ×, and a
backdrop click that began on the backdrop. Under 850px it becomes a full
width bottom sheet with a sticky footer. Copied from the schedule printer;
keep the two in sync.

**Floating toolbar** (`.layout-toolbar`). One toolbar, bottom centre of
the preview, 10px radius, soft shadow. Groups are separated by a 1px
`.toolbar-divider`. Left group: Adjust layout and Reset layout. Right
group: zoom controls (desktop only). On mobile it sits statically above
the certificate.

**Toast** (`#status-toast`). Black pill, 24px from the top, centred,
13px / 700, styled in the stylesheet (not inline). Add `.toast-error` for
red. Auto-dismisses when given a duration.

## Preview and certificate

- The certificate is laid out at A4 at 96dpi: 1123×794 landscape,
  794×1123 portrait. The pane scales it with a CSS transform; never
  resize the certificate itself.
- Editing chrome inside the certificate (outlines, selection frame,
  labels) multiplies sizes by `--ui-scale` (1 / zoom) so it stays a
  constant size on screen.
- Element positions set with Adjust layout use the CSS `translate`
  property, stored per orientation. Flow layout stays the source of truth.
- Print clones the live preview once per recipient. Anything visible in
  the preview prints; anything hidden with `.is-blank` or `.is-empty`
  does not.

## Breakpoints

One breakpoint: **850px**.
- Above: two panes, draggable resizer, floating toolbar with zoom.
- Below: tabbed Build / Preview, fixed top header and bottom Print bar,
  toolbar above the certificate, modal as a bottom sheet, zoom hidden.

## Dark mode

Toggled by adding `theme-dark` to `body` and stored in `localStorage`.
Components that use fixed colours need an explicit `body.theme-dark`
rule. The certificate never changes with the theme.
