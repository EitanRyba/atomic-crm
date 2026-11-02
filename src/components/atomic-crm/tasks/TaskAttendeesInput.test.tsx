import { RecordContextProvider } from "ra-core";
import { render } from "vitest-browser-react";

import {
  StoryWrapper,
  buildCompany,
  buildContact,
  buildDeal,
  buildSale,
} from "@/test/StoryWrapper";
import { AddTask } from "./AddTask";

const deal = buildDeal({ id: 1, name: "Acme rollout", company_id: 1 });

const renderAddTask = () =>
  render(
    <StoryWrapper
      data={{
        companies: [
          buildCompany({ id: 1, name: "Acme", referred_by_company_id: 2 }),
          buildCompany({ id: 2, name: "Partner", is_referral: true }),
        ],
        contacts: [
          buildContact({
            id: 1,
            first_name: "Ana",
            last_name: "Client",
            company_id: 1,
            email_jsonb: [{ email: "ana@acme.example", type: "Work" }],
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
      <RecordContextProvider value={deal}>
        <AddTask />
      </RecordContextProvider>
    </StoryWrapper>,
  );

describe("Task guests", () => {
  it("invites everyone with an email to a new demo, all checked", async () => {
    const screen = await renderAddTask();

    await screen.getByRole("button", { name: "Add task" }).click();
    await expect.element(screen.getByText("Guests")).not.toBeInTheDocument();

    const [typeInput] = screen.getByRole("combobox").all();
    await typeInput.click();
    await screen.getByRole("listbox").getByText("Demo").click();

    await expect.element(screen.getByText("Guests")).toBeVisible();
    for (const email of [
      "ana@acme.example",
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
    expect(screen.getByRole("checkbox").all()).toHaveLength(3);

    await screen
      .getByRole("checkbox", { name: /rita@partner\.example/ })
      .click();
    await expect
      .element(screen.getByRole("checkbox", { name: /rita@partner\.example/ }))
      .not.toBeChecked();
  });
});
