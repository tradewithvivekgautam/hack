import { expect, test } from "@playwright/test";

test("demo wallet deposits into the ERC-4626 experience", async ({ page }) => {
  await page.goto("/vault");
  await expect(page.getByRole("heading", { name: "Agentic RWA Treasury" })).toBeVisible();
  await page.getByRole("button", { name: "Connect wallet" }).click();
  await page.getByRole("button", { name: "Use demo wallet" }).click();
  await page.getByLabel("mUSDC amount").fill("100");
  await page.getByRole("button", { name: "Deposit mUSDC" }).click();
  await expect(page.getByText("Deposit confirmed")).toBeVisible();
});

test("responsive vault exposes mobile navigation", async ({ page, isMobile }) => {
  test.skip(!isMobile, "Mobile-only assertion");
  await page.goto("/vault");
  await page.getByRole("button", { name: "Open navigation" }).click();
  await expect(page.getByRole("link", { name: "Decision log" })).toBeVisible();
});
