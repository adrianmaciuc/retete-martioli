import { test, expect } from "@playwright/test";

test("home page smoke tests", async ({ page }) => {
  await page.goto("/");

  // Expect a title "to contain" a substring.
  await expect(page.getByText("Retete delicioase").first()).toBeVisible();
});
