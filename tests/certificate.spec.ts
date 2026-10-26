import { test, expect, type Page } from "@playwright/test";

test("certificate studio loads", async ({ page }) => {
  await page.goto("./");
  await expect(page.locator(".cert-headline")).toBeVisible();
  await expect(page.locator(".cert-headline")).toHaveText("Certificate of Achievement");
});

const certSize = (page: Page) =>
  page.locator("#certificate-preview").evaluate((el: HTMLElement) => [el.offsetWidth, el.offsetHeight]);

test("horizontal orientation is the default", async ({ page }) => {
  await page.goto("./");
  await expect(page.locator('input[name="orientation"][value="landscape"]')).toBeChecked();
  await expect(page.locator("#certificate-preview")).not.toHaveClass(/orient-portrait/);
  expect(await certSize(page)).toEqual([1123, 794]);
});

test("vertical orientation resizes the certificate", async ({ page }) => {
  await page.goto("./");
  await page.click('label[aria-label="Vertical"]');
  await expect(page.locator("#certificate-preview")).toHaveClass(/orient-portrait/);
  expect(await certSize(page)).toEqual([794, 1123]);

  await page.click('label[aria-label="Horizontal"]');
  await expect(page.locator("#certificate-preview")).not.toHaveClass(/orient-portrait/);
  expect(await certSize(page)).toEqual([1123, 794]);
});

test("vertical orientation swaps background artwork and thumbnails", async ({ page }) => {
  await page.goto("./");
  const bg = page.locator("#preview-bg-layer");
  const thumb = page.locator('.card-radio-thumb[data-skin="dance"]');

  await page.click('label[aria-label="Dance"]');
  const landscapeSrc = await bg.getAttribute("src");
  const landscapeThumb = await thumb.evaluate((el: HTMLElement) => el.style.backgroundImage);
  expect(landscapeSrc).toMatch(/^data:image\/svg\+xml/);

  await page.click('label[aria-label="Vertical"]');
  const portraitSrc = await bg.getAttribute("src");
  expect(portraitSrc).toMatch(/^data:image\/svg\+xml/);
  expect(portraitSrc).not.toEqual(landscapeSrc);
  expect(await thumb.evaluate((el: HTMLElement) => el.style.backgroundImage)).not.toEqual(landscapeThumb);
  await expect(page.locator("#bg-upload-hint")).toContainText("Portrait image recommended");

  await page.click('label[aria-label="Horizontal"]');
  expect(await bg.getAttribute("src")).toEqual(landscapeSrc);
  await expect(page.locator("#bg-upload-hint")).toContainText("Landscape image recommended");
});

test("orientation survives a background change", async ({ page }) => {
  await page.goto("./");
  await page.click('label[aria-label="Vertical"]');
  await page.click('label[aria-label="Football"]');
  const preview = page.locator("#certificate-preview");
  await expect(preview).toHaveClass(/orient-portrait/);
  await expect(preview).toHaveClass(/skin-football/);
  await page.click('label[aria-label="Plain"]');
  await expect(preview).toHaveClass(/orient-portrait/);
  await expect(preview).toHaveClass(/skin-plain/);
});

test("recipient name updates on the certificate", async ({ page }) => {
  await page.goto("./");
  const input = page.locator("#recipient-input");
  await input.clear();
  await input.fill("Jane Doe");
  await expect(page.locator("#preview-recipient")).toHaveText("Jane Doe");
});

// --- Layout editor ("Adjust layout") ---

// The preview animates its zoom on load; switch that off so measurements are stable.
const openStudio = async (page: Page) => {
  await page.goto("./");
  await page.addStyleTag({ content: "#preview-scaler { transition: none !important; }" });
  await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))));
};

const boxOf = async (page: Page, selector: string) => {
  const box = await page.locator(selector).boundingBox();
  if (!box) throw new Error(`no box for ${selector}`);
  return box;
};

const dragBy = async (page: Page, selector: string, dx: number, dy: number) => {
  const box = await boxOf(page, selector);
  const x = box.x + box.width / 2;
  const y = box.y + box.height / 2;
  await page.mouse.move(x, y);
  await page.mouse.down();
  await page.mouse.move(x + dx, y + dy, { steps: 8 });
  await page.mouse.up();
};

// Keep test runs from sending leads or pixel events, and stop the print dialog.
const stubSideEffects = async (page: Page) => {
  await page.route("**/api/lead", (route) => route.fulfill({ status: 200, body: "{}" }));
  await page.route(/facebook\.(net|com)/, (route) => route.abort());
};

test("adjust layout toggles edit mode", async ({ page }) => {
  await openStudio(page);
  const toggle = page.locator("#layout-toggle");
  await expect(toggle).toHaveAttribute("aria-pressed", "false");
  await expect(page.locator("#layout-reset")).toBeDisabled();
  await toggle.click();
  await expect(toggle).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator("body")).toHaveClass(/layout-editing/);
  await expect(page.locator("#preview-recipient")).toHaveAttribute("tabindex", "0");
  await toggle.click();
  await expect(page.locator("body")).not.toHaveClass(/layout-editing/);
  await expect(page.locator("#preview-recipient")).not.toHaveAttribute("tabindex", "0");
});

test("elements only move while adjust layout is on", async ({ page }) => {
  await openStudio(page);
  const before = await boxOf(page, "#preview-recipient");
  await dragBy(page, "#preview-recipient", 120, 60);
  const unchanged = await boxOf(page, "#preview-recipient");
  expect(unchanged.x).toBeCloseTo(before.x, 0);
  expect(unchanged.y).toBeCloseTo(before.y, 0);

  await page.click("#layout-toggle");
  await dragBy(page, "#preview-recipient", 120, 60);
  const after = await boxOf(page, "#preview-recipient");
  expect(after.x - before.x).toBeCloseTo(120, 0);
  expect(after.y - before.y).toBeCloseTo(60, 0);
  await expect(page.locator("#layout-reset")).toBeEnabled();
});

test("dragged elements stay on the canvas", async ({ page }) => {
  await openStudio(page);
  await page.click("#layout-toggle");
  await dragBy(page, "#preview-title", -3000, -3000);
  const cert = await boxOf(page, "#certificate-preview");
  const title = await boxOf(page, "#preview-title");
  expect(title.x).toBeGreaterThanOrEqual(cert.x - 1);
  expect(title.y).toBeGreaterThanOrEqual(cert.y - 1);
});

test("arrow keys nudge the selected element and double-click resets it", async ({ page }) => {
  await openStudio(page);
  await page.click("#layout-toggle");
  const start = await boxOf(page, "#preview-sub");
  await page.click("#preview-sub");
  await page.keyboard.press("Shift+ArrowRight");
  await page.keyboard.press("ArrowDown");
  const nudged = await boxOf(page, "#preview-sub");
  expect(nudged.x).toBeGreaterThan(start.x);
  expect(nudged.y).toBeGreaterThan(start.y);

  await page.dblclick("#preview-sub");
  const reset = await boxOf(page, "#preview-sub");
  expect(reset.x).toBeCloseTo(start.x, 0);
  expect(reset.y).toBeCloseTo(start.y, 0);
});

test("layout positions are kept separately per orientation", async ({ page }) => {
  await openStudio(page);
  await page.click("#layout-toggle");
  await dragBy(page, "#preview-recipient", 100, 0);
  const moved = await page.locator("#preview-recipient").evaluate((el: HTMLElement) => el.style.translate);
  expect(moved).not.toBe("");

  await page.click('label[aria-label="Vertical"]');
  expect(await page.locator("#preview-recipient").evaluate((el: HTMLElement) => el.style.translate)).toBe("");
  await expect(page.locator("#layout-reset")).toBeDisabled();

  await page.click('label[aria-label="Horizontal"]');
  expect(await page.locator("#preview-recipient").evaluate((el: HTMLElement) => el.style.translate)).toBe(moved);
});

test("reset layout clears every offset", async ({ page }) => {
  await openStudio(page);
  const before = await boxOf(page, "#preview-title");
  await page.click("#layout-toggle");
  await dragBy(page, "#preview-title", 0, 80);
  await dragBy(page, "#preview-recipient", 60, 0);
  await page.click("#layout-reset");
  const after = await boxOf(page, "#preview-title");
  expect(after.y).toBeCloseTo(before.y, 0);
  const translates = await page
    .locator("#certificate-preview [data-move]")
    .evaluateAll((els) => els.map((el) => (el as HTMLElement).style.translate));
  expect(translates.every((t) => t === "")).toBe(true);
  await expect(page.locator("#layout-reset")).toBeDisabled();
});

test("print pages copy the dragged layout and the seal", async ({ page }) => {
  await stubSideEffects(page);
  await openStudio(page);
  await page.evaluate(() => { window.print = () => {}; });
  await page.click('label[aria-label="Gold"]');
  await page.click("#layout-toggle");
  await dragBy(page, "#preview-seal", -200, 150);
  await page.click('label[for="mode-batch"]');
  await page.fill("#batch-names-input", "Ann Lee, Sam Roe");
  await page.fill("#email-input", "test@example.com");
  await page.click("#download-btn");

  const zone = page.locator("#batch-print-zone");
  await expect(zone.locator(".cert-render-area")).toHaveCount(2);
  await expect(zone.locator(".cert-recipient")).toHaveText(["Ann Lee", "Sam Roe"]);
  const previewSeal = await page.locator("#preview-seal").evaluate((el: HTMLElement) => el.style.translate);
  expect(previewSeal).not.toBe("");
  const printSeals = await zone.locator(".cert-seal").evaluateAll((els) =>
    els.map((el) => ({ translate: (el as HTMLElement).style.translate, active: el.classList.contains("active") }))
  );
  expect(printSeals).toEqual([
    { translate: previewSeal, active: true },
    { translate: previewSeal, active: true },
  ]);
  // No editor chrome or duplicate ids in the printed copies.
  await expect(zone.locator(".move-frame")).toHaveCount(0);
  await expect(zone.locator("[id]")).toHaveCount(0);
  await expect(zone.locator("[tabindex]")).toHaveCount(0);
});

// --- Background upload modal ---

const svgFile = (name: string, width: number, height: number) => ({
  name,
  mimeType: "image/svg+xml",
  buffer: Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"><rect width="${width}" height="${height}" fill="#c7d2fe"/></svg>`
  ),
});

const uploadCard = 'label[aria-label="Upload your own background"]';

test("upload card opens the background modal and cancel restores the previous skin", async ({ page }) => {
  await openStudio(page);
  await page.click('label[aria-label="Dance"]');
  await page.click(uploadCard);
  await expect(page.locator("#bg-modal-overlay")).toHaveClass(/open/);
  await expect(page.locator("#bg-apply-btn")).toBeDisabled();

  await page.setInputFiles("#bg-upload", svgFile("wide.svg", 1200, 800));
  await expect(page.locator("#bg-modal-preview")).toBeVisible();
  await expect(page.locator("#bg-file-dims")).toHaveText("1200 × 800px");
  // The image previews live on the certificate behind the modal.
  await expect(page.locator("#preview-bg-layer")).toHaveAttribute("src", /^data:image\/svg\+xml/);

  await page.click('#bg-modal-overlay .modal-footer >> text=Cancel');
  await expect(page.locator("#bg-modal-overlay")).not.toHaveClass(/open/);
  await expect(page.locator("#certificate-preview")).toHaveClass(/skin-dance/);
  await expect(page.locator('input[name="skin"][value="dance"]')).toBeChecked();
  await expect(page.locator("#upload-card-text")).toHaveText("Upload");
});

test("escape and the backdrop close the background modal", async ({ page }) => {
  await openStudio(page);
  await page.click(uploadCard);
  await page.keyboard.press("Escape");
  await expect(page.locator("#bg-modal-overlay")).not.toHaveClass(/open/);
  await expect(page.locator('input[name="skin"][value="plain"]')).toBeChecked();

  await page.click(uploadCard);
  await page.mouse.click(5, 5);
  await expect(page.locator("#bg-modal-overlay")).not.toHaveClass(/open/);
  await expect(page.locator("#certificate-preview")).toHaveClass(/skin-plain/);
});

test("using a background applies it and the upload card reopens the modal", async ({ page }) => {
  await openStudio(page);
  await page.click(uploadCard);
  await page.setInputFiles("#bg-upload", svgFile("wide.svg", 1200, 800));
  await page.click("#bg-apply-btn");
  await expect(page.locator("#bg-modal-overlay")).not.toHaveClass(/open/);
  await expect(page.locator("#certificate-preview")).toHaveClass(/skin-custom/);
  await expect(page.locator("#preview-bg-layer")).toHaveAttribute("src", /^data:image\/svg\+xml/);
  await expect(page.locator("#upload-card-text")).toHaveText("Custom");
  await expect(page.locator("#upload-card-thumb")).toHaveClass(/has-image/);

  // Switching away and cancelling a reopen keeps the committed image.
  await page.click('label[aria-label="Swim"]');
  await page.click(uploadCard);
  await expect(page.locator("#bg-modal-title")).toHaveText("Change background");
  await expect(page.locator("#bg-apply-btn")).toBeEnabled();
  await page.keyboard.press("Escape");
  await expect(page.locator("#certificate-preview")).toHaveClass(/skin-swim/);
  await expect(page.locator("#upload-card-text")).toHaveText("Custom");

  // Remove clears it and falls back to the previous skin.
  await page.click(uploadCard);
  await page.click("#bg-remove-btn");
  await expect(page.locator("#bg-modal-overlay")).not.toHaveClass(/open/);
  await expect(page.locator("#certificate-preview")).toHaveClass(/skin-swim/);
  await expect(page.locator("#upload-card-text")).toHaveText("Upload");
});

test("a portrait image offers to switch the certificate to vertical", async ({ page }) => {
  await openStudio(page);
  await page.click(uploadCard);
  await page.setInputFiles("#bg-upload", svgFile("tall.svg", 800, 1200));
  const warning = page.locator("#bg-orient-warning");
  await expect(warning).toBeVisible();
  await page.click("#bg-orient-switch");
  await expect(page.locator("#certificate-preview")).toHaveClass(/orient-portrait/);
  await expect(warning).toBeHidden();
  await page.click("#bg-apply-btn");
  await expect(page.locator('input[name="orientation"][value="portrait"]')).toBeChecked();
});

test("cancelling the modal also undoes an orientation switch", async ({ page }) => {
  await openStudio(page);
  await page.click(uploadCard);
  await page.setInputFiles("#bg-upload", svgFile("tall.svg", 800, 1200));
  await page.click("#bg-orient-switch");
  await page.keyboard.press("Escape");
  await expect(page.locator("#certificate-preview")).not.toHaveClass(/orient-portrait/);
  await expect(page.locator('input[name="orientation"][value="landscape"]')).toBeChecked();
});

test("non-image files are rejected in the modal", async ({ page }) => {
  await openStudio(page);
  await page.click(uploadCard);
  await page.setInputFiles("#bg-upload", { name: "notes.txt", mimeType: "text/plain", buffer: Buffer.from("hi") });
  await expect(page.locator("#bg-modal-error")).toBeVisible();
  await expect(page.locator("#bg-apply-btn")).toBeDisabled();
});
