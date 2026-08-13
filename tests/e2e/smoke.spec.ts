import { expect, test, type Page } from "@playwright/test";

async function gotoReady(page: Page) {
  await page.addInitScript(() => {
    try {
      localStorage.setItem("lims-demo-light-mode", "1");
    } catch {
      /* ignore */
    }
  });
  await page.goto("/");
  await expect(page.getByTestId("page-title")).toHaveText("Strain registry");
}

async function openNav(page: Page, id: string, title: string) {
  await page.getByTestId(`nav-${id}`).click();
  await expect(page.getByTestId(`nav-${id}`)).toHaveAttribute("aria-current", "page");
  await expect(page.getByTestId("page-title")).toHaveText(title);
}

test.describe("LIMS Console smoke", () => {
  test("loads strain registry with KPIs and table", async ({ page }) => {
    await gotoReady(page);
    await expect(page.getByText("Indexed strains")).toBeVisible();
    await expect(page.getByText("YG-2841")).toBeVisible();
    await expect(page.getByTestId("nav-strains")).toHaveAttribute("aria-current", "page");
  });

  test("navigates to pipeline runs and projects", async ({ page }) => {
    await gotoReady(page);

    await openNav(page, "runs", "Pipeline runs");
    await expect(page.getByText("RUN-20260411-03")).toBeVisible();

    await openNav(page, "projects", "Projects");
  });

  test("opens FAQ and shows LIMS intro", async ({ page }) => {
    await gotoReady(page);
    await openNav(page, "faq", "FAQ");
    await expect(page.getByText(/Laboratory Information Management System/i).first()).toBeVisible();
  });

  test("settings menu toggles with aria-expanded", async ({ page }) => {
    await gotoReady(page);
    const avatar = page.getByTestId("settings-avatar");
    await expect(avatar).toHaveAttribute("aria-expanded", "false");
    await expect(avatar).toHaveAttribute("aria-haspopup", "true");

    await avatar.click();
    await expect(avatar).toHaveAttribute("aria-expanded", "true");
    await expect(page.locator("#lims-demo-settings")).toBeVisible();
    await expect(page.getByText("Demo settings")).toBeVisible();
    await expect(page.getByText("Light lab theme")).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(avatar).toHaveAttribute("aria-expanded", "false");
  });

  test("pipeline scenarios embed loads Mermaid graph", async ({ page }) => {
    await gotoReady(page);
    await openNav(page, "pipeline", "Pipeline scenarios");

    const frame = page.frameLocator('iframe[src*="pipeline-schema"]');
    await expect(frame.locator("#diagram-title")).toContainText("Data Ingestion", { timeout: 20_000 });
    await expect(frame.locator("#mermaid-target svg g.node").first()).toBeVisible({ timeout: 20_000 });
    await expect(frame.locator(".tab-ico").first()).toHaveText("DI");
  });

  test("standalone pipeline schema page renders", async ({ page }) => {
    await page.goto("/pipeline-schema.html?theme=light");
    await expect(page.locator("#diagram-title")).toContainText("Data Ingestion");
    await expect(page.locator("#mermaid-target svg g.node").first()).toBeVisible({ timeout: 20_000 });
    await expect(page.getByText("Syntax error in text")).toHaveCount(0);
  });
});
