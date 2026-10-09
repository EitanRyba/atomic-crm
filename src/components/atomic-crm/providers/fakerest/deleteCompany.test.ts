import type { Company, Contact } from "../../types";
import { buildCompany, buildContact, createCrmDb } from "@/test/StoryWrapper";
import { createDataProvider } from "./dataProvider";

const setup = () =>
  createDataProvider({
    db: createCrmDb({
      companies: [
        buildCompany({
          id: 1,
          name: "Por definir",
          is_placeholder: true,
          is_client: false,
          is_referral: false,
          nb_contacts: 0,
        }),
        buildCompany({ id: 2, name: "Acme", nb_contacts: 2, is_client: true }),
      ],
      contacts: [
        buildContact({ id: 1, company_id: 2, first_name: "Ada" }),
        buildContact({ id: 2, company_id: 2, first_name: "Grace" }),
      ],
    }),
    latency: 0,
    silent: true,
  });

const listAll = async <T extends { id: unknown }>(
  dataProvider: ReturnType<typeof setup>,
  resource: string,
) =>
  (
    await dataProvider.getList<T & { id: number }>(resource, {
      filter: {},
      pagination: { page: 1, perPage: 100 },
      sort: { field: "id", order: "ASC" },
    })
  ).data;

describe("FakeRest deleteCompany", () => {
  it("moves the contacts of the company to «Por definir»", async () => {
    const dataProvider = setup();

    expect(await dataProvider.deleteCompany(2, "move")).toBe(2);

    const companies = await listAll<Company>(dataProvider, "companies");
    expect(companies.map(({ name }) => name)).toEqual(["Por definir"]);
    expect(companies[0].nb_contacts).toBe(2);
    const contacts = await listAll<Contact>(dataProvider, "contacts");
    expect(contacts).toEqual([
      expect.objectContaining({ id: 1, company_id: 1 }),
      expect.objectContaining({ id: 2, company_id: 1 }),
    ]);
    expect(contacts.every((contact) => contact.company_is_placeholder)).toBe(
      true,
    );
  });

  it("deletes the contacts with the company", async () => {
    const dataProvider = setup();

    expect(await dataProvider.deleteCompany(2, "delete")).toBe(2);

    expect(await listAll<Contact>(dataProvider, "contacts")).toEqual([]);
    expect(await listAll<Company>(dataProvider, "companies")).toHaveLength(1);
  });

  it("never deletes «Por definir»", async () => {
    const dataProvider = setup();

    await expect(dataProvider.deleteCompany(1, "move")).rejects.toThrow(
      "The system company cannot be deleted",
    );
  });

  it("refuses to rename «Por definir» or to give it a category", async () => {
    const dataProvider = setup();
    const { data: placeholder } = await dataProvider.getOne<Company>(
      "companies",
      { id: 1 },
    );

    await expect(
      dataProvider.update("companies", {
        id: 1,
        data: { name: "Unknown" },
        previousData: placeholder,
      }),
    ).rejects.toThrow("cannot be renamed");
    await expect(
      dataProvider.update("companies", {
        id: 1,
        data: { is_client: true },
        previousData: placeholder,
      }),
    ).rejects.toThrow("cannot have categories");
  });

  it("refuses a deal on «Por definir»", async () => {
    const dataProvider = setup();

    await expect(
      dataProvider.create("deals", {
        data: { name: "Deal", company_id: 1, stage: "opportunity" },
      }),
    ).rejects.toThrow("Deals cannot be linked to the system company");
  });
});
