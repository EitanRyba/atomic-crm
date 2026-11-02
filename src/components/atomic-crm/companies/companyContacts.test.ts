import type { DataProvider } from "ra-core";

import {
  createCompanyWithContacts,
  validateCompanyContacts,
} from "./companyContacts";

describe("validateCompanyContacts", () => {
  it("requires at least one contact", () => {
    expect(validateCompanyContacts([])).toBe(
      "resources.companies.validation.contacts_required",
    );
    expect(validateCompanyContacts(undefined)).toBe(
      "resources.companies.validation.contacts_required",
    );
  });

  it("requires an existing contact to be picked", () => {
    expect(validateCompanyContacts([{ mode: "existing" }])).toBe(
      "resources.companies.validation.contact_missing",
    );
  });

  it("requires the name and a valid email of a new contact", () => {
    expect(
      validateCompanyContacts([
        { mode: "new", first_name: "Ada", last_name: "Lovelace", email: "ada" },
      ]),
    ).toBe("resources.companies.validation.contact_incomplete");
  });

  it("accepts picked and complete new contacts", () => {
    expect(
      validateCompanyContacts([
        { mode: "existing", contact_id: 7 },
        {
          mode: "new",
          first_name: "Ada",
          last_name: "Lovelace",
          email: "ada@acme.example",
        },
      ]),
    ).toBeUndefined();
  });
});

const fakeDataProvider = () => {
  const calls: { method: string; resource: string; params: any }[] = [];
  const dataProvider = {
    create: async (resource: string, params: any) => {
      calls.push({ method: "create", resource, params });
      return {
        data: { id: resource === "companies" ? 42 : 100, ...params.data },
      };
    },
    getOne: async (resource: string, params: any) => {
      calls.push({ method: "getOne", resource, params });
      return { data: { id: params.id, first_name: "Grace", company_id: 1 } };
    },
    update: async (resource: string, params: any) => {
      calls.push({ method: "update", resource, params });
      return { data: { ...params.previousData, ...params.data } };
    },
  } as unknown as DataProvider;
  return { calls, dataProvider };
};

describe("createCompanyWithContacts", () => {
  it("creates the company, its new contacts, and moves the existing ones", async () => {
    const { calls, dataProvider } = fakeDataProvider();

    const { company, failedContacts } = await createCompanyWithContacts(
      dataProvider,
      {
        name: "Acme",
        website: "acme.example",
        is_client: true,
        company_contacts: [
          {
            mode: "new",
            first_name: " Ada ",
            last_name: "Lovelace",
            email: "ada@acme.example",
          },
          { mode: "existing", contact_id: 7 },
          { mode: "existing", contact_id: 7 },
        ],
      },
      3,
    );

    expect(company.id).toBe(42);
    expect(failedContacts).toBe(0);
    const companyCreate = calls.find((call) => call.resource === "companies");
    expect(companyCreate?.params.data).toMatchObject({
      name: "Acme",
      website: "https://acme.example",
    });
    expect(companyCreate?.params.data).not.toHaveProperty("company_contacts");

    const contactCreate = calls.find(
      (call) => call.method === "create" && call.resource === "contacts",
    );
    expect(contactCreate?.params.data).toMatchObject({
      first_name: "Ada",
      last_name: "Lovelace",
      email_jsonb: [{ email: "ada@acme.example", type: "Work" }],
      company_id: 42,
      sales_id: 3,
    });

    // The same existing contact picked twice is moved once
    const updates = calls.filter((call) => call.method === "update");
    expect(updates).toHaveLength(1);
    expect(updates[0].params).toMatchObject({
      id: 7,
      data: { company_id: 42 },
    });
  });

  it("counts the contacts that could not be saved", async () => {
    const { dataProvider } = fakeDataProvider();
    dataProvider.update = async () => {
      throw new Error("forbidden");
    };

    const { failedContacts } = await createCompanyWithContacts(dataProvider, {
      name: "Acme",
      company_contacts: [{ mode: "existing", contact_id: 7 }],
    });

    expect(failedContacts).toBe(1);
  });
});
