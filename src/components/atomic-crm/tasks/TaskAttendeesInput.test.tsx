import {
  RecordContextProvider,
  useDataProvider,
  type DataProvider,
} from "ra-core";
import { render } from "vitest-browser-react";

import {
  StoryWrapper,
  buildCompany,
  buildContact,
  buildDeal,
  buildSale,
} from "@/test/StoryWrapper";
import { AddTask } from "./AddTask";

// Dan works for a consultancy, but takes part in the deal
const deal = buildDeal({
  id: 1,
  name: "Acme rollout",
  company_id: 1,
  contact_ids: [4],
});

let dataProvider: DataProvider | null = null;
const DataProviderListener = () => {
  dataProvider = useDataProvider();
  return null;
};

const renderAddTask = () =>
  render(
    <StoryWrapper
      data={{
        companies: [
          buildCompany({ id: 1, name: "Acme", referred_by_company_id: 2 }),
          buildCompany({ id: 2, name: "Partner", is_referral: true }),
          buildCompany({ id: 3, name: "Consulting" }),
        ],
        contacts: [
          buildContact({
            id: 1,
            first_name: "Ana",
            last_name: "Client",
            company_id: 1,
            email_jsonb: [
              { email: "ana@acme.example", type: "Work" },
              { email: "ana.home@mail.example", type: "Home" },
            ],
          }),
          buildContact({
            id: 2,
            first_name: "Rita",
            last_name: "Referrer",
            company_id: 2,
            email_jsonb: [{ email: "rita@partner.example", type: "Work" }],
          }),
          buildContact({
            id: 3,
            first_name: "Nomail",
            last_name: "Client",
            company_id: 1,
            email_jsonb: [],
          }),
          buildContact({
            id: 4,
            first_name: "Dan",
            last_name: "Consultant",
            company_id: 3,
            email_jsonb: [{ email: "dan@consulting.example", type: "Work" }],
          }),
        ],
        deals: [deal],
        sales: [
          buildSale(),
          buildSale({
            id: 99,
            first_name: "Teo",
            last_name: "Team",
            email: "teo@humand.example",
            user_id: "99",
          }),
        ],
      }}
    >
      <DataProviderListener />
      <RecordContextProvider value={deal}>
        <AddTask />
      </RecordContextProvider>
    </StoryWrapper>,
  );

describe("Task guests", () => {
  it("invites every email of everyone involved to a new demo, all checked", async () => {
    const screen = await renderAddTask();

    await screen.getByRole("button", { name: "Add task" }).click();
    await expect.element(screen.getByText("Guests")).not.toBeInTheDocument();

    const [typeInput] = screen.getByRole("combobox").all();
    await typeInput.click();
    await screen.getByRole("listbox").getByText("Demo").click();

    await expect.element(screen.getByText("Guests")).toBeVisible();
    for (const email of [
      "ana@acme.example",
      "ana.home@mail.example",
      "dan@consulting.example",
      "rita@partner.example",
      "teo@humand.example",
    ]) {
      await expect
        .element(screen.getByRole("checkbox", { name: new RegExp(email) }))
        .toBeChecked();
    }
    // Contacts without an email and the current user are not offered
    await expect
      .element(screen.getByText("Nomail Client"))
      .not.toBeInTheDocument();
    expect(screen.getByRole("checkbox").all()).toHaveLength(5);

    await screen
      .getByRole("checkbox", { name: /rita@partner\.example/ })
      .click();
    await expect
      .element(screen.getByRole("checkbox", { name: /rita@partner\.example/ }))
      .not.toBeChecked();
  });

  it("saves a demo without description, titled after its company", async () => {
    const screen = await renderAddTask();

    await screen.getByRole("button", { name: "Add task" }).click();
    const [typeInput] = screen.getByRole("combobox").all();
    await typeInput.click();
    await screen.getByRole("listbox").getByText("Demo").click();

    const title = screen.getByRole("textbox", { name: "Meeting title" });
    await expect.element(title).toHaveValue("Demo - Acme");

    // Switching to a meeting follows the type, as the title was not edited
    await typeInput.click();
    await screen.getByRole("listbox").getByText("Meeting").click();
    await expect.element(title).toHaveValue("Meeting - Acme");

    await title.fill("Kickoff Acme");
    await screen.getByRole("button", { name: /^save$/i }).click();

    await expect
      .poll(async () => {
        const { data } = await dataProvider!.getList("tasks", {
          filter: {},
          pagination: { page: 1, perPage: 10 },
          sort: { field: "id", order: "ASC" },
        });
        return data[0];
      })
      .toMatchObject({
        deal_id: 1,
        type: "meeting",
        meeting_title: "Kickoff Acme",
        attendees: expect.arrayContaining([
          { email: "ana.home@mail.example", name: "Ana Client" },
          { email: "dan@consulting.example", name: "Dan Consultant" },
        ]),
      });
  });
});
