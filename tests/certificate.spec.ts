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
