import { expect, test } from "./fixtures";

// The app starts in Spanish whatever the browser language, so the spec reads
// the Spanish labels.
test.describe("company categories and the «Por definir» company", () => {
  test.beforeEach(async ({ createSales }) => {
    await createSales({
      first_name: "John",
      last_name: "Doe",
      email: "john@doe.com",
      password: "password",
    });
  });

  test("user classifies companies and assigns contacts to them", async ({
    page,
    isMobile,
  }) => {
    test.skip(isMobile, "Company and contact forms are desktop pages");

    await page.goto("/");
    await page.getByLabel("Email").fill("john@doe.com");
    await page.getByLabel("Contraseña").fill("password");
    await page.getByRole("button", { name: "Iniciar sesión" }).click();
    await expect(page.getByRole("link", { name: "Contactos" })).toBeVisible();

    // A referral company
    await page.goto("/#/companies/create");
    await page.getByPlaceholder("Nombre de la empresa").fill("Estudio Moore");
    await page.getByRole("checkbox", { name: "Empresa cliente" }).click();
    await page.getByRole("checkbox", { name: "Empresa de referido" }).click();
    await page.getByRole("button", { name: "Crear empresa" }).click();
    await expect(
      page.getByRole("heading", { name: "Estudio Moore" }),
    ).toBeVisible();
    await expect(page.getByText("Referido", { exact: true })).toBeVisible();

    // A client company referred by it
    await page.goto("/#/companies/create");
    await page.getByPlaceholder("Nombre de la empresa").fill("Acme SA");
    await expect(
      page.getByRole("checkbox", { name: "Empresa cliente" }),
    ).toBeChecked();
    await page.getByRole("combobox", { name: /^Referida por/ }).click();
    await page.getByRole("option", { name: "Estudio Moore" }).click();
    await page.getByRole("button", { name: "Crear empresa" }).click();
    await expect(page.getByRole("heading", { name: "Acme SA" })).toBeVisible();
    await expect(page.getByText("Cliente", { exact: true })).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Estudio Moore" }),
    ).toBeVisible();

    // A contact cannot be saved without a company
    await page.goto("/#/contacts/create");
    await page.getByLabel(/^Nombre/).fill("Ada");
    await page.getByLabel(/^Apellido/).fill("Lovelace");
    await page.getByRole("button", { name: "Guardar" }).click();
    await expect(
      page.getByText(
        "Elegí la empresa del contacto. Si todavía no la sabés, elegí «Por definir»",
      ),
    ).toBeVisible();

    // ... so it goes to "Por definir", offered first
    await page.getByRole("combobox", { name: /^Empresa/ }).click();
    await expect(page.getByRole("option").first()).toHaveText(/Por definir/);
    await page.getByRole("option", { name: "Por definir" }).click();
    await page.getByRole("button", { name: "Guardar" }).click();
    await expect(page.getByText("Empresa por definir")).toBeVisible();

    // Then it is assigned to its real company
    await page.getByRole("button", { name: "Asignar empresa" }).click();
    const dialog = page.getByRole("dialog");
    await dialog.getByRole("combobox", { name: /^Empresa/ }).click();
    await page.getByRole("option", { name: "Acme SA" }).click();
    await dialog.getByRole("button", { name: "Asignar empresa" }).click();
    await expect(page.getByText("Empresa por definir")).not.toBeVisible();
    await expect(page.getByRole("link", { name: /Acme SA/ })).toBeVisible();

    // Deleting the company moves its contact back to "Por definir"
    await page
      .getByRole("link", { name: /Acme SA/ })
      .first()
      .click();
    await expect(page.getByRole("heading", { name: "Acme SA" })).toBeVisible();
    await page.getByRole("button", { name: "Eliminar" }).click();
    await expect(
      page.getByText("¿Qué hacemos con sus 1 contacto?"),
    ).toBeVisible();
    await page
      .getByRole("button", { name: "Moverlos a «Por definir»" })
      .click();
    await expect(page.getByText("Empresa eliminada")).toBeVisible();

    await page.getByRole("link", { name: "Contactos" }).click();
    await expect(page.getByText("Ada Lovelace")).toBeVisible();
    await expect(page.getByText("Empresa por definir")).toBeVisible();
  });
});
