import { render } from "vitest-browser-react";

import { WithNotifications } from "./NotificationsBell.stories";

describe("NotificationsBell", () => {
  it("counts only the user's unread notifications, and clears them", async () => {
    // Arrange
    const screen = await render(<WithNotifications />);
    const bell = screen.getByRole("button", { name: "2 unread notifications" });
    await expect.element(bell).toBeVisible();

    // Act
    await bell.click();

    // Assert: the user's two notifications, not someone else's
    await expect
      .element(screen.getByText('"Intranet" is back in Discovery'))
      .toBeVisible();
    await expect
      .element(screen.getByText("Someone else's digest"))
      .not.toBeInTheDocument();

    // Act
    await screen.getByRole("button", { name: "Mark all as read" }).click();

    // Assert
    await expect
      .element(screen.getByRole("button", { name: "Notifications" }))
      .toBeVisible();
  });
});
