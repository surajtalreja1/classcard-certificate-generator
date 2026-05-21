import { test, expect } from "@playwright/test";

test("certificate studio loads", async ({ page }) => {
  await page.goto("./");
  await expect(page.locator(".cert-headline")).toBeVisible();
  await expect(page.locator(".cert-headline")).toHaveText("Certificate of Achievement");
});

test("recipient name updates on the certificate", async ({ page }) => {
  await page.goto("./");
  const input = page.locator("#recipient-input");
  await input.clear();
  await input.fill("Jane Doe");
  await expect(page.locator("#preview-recipient")).toHaveText("Jane Doe");
});
