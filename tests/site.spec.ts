import { expect, test } from "@playwright/test";

test("public page and Swedish editor work across screen sizes", async ({ page, request }) => {
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  page.on("console", msg => { if (msg.type() === "error") errors.push(msg.text()); });
  const initial = await (await request.get("/api/public/content")).json();
  const session = await (await request.get("/api/admin/session")).json();
  expect(session.local).toBe(true); // Never publish test content to a hosted environment.
  try {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: "Dalslandskören", exact: true })).toBeVisible();
    await page.evaluate(() => document.fonts.ready);
    await expect(page.locator('img[src="/assets/images/forget-me-not-sprig.png"]')).toBeVisible();
    await page.locator('img[src="/assets/images/forget-me-not-sprig.png"]').scrollIntoViewIfNeeded();
    await expect.poll(() => page.locator('img[src="/assets/images/forget-me-not-sprig.png"]').evaluate((img: HTMLImageElement) => img.naturalWidth)).toBe(1086);
    await page.evaluate(() => window.scrollTo(0, 0));
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.screenshot({ path: "test-results/public-desktop.png", fullPage: true });
    await expect(page.getByText("dalslandskorenblaklang@gmail.com")).toHaveCount(0);
    await expect(page.getByText("demokonsert")).toHaveCount(0);

    await page.setViewportSize({ width: 390, height: 844 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.getByRole("link", { name: "Kontakt", exact: true }).click();
    await expect(page.getByRole("heading", { name: "Kontakt", exact: true })).toBeInViewport();
    await page.screenshot({ path: "test-results/public-mobile.png", fullPage: true });

    await page.goto("/admin");
    await expect(page.getByText("Allt är publicerat", { exact: true })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.screenshot({ path: "test-results/editor-mobile.png", fullPage: true });
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.screenshot({ path: "test-results/editor-desktop.png", fullPage: true });
    await page.locator("summary").filter({ hasText: /^Om oss$/ }).click();
    await page.getByLabel("Presentation", { exact: true }).fill("Test av redaktörens publicering.");
    await page.getByRole("button", { name: "Förhandsvisa", exact: true }).click();
    await expect(page.getByText("Test av redaktörens publicering.", {exact: true})).toBeVisible();
    await page.getByRole("button", {name: "Tillbaka till redigering"}).click();
    await page.locator("summary").filter({ hasText: /^Konserter$/ }).click();
    await page.getByRole("button", {name: "+ Lägg till konsert"}).click();
    await page.getByLabel("Konsertens namn").fill("Lokal testkonsert");
    await page.getByLabel("Datum och tid · svensk tid").fill("2026-12-13T16:00");
    await page.getByLabel("Plats", {exact: true}).fill("Testlokal");
    await page.getByRole("button", { name: "Publicera", exact: true }).click();
    await expect(page.getByRole("status")).toContainText("Publicerat!");
    const saved = await (await request.get("/api/public/content")).json();
    expect(saved.content.about.text).toBe("Test av redaktörens publicering.");
    expect(saved.content.concerts.items.at(-1).date).toBe("2026-12-13T16:00:00+01:00");
    await page.goto("/");
    await expect(page.getByText("Test av redaktörens publicering.", {exact: true})).toBeVisible();
    await expect(page.getByRole("heading", {name: "Lokal testkonsert"})).toBeVisible();
    expect(errors).toEqual([]);
  } finally {
    const latest = await (await request.get("/api/public/content")).json();
    const restored = await request.put("/api/public/content", { headers: {"Content-Type": "application/json", "If-Match": String(latest.revision)}, data: initial.content });
    expect(restored.ok()).toBe(true);
  }
});
