import { expect, test } from "@playwright/test";

test("browser verifies the committed decision memo", async ({ page }) => {
  await page.goto("/decisions?epoch=71");
  await expect(page.getByRole("heading", { name: "Decision #071" })).toBeVisible();
  await page.getByRole("button", { name: "Verify on-chain" }).click();
  await expect(page.getByText("The exact UTF-8 bytes fetched through IPFS hash to the value committed on X Layer.")).toBeVisible();
});

test("browser rejects a tampered decision memo", async ({ page }) => {
  await page.route("**/api/ipfs/demo-epoch-71", async (route) => {
    const response = await route.fetch();
    const original = await response.text();
    await route.fulfill({
      response,
      body: original.replace(
        "Preserve diversified yield exposure",
        "Tampered diversified yield exposure",
      ),
    });
  });

  await page.goto("/decisions?epoch=71");
  await page.getByRole("button", { name: "Verify on-chain" }).click();
  await expect(
    page.getByText(
      "The fetched payload does not match the contract commitment. Do not trust the displayed reasoning.",
    ),
  ).toBeVisible();
});
