import { expect, test } from "@playwright/test";

test("malicious 80 percent allocation is rejected", async ({ page }) => {
  await page.goto("/protocol#policy-simulator");
  await page.getByRole("button", { name: "80% malicious cap" }).click();
  await expect(page.getByText("Contract will revert")).toBeVisible();
  await expect(page.getByText("STRATEGY CAP")).toBeVisible();
});
