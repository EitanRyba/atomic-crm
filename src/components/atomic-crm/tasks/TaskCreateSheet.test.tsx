import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";
import { Mobile } from "./TaskCreateSheet.stories";
import { useDataProvider, type DataProvider } from "ra-core";
import { buildCompany, buildDeal } from "@/test/StoryWrapper";

describe("TaskCreateSheet", () => {
  it("creates a task for a selected deal", async () => {
    let dataProvider: DataProvider | null = null;
    const DataProviderListener = () => {
      dataProvider = useDataProvider();
      return null;
    };

    const screen = await render(
      <Mobile
        data={{
          companies: [
            buildCompany({ id: 1, name: "Acme" }),
            buildCompany({ id: 2, name: "Globex" }),
          ],
          deals: [
            buildDeal({ id: 1, name: "Acme rollout", company_id: 1 }),
            buildDeal({ id: 2, name: "Globex pilot", company_id: 2 }),
          ],
          tasks: [
            {
              deal_id: 1,
              due_date: "2025-01-03T12:00:00.000Z",
              id: 1,
              sales_id: 0,
              text: "Existing seeded task",
              type: "email",
            },
          ],
        }}
      >
        <DataProviderListener />
      </Mobile>,
    );

    await screen
      .getByLabelText(/description/i)
      .fill("Follow up about onboarding");

    const [dealInput, typeInput] = screen.getByRole("combobox").all();

    await dealInput.click();
    await screen.getByText("Globex pilot").click();

    await typeInput.click();
    const typeOptions = screen.getByRole("listbox");
    await typeOptions.getByText("Call").click();

    const dueDateInput = screen.getByLabelText(/due date/i);
    await dueDateInput.clear();
    await dueDateInput.fill("2026-03-06T12:30");

    await screen.getByRole("button", { name: /^save$/i }).click();

    await expect.element(screen.getByText("Task added")).toBeInTheDocument();

    await expect
      .poll(async () => {
        const { data } = await dataProvider!.getList("tasks", {
          filter: {},
          pagination: { page: 1, perPage: 10 },
          sort: { field: "id", order: "ASC" },
        });
        return data.find((task) => task.text === "Follow up about onboarding");
      })
      .toMatchObject({
        deal_id: 2,
        text: "Follow up about onboarding",
        type: "call",
        attendees: [],
      });
  });
});
