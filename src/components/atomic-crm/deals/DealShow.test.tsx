import { ResourceContextProvider } from "ra-core";
import { render } from "vitest-browser-react";

import { DealShow } from "./DealShow";

import { StoryWrapper, buildCompany, buildDeal } from "@/test/StoryWrapper";

describe("DealShow", () => {
  it("opens a deal that has no expected closing date", async () => {
    // Arrange: imported deals can come without a closing date
    const deal = buildDeal({
      id: 1,
      name: "Intranet",
      expected_closing_date: null as unknown as string,
    });

    // Act
    const screen = await render(
      <StoryWrapper data={{ companies: [buildCompany()], deals: [deal] }}>
        <ResourceContextProvider value="deals">
          <DealShow open id="1" />
        </ResourceContextProvider>
      </StoryWrapper>,
    );

    // Assert: the deal is shown, with a dash instead of a date
    await expect
      .element(screen.getByRole("heading", { name: "Intranet" }))
      .toBeVisible();
    await expect.element(screen.getByText("—").first()).toBeVisible();
  });
});
