import { beforeEach, describe, expect, it, vi } from "vitest";
import { render } from "vitest-browser-react";
import { useState } from "react";

import { createDataProvider } from "@/components/atomic-crm/providers/fakerest";
import { DEFAULT_USER } from "@/components/atomic-crm/providers/fakerest/authProvider";
import type { Db } from "@/components/atomic-crm/providers/fakerest/dataGenerator/types";
import type { Deal } from "@/components/atomic-crm/types";
import { buildCompany, createCrmDb, StoryWrapper } from "@/test/StoryWrapper";
import {
  useContactImport,
  type ContactImportSchema,
} from "../contacts/useContactImport";
import type { DataProvider } from "ra-core";
import { DataImportButton } from "./DataImportButton";
import { AllResources, SingleResource } from "./DataImportButton.stories";
import type { ImportRow, ProcessImportBatch } from "./types";
import { useCompanyImport } from "./useCompanyImport";
import { useDealImport } from "./useDealImport";

const mockIsMobile = vi.hoisted(() => vi.fn(() => false));
vi.mock("@/hooks/use-mobile", () => ({ useIsMobile: mockIsMobile }));

const listAll = (dataProvider: DataProvider, resource: string) =>
  dataProvider.getList(resource, {
    filter: {},
    pagination: { page: 1, perPage: 25 },
    sort: { field: "id", order: "ASC" },
  });

/** Imports one batch on click, so a test controls when the import starts. */
const ImportHarness = ({
  rows,
  useImport,
}: {
  rows: ImportRow[];
  useImport: () => ProcessImportBatch;
}) => {
  const processBatch = useImport();
  const [status, setStatus] = useState("ready");
  return (
    <>
      <button
        onClick={() => {
          setStatus("running");
          processBatch(rows).then(
            () => setStatus("imported"),
            () => setStatus("failed"),
          );
        }}
      >
        run import
      </button>
      <span>{status}</span>
    </>
  );
};

/** Renders the harness on its own data provider, so each test owns its records. */
const renderImport = async (
  useImport: () => ProcessImportBatch,
  rows: ImportRow[],
  db?: Partial<Db>,
) => {
  const dataProvider = createDataProvider({
    db: createCrmDb(db),
    latency: 0,
    silent: true,
  });
  const screen = await render(
    <StoryWrapper dataProvider={dataProvider}>
      <ImportHarness useImport={useImport} rows={rows} />
    </StoryWrapper>,
  );
  return { dataProvider, screen };
};

/** A CSV file as the file input would hand it to the dialog. */
const csvFile = (name: string, lines: string[]) =>
  new File([lines.join("\n")], name, { type: "text/csv" });

describe("DataImportButton", () => {
  beforeEach(() => {
    mockIsMobile.mockReturnValue(false);
  });

  it("offers every importable resource in the dialog", async () => {
    const screen = await render(<AllResources />);

    await screen.getByRole("button", { name: "Import data" }).click();

    await expect
      .element(screen.getByRole("heading", { name: "Import data" }))
      .toBeVisible();

    await screen.getByLabelText("Resource").click();
    const options = screen.getByRole("listbox");

    await expect.element(options.getByText("Contacts")).toBeVisible();
    await expect.element(options.getByText("Companies")).toBeVisible();
    await expect.element(options.getByText("Deals")).toBeVisible();
  });

  it.each([
    ["contacts", "Import contacts"],
    ["companies", "Import companies"],
    ["deals", "Import deals"],
  ] as const)(
    "imports %s from a dialog with no resource to pick",
    async (resource, heading) => {
      const screen = await render(<SingleResource resource={resource} />);

      await screen.getByRole("button", { name: "Import CSV" }).click();

      await expect
        .element(screen.getByRole("heading", { name: heading }))
        .toBeVisible();
      await expect
        .element(screen.getByLabelText("Resource"))
        .not.toBeInTheDocument();
    },
  );

  it("offers the sample CSV of the imported resource", async () => {
    const screen = await render(<SingleResource resource="deals" />);

    await screen.getByRole("button", { name: "Import CSV" }).click();

    await expect
      .element(screen.getByRole("link", { name: "Download CSV sample" }))
      .toHaveAttribute("download", "crm_deals_sample.csv");
  });

  it("imports companies, mapping sector labels and numeric columns", async () => {
    const { dataProvider, screen } = await renderImport(useCompanyImport, [
      {
        name: "Acme",
        sector: "Information Technology",
        size: 50,
        city: "New York",
        website: "https://acme.example",
      },
      { name: "Globex", sector: "Not a sector", size: null, city: null },
    ]);

    await screen.getByRole("button", { name: "run import" }).click();
    await expect.element(screen.getByText("imported")).toBeVisible();

    const { data: companies } = await listAll(dataProvider, "companies");
    expect(companies).toHaveLength(2);
    expect(companies[0]).toMatchObject({
      city: "New York",
      name: "Acme",
      sector: "information-technology",
      // 50 employees falls in the "50-249 employees" bucket
      size: 250,
      website: "https://acme.example",
    });
    // An unknown sector is dropped rather than stored as a free-text value
    expect(companies[1].sector).toBeUndefined();
    expect(companies[1].size).toBeUndefined();
  });

  it("coerces an arbitrary company size into a renderable bucket", async () => {
    const { dataProvider, screen } = await renderImport(useCompanyImport, [
      { name: "Acme", size: 42 },
    ]);

    await screen.getByRole("button", { name: "run import" }).click();
    await expect.element(screen.getByText("imported")).toBeVisible();

    const { data: companies } = await listAll(dataProvider, "companies");
    // 42 employees is not a bucket id; it belongs to "10-49 employees"
    expect(companies[0].size).toBe(50);
  });

  it("imports the humand prospecting columns of a company", async () => {
    const { dataProvider, screen } = await renderImport(useCompanyImport, [
      {
        name: "Burgess Hodgson",
        continent: "Europe",
        network: "Russell Bedford",
        headcount: 180.4,
        headcount_source: "Network press release",
        current_competitor: "microsoft-viva",
      },
      { name: "Unknown Co", continent: "Atlantis", current_competitor: "Acme" },
    ]);

    await screen.getByRole("button", { name: "run import" }).click();
    await expect.element(screen.getByText("imported")).toBeVisible();

    const { data: companies } = await listAll(dataProvider, "companies");
    expect(companies[0]).toMatchObject({
      // A choice may be given by its label or by its stored id
      continent: "europe",
      network: "Russell Bedford",
      headcount: 180,
      headcount_source: "Network press release",
      current_competitor: "microsoft-viva",
    });
    // Unknown choices are dropped rather than stored as free text
    expect(companies[1].continent).toBeUndefined();
    expect(companies[1].current_competitor).toBeUndefined();
  });

  it("imports the category and the referral company of a company", async () => {
    const { dataProvider, screen } = await renderImport(useCompanyImport, [
      { name: "Russell Bedford", category: "cliente, referido" },
      { name: "Acme", category: "Client", referred_by: "russell  BEDFORD" },
      { name: "Globex", category: null, referred_by: "Moore Global" },
      {
        name: "Network Co",
        category: null,
        description: "MULTIPLICADORA de contadores",
      },
      { name: "Plain Co", category: "", description: "A retail chain" },
    ]);

    await screen.getByRole("button", { name: "run import" }).click();
    await expect.element(screen.getByText("imported")).toBeVisible();

    const { data: companies } = await listAll(dataProvider, "companies");
    const byName = Object.fromEntries(
      companies.map((company) => [company.name, company]),
    );
    expect(companies).toHaveLength(6);
    expect(byName["Russell Bedford"]).toMatchObject({
      is_client: true,
      is_referral: true,
    });
    // The referral company is found whatever the case and spacing of its name
    expect(byName["Acme"]).toMatchObject({
      is_client: true,
      is_referral: false,
      referred_by_company_id: byName["Russell Bedford"].id,
    });
    // An unknown referral company is created as a referral company
    expect(byName["Moore Global"]).toMatchObject({
      is_client: false,
      is_referral: true,
    });
    expect(byName["Globex"]).toMatchObject({
      is_client: true,
      referred_by_company_id: byName["Moore Global"].id,
    });
    // With no category, a MULTIPLICADORA is a referral company
    expect(byName["Network Co"]).toMatchObject({
      is_client: false,
      is_referral: true,
    });
    expect(byName["Plain Co"]).toMatchObject({
      is_client: true,
      is_referral: false,
    });
  });

  it("makes an existing company named as a referrer a referral company", async () => {
    const { dataProvider, screen } = await renderImport(
      useCompanyImport,
      [{ name: "Acme", referred_by: "Globex" }],
      {
        companies: [
          buildCompany({
            id: 1,
            name: "Globex",
            is_client: true,
            is_referral: false,
          }),
        ],
      },
    );

    await screen.getByRole("button", { name: "run import" }).click();
    await expect.element(screen.getByText("imported")).toBeVisible();

    const { data: companies } = await listAll(dataProvider, "companies");
    expect(companies).toHaveLength(2);
    expect(companies[0]).toMatchObject({
      name: "Globex",
      is_client: true,
      is_referral: true,
    });
    expect(companies[1].referred_by_company_id).toBe(1);
  });

  it("reuses a company that exists already instead of duplicating it", async () => {
    const result = { value: undefined as unknown };
    const useRecordedImport = () => {
      const processBatch = useCompanyImport();
      return async (rows: ImportRow[]) => {
        result.value = await processBatch(rows);
        return result.value as number;
      };
    };
    const { dataProvider, screen } = await renderImport(
      useRecordedImport,
      [
        { name: "  ACME   corp " },
        { name: "Globex" },
        { name: "globex" },
        // The system company is never imported
        { name: "Por definir" },
      ],
      { companies: [buildCompany({ id: 1, name: "Acme Corp" })] },
    );

    await screen.getByRole("button", { name: "run import" }).click();
    await expect.element(screen.getByText("imported")).toBeVisible();

    const { data: companies } = await listAll(dataProvider, "companies");
    expect(companies.map(({ name }) => name)).toEqual(["Acme Corp", "Globex"]);
    // Two rows reused a company, the "Por definir" row failed
    expect(result.value).toEqual({
      created: 3,
      notices: { duplicateCompanies: 2 },
    });
  });

  it("imports a contact with no company into «Por definir»", async () => {
    const result = { value: undefined as unknown };
    const useRecordedImport = () => {
      const processBatch = useContactImport();
      return async (rows: ImportRow[]) => {
        result.value = await processBatch(rows as ContactImportSchema[]);
        return result.value as number;
      };
    };
    const placeholder = buildCompany({
      id: 7,
      name: "Por definir",
      is_placeholder: true,
      is_client: false,
      is_referral: false,
    });
    const { dataProvider, screen } = await renderImport(
      useRecordedImport,
      [
        { first_name: "Ada", last_name: "Lovelace", company: null },
        { first_name: "Grace", last_name: "Hopper", company: "  " },
        { first_name: "Alan", last_name: "Turing", company: "por  definir" },
        { first_name: "Linus", last_name: "Torvalds", company: "acme" },
      ],
      { companies: [placeholder, buildCompany({ id: 1, name: "Acme" })] },
    );

    await screen.getByRole("button", { name: "run import" }).click();
    await expect.element(screen.getByText("imported")).toBeVisible();

    const { data: contacts } = await listAll(dataProvider, "contacts");
    expect(
      contacts.map(({ first_name, company_id }) => ({
        first_name,
        company_id,
      })),
    ).toEqual([
      { first_name: "Ada", company_id: 7 },
      { first_name: "Grace", company_id: 7 },
      { first_name: "Alan", company_id: 7 },
      // An existing company is found whatever the case of its name
      { first_name: "Linus", company_id: 1 },
    ]);
    const { data: companies } = await listAll(dataProvider, "companies");
    expect(companies).toHaveLength(2);
    expect(result.value).toEqual({
      created: 4,
      notices: { placeholderContacts: 3 },
    });
  });

  it("creates the companies a contact CSV names as client companies", async () => {
    const useContactBatchImport = () => {
      const processBatch = useContactImport();
      return (rows: ImportRow[]) => processBatch(rows as ContactImportSchema[]);
    };
    const { dataProvider, screen } = await renderImport(useContactBatchImport, [
      { first_name: "Ada", last_name: "Lovelace", company: "Analytical Co" },
    ]);

    await screen.getByRole("button", { name: "run import" }).click();
    await expect.element(screen.getByText("imported")).toBeVisible();

    const { data: companies } = await listAll(dataProvider, "companies");
    expect(companies).toEqual([
      expect.objectContaining({
        name: "Analytical Co",
        is_client: true,
        is_referral: false,
      }),
    ]);
  });

  it("refuses a deal row with no company", async () => {
    const { dataProvider, screen } = await renderImport(useDealImport, [
      { name: "Orphan deal", company: null },
      { name: "Real deal", company: "Acme" },
    ]);

    await screen.getByRole("button", { name: "run import" }).click();
    await expect.element(screen.getByText("imported")).toBeVisible();

    const { data: deals } = await listAll(dataProvider, "deals");
    expect(deals.map(({ name }) => name)).toEqual(["Real deal"]);
    const { data: companies } = await listAll(dataProvider, "companies");
    expect(companies[0]).toMatchObject({ name: "Acme", is_client: true });
  });

  it("hides a resource the running app does not register", async () => {
    // The mobile app has no deals screens, so importing deals would create
    // records the user could never see.
    mockIsMobile.mockReturnValue(true);
    const screen = await render(<AllResources />);

    await screen.getByRole("button", { name: "Import data" }).click();
    await screen.getByLabelText("Resource").click();
    const options = screen.getByRole("listbox");

    await expect.element(options.getByText("Contacts")).toBeVisible();
    await expect.element(options.getByText("Deals")).not.toBeInTheDocument();
  });

  it("renders nothing for a resource the running app does not register", async () => {
    mockIsMobile.mockReturnValue(true);
    const screen = await render(<SingleResource resource="deals" />);

    await expect
      .element(screen.getByRole("button", { name: "Import CSV" }))
      .not.toBeInTheDocument();
  });

  it("imports deals, reusing one company and defaulting a missing stage", async () => {
    const { dataProvider, screen } = await renderImport(useDealImport, [
      {
        name: "New website",
        company: "Acme",
        category: "Website design",
        stage: "Proposal Sent",
        amount: "12000",
        expected_closing_date: "2026-09-30",
      },
      { name: "Print campaign", company: "Acme", stage: null },
    ]);

    await screen.getByRole("button", { name: "run import" }).click();
    await expect.element(screen.getByText("imported")).toBeVisible();

    const { data: companies } = await listAll(dataProvider, "companies");
    expect(companies).toHaveLength(1);
    expect(companies[0].name).toBe("Acme");

    const { data: deals } = await listAll(dataProvider, "deals");
    expect(deals).toHaveLength(2);
    expect(deals[0]).toMatchObject({
      amount: 12000,
      category: "website-design",
      company_id: companies[0].id,
      name: "New website",
      stage: "proposal-sent",
    });
    expect(deals[0].expected_closing_date).toBe("2026-09-30T00:00:00.000Z");
    // Both rows name the same company, which is created once and shared
    expect(deals[1].company_id).toBe(companies[0].id);
    // stage is required, so an empty cell falls back to the first stage
    expect(deals[1].stage).toBe("opportunity");
  });

  it("appends imported deals below the deals already in their stage", async () => {
    const { dataProvider, screen } = await renderImport(
      useDealImport,
      [
        { name: "First", company: "Acme", stage: "Opportunity" },
        { name: "Second", company: "Acme", stage: "Opportunity" },
        { name: "Other column", company: "Acme", stage: "Proposal Sent" },
      ],
      {
        deals: [
          { id: 1, name: "Already there", stage: "opportunity", index: 0 },
        ] as Deal[],
      },
    );

    await screen.getByRole("button", { name: "run import" }).click();
    await expect.element(screen.getByText("imported")).toBeVisible();

    const { data: deals } = await listAll(dataProvider, "deals");
    // The Kanban board sorts a column on `index` and reorders it by shifting
    // the indexes around the drop target, so two deals of one stage sharing an
    // index cannot be dragged at all
    expect(
      deals.map(({ name, stage, index }) => ({ name, stage, index })),
    ).toEqual([
      { name: "Already there", stage: "opportunity", index: 0 },
      { name: "First", stage: "opportunity", index: 1 },
      { name: "Second", stage: "opportunity", index: 2 },
      { name: "Other column", stage: "proposal-sent", index: 0 },
    ]);
  });

  it("imports a deal the dialog parsed, down to its owner", async () => {
    const dataProvider = createDataProvider({
      db: createCrmDb(),
      latency: 0,
      silent: true,
    });
    const screen = await render(
      <StoryWrapper dataProvider={dataProvider}>
        <DataImportButton />
      </StoryWrapper>,
    );

    await screen.getByRole("button", { name: "Import data" }).click();
    await screen.getByLabelText("Resource").click();
    await screen.getByRole("listbox").getByText("Deals").click();

    await screen
      .getByLabelText("CSV File")
      .upload(
        csvFile("deals.csv", [
          "name,company,stage,amount,expected_closing_date",
          "New website,Acme,Proposal Sent,4500.50,2026-09-30",
        ]),
      );
    await screen.getByRole("button", { name: "Start import" }).click();

    await expect.element(screen.getByText(/Import complete/)).toBeVisible();

    const { data: deals } = await listAll(dataProvider, "deals");
    expect(deals).toHaveLength(1);
    // The hooks are read through the dialog rather than called directly, so the
    // wiring this feature adds is covered too — the owner in particular, which
    // the dialog is the only thing to bring in
    expect(deals[0]).toMatchObject({
      // A fractional amount would make the bigint column reject the row
      amount: 4501,
      sales_id: DEFAULT_USER.id,
      stage: "proposal-sent",
    });
    expect(deals[0].expected_closing_date).toBe("2026-09-30T00:00:00.000Z");
  });

  it("keeps the leading zero of the text columns of a company CSV", async () => {
    const dataProvider = createDataProvider({
      db: createCrmDb(),
      latency: 0,
      silent: true,
    });
    const screen = await render(
      <StoryWrapper dataProvider={dataProvider}>
        <DataImportButton resource="companies" />
      </StoryWrapper>,
    );

    await screen.getByRole("button", { name: "Import CSV" }).click();
    await screen
      .getByLabelText("CSV File")
      .upload(
        csvFile("companies.csv", [
          "name,zipcode,phone_number,tax_identifier",
          "Acme,02134,0155123456,0123456789",
        ]),
      );
    await screen.getByRole("button", { name: "Start import" }).click();

    await expect.element(screen.getByText(/Import complete/)).toBeVisible();

    const { data: companies } = await listAll(dataProvider, "companies");
    expect(companies[0]).toMatchObject({
      phone_number: "0155123456",
      tax_identifier: "0123456789",
      zipcode: "02134",
    });
  });

  it("keeps the leading zero of the phone columns of a contact CSV", async () => {
    const dataProvider = createDataProvider({
      db: createCrmDb(),
      latency: 0,
      silent: true,
    });
    const screen = await render(
      <StoryWrapper dataProvider={dataProvider}>
        <DataImportButton resource="contacts" />
      </StoryWrapper>,
    );

    await screen.getByRole("button", { name: "Import CSV" }).click();
    await screen
      .getByLabelText("CSV File")
      .upload(
        csvFile("contacts.csv", [
          "first_name,last_name,phone_work,phone_home,phone_other",
          "Jane,Doe,0155123456,0033123456,0987654321",
        ]),
      );
    await screen.getByRole("button", { name: "Start import" }).click();

    await expect.element(screen.getByText(/Import complete/)).toBeVisible();

    const { data: contacts } = await listAll(dataProvider, "contacts");
    // Stored as numbers, these would lose their leading zero and stop matching
    // the `{ number: string }` the column declares
    expect(contacts[0].phone_jsonb).toEqual([
      { number: "0155123456", type: "Work" },
      { number: "0033123456", type: "Home" },
      { number: "0987654321", type: "Other" },
    ]);
  });

  it("reports as errors only the rows the backend refused", async () => {
    const dataProvider = createDataProvider({
      db: createCrmDb(),
      latency: 0,
      silent: true,
    });
    const screen = await render(
      <StoryWrapper
        dataProvider={{
          ...dataProvider,
          // `name` is NOT NULL in the database
          create: (resource, params) =>
            resource === "companies" && params.data.name === undefined
              ? Promise.reject(new Error("null value in column name"))
              : dataProvider.create(resource, params),
        }}
      >
        <DataImportButton resource="companies" />
      </StoryWrapper>,
    );

    await screen.getByRole("button", { name: "Import CSV" }).click();
    await screen
      .getByLabelText("CSV File")
      .upload(
        csvFile("companies.csv", [
          "name,city",
          "Acme,New York",
          ",Boston",
          "Globex,Paris",
        ]),
      );
    await screen.getByRole("button", { name: "Start import" }).click();

    // A rejected row used to fail the accounting of its whole batch, so users
    // re-imported a file whose records had in fact been created
    await expect
      .element(
        screen.getByText("Import complete. Imported 2 records, with 1 errors"),
      )
      .toBeVisible();

    const { data: companies } = await listAll(dataProvider, "companies");
    expect(companies.map(({ name }) => name)).toEqual(["Acme", "Globex"]);
  });
});
