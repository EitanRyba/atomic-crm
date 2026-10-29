import { render } from "vitest-browser-react";
import { page } from "vitest/browser";

import { BillingWithOneContract } from "./Billing.stories";

describe("Billing", () => {
  beforeAll(() => {
    page.viewport(1600, 900);
  });

  it("projects the commission and the sub-commission month by month", async () => {
    // Arrange / Act
    const screen = await render(<BillingWithOneContract />);

    // Assert: 50% of a 1000 fee, 20% of it to the referral company
    await expect.element(screen.getByText("(month 1)")).toBeVisible();
    const firstMonth = screen.getByRole("row", { name: /\(month 1\)/ });
    await expect.element(firstMonth.getByText("$1,000.00")).toBeVisible();
    await expect.element(firstMonth.getByText("$500.00")).toBeVisible();
    await expect.element(firstMonth.getByText("$100.00")).toBeVisible();
    await expect.element(firstMonth.getByText("$400.00")).toBeVisible();
  });

  it("marks a past sub-commission as paid, and back to pending", async () => {
    // Arrange
    const screen = await render(<BillingWithOneContract />);
    const firstMonth = screen.getByRole("row", { name: /\(month 1\)/ });
    await expect
      .element(firstMonth.getByText("Pending", { exact: true }))
      .toBeVisible();

    // Act
    await firstMonth.getByRole("button", { name: "Mark paid" }).click();

    // Assert
    await expect
      .element(firstMonth.getByText("Paid", { exact: true }))
      .toBeVisible();

    // Act: undo
    await firstMonth.getByRole("button", { name: "Mark pending" }).click();

    // Assert
    await expect
      .element(firstMonth.getByText("Pending", { exact: true }))
      .toBeVisible();
  });

  it("shows future sub-commissions as projected, not payable yet", async () => {
    // Arrange / Act
    const screen = await render(<BillingWithOneContract />);

    // Assert: month 4 is next month
    const nextMonth = screen.getByRole("row", { name: /\(month 4\)/ });
    await expect
      .element(nextMonth.getByText("Projected", { exact: true }))
      .toBeVisible();
    await expect
      .element(nextMonth.getByRole("button", { name: "Mark paid" }))
      .not.toBeInTheDocument();
  });
});
