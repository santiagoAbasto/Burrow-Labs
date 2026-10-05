import { expect, type Page } from "@playwright/test";

export const ADMIN = { email: process.env.ADMIN_EMAIL!, password: process.env.ADMIN_PASSWORD! };

export async function login(page: Page) {
  await page.goto("/admin/login");
  await page.getByLabel("Email").fill(ADMIN.email);
  await page.getByLabel("Contraseña").fill(ADMIN.password);
  await page.getByRole("button", { name: "Ingresar" }).click();
  await expect(page).toHaveURL(/\/admin$/);
  await expect(page.getByRole("link", { name: "Dashboard" }).first()).toHaveAttribute("aria-current", "page");
}

export const overflowX = (page: Page) => page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
