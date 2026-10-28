import { render } from "vitest-browser-react";

import { DealPageTags } from "./DealTags.stories";

describe("Deal tags", () => {
  it("adds a tag of the deal's stage, describes it, then keeps it in the history once removed", async () => {
    // Arrange
    const screen = await render(<DealPageTags />);
    await expect.element(screen.getByText("Previous tags (1)")).toBeVisible();

    // Act: add a tag of the current stage
    await screen.getByRole("button", { name: "Tag" }).click();
    await expect
      .element(screen.getByRole("button", { name: "Pain identified" }))
      .not.toBeInTheDocument();
    await screen.getByRole("button", { name: "Proposal sent" }).click();

    // Act: describe it
    await screen.getByRole("button", { name: "Proposal sent" }).click();
    await screen
      .getByRole("textbox", { name: "Description" })
      .fill("Sent to the HR director");
    await screen.getByRole("button", { name: "Save" }).click();
    // Wait for the editor to close before opening it again
    await expect
      .element(screen.getByRole("textbox", { name: "Description" }))
      .not.toBeInTheDocument();

    // Assert: the description is kept
    await screen.getByRole("button", { name: "Proposal sent" }).click();
    await expect
      .element(screen.getByRole("textbox", { name: "Description" }))
      .toHaveValue("Sent to the HR director");

    // Act: remove it
    await screen.getByRole("button", { name: "Remove tag" }).click();

    // Assert: it moved to the history, with its description
    await expect.element(screen.getByText("Previous tags (2)")).toBeVisible();
    await screen.getByText("Previous tags (2)").click();
    await expect
      .element(screen.getByText("Sent to the HR director"))
      .toBeVisible();
  });

  it("limits a tag description to 200 characters", async () => {
    // Arrange
    const screen = await render(<DealPageTags />);
    await screen.getByRole("button", { name: "Tag" }).click();
    await screen.getByRole("button", { name: "Proposal sent" }).click();
    await screen.getByRole("button", { name: "Proposal sent" }).click();

    // Act
    await screen
      .getByRole("textbox", { name: "Description" })
      .fill("x".repeat(250));

    // Assert
    await expect.element(screen.getByText("200/200")).toBeVisible();
  });
});
