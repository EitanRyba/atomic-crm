import { render } from "vitest-browser-react";
import { page } from "vitest/browser";

import { StoryWrapper } from "@/test/StoryWrapper";
import { validateCompanyCategories } from "./companyCategories";
import { CompanyCreate } from "./CompanyCreate";

const renderCompanyCreate = (create = vi.fn()) =>
  render(
    <StoryWrapper
      initialEntries={["/companies/create"]}
      dataProvider={{
        create: async (resource, params) => {
          create(resource, params);
          return { data: { id: 1, ...params.data } as any };
        },
      }}
    >
      <CompanyCreate />
    </StoryWrapper>,
  );

const fillNewContact = async (
  screen: Awaited<ReturnType<typeof renderCompanyCreate>>,
) => {
  await screen.getByRole("radio", { name: "New contact" }).click();
  await screen.getByRole("textbox", { name: "First name" }).fill("Ada");
  await screen.getByRole("textbox", { name: "Last name" }).fill("Lovelace");
  await screen.getByRole("textbox", { name: "Email" }).fill("ada@acme.example");
};

describe("validateCompanyCategories", () => {
  it("accepts a client company, a referral company, or both", () => {
    expect(
      validateCompanyCategories(true, { is_client: true, is_referral: false }),
    ).toBeUndefined();
    expect(
      validateCompanyCategories(false, { is_client: false, is_referral: true }),
    ).toBeUndefined();
    expect(
      validateCompanyCategories(true, { is_client: true, is_referral: true }),
    ).toBeUndefined();
  });

  it("refuses a company with no category", () => {
    expect(
      validateCompanyCategories(false, {
        is_client: false,
        is_referral: false,
      }),
    ).toBe("resources.companies.validation.category_required");
  });
});

describe("CompanyCreate", () => {
  beforeAll(() => {
    page.viewport(1600, 900);
  });

  it("refuses to save a company with no category", async () => {
    const create = vi.fn();
    const screen = await renderCompanyCreate(create);

    await screen.getByPlaceholder("Company name").fill("Acme");
    await screen.getByRole("checkbox", { name: "Client company" }).click();
    await screen.getByRole("button", { name: /create company/i }).click();

    await expect
      .element(screen.getByText("Select at least one category"))
      .toBeVisible();
    expect(create).not.toHaveBeenCalled();

    // Checking the other category clears the error and saves
    await screen.getByRole("checkbox", { name: "Referrer company" }).click();
    await expect
      .element(screen.getByText("Select at least one category"))
      .not.toBeInTheDocument();
    await fillNewContact(screen);
    await screen.getByRole("button", { name: /create company/i }).click();

    await expect
      .poll(() => create)
      .toHaveBeenCalledWith(
        "companies",
        expect.objectContaining({
          data: expect.objectContaining({
            name: "Acme",
            is_client: false,
            is_referral: true,
            referred_by_company_id: null,
          }),
        }),
      );
  });

  it("refuses to save a company with no contact", async () => {
    const create = vi.fn();
    const screen = await renderCompanyCreate(create);

    await screen.getByPlaceholder("Company name").fill("Acme");
    // The form starts with one contact row: remove it
    screen.container
      .querySelector<HTMLButtonElement>(".button-remove-company_contacts-0")!
      .click();
    await screen.getByRole("button", { name: /create company/i }).click();

    await expect
      .element(screen.getByText("Link at least one contact to the company"))
      .toBeVisible();
    expect(create).not.toHaveBeenCalled();
  });

  it("creates the new contacts of the company in it", async () => {
    const create = vi.fn();
    const screen = await renderCompanyCreate(create);

    await screen.getByPlaceholder("Company name").fill("Acme");
    await fillNewContact(screen);
    await screen.getByRole("button", { name: /create company/i }).click();

    await expect
      .poll(() => create)
      .toHaveBeenCalledWith(
        "contacts",
        expect.objectContaining({
          data: expect.objectContaining({
            first_name: "Ada",
            last_name: "Lovelace",
            email_jsonb: [{ email: "ada@acme.example", type: "Work" }],
            company_id: 1,
          }),
        }),
      );
    expect(create).toHaveBeenCalledWith(
      "companies",
      expect.objectContaining({
        data: expect.not.objectContaining({
          company_contacts: expect.anything(),
        }),
      }),
    );
  });

  it("offers the referral company only for a client company", async () => {
    const screen = await renderCompanyCreate();

    await expect
      .element(screen.getByRole("combobox", { name: "Referred by" }))
      .toBeVisible();
    await screen.getByRole("checkbox", { name: "Client company" }).click();
    await expect
      .element(screen.getByRole("combobox", { name: "Referred by" }))
      .not.toBeInTheDocument();
  });
});
