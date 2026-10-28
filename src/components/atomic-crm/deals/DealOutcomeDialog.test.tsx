import { render } from "vitest-browser-react";

import { StoryWrapper } from "@/test/StoryWrapper";
import { DealOutcomeDialog, type DealOutcomeData } from "./DealOutcomeDialog";
import { defaultPostponedUntil } from "./dealOutcome";

const renderDialog = (stage: "lost" | "postponed") => {
  const confirmed: DealOutcomeData[] = [];
  const screen = render(
    <StoryWrapper>
      <DealOutcomeDialog
        stage={stage}
        dealName="Intranet"
        onConfirm={(data) => confirmed.push(data)}
        onCancel={() => undefined}
      />
    </StoryWrapper>,
  );
  return { screen, confirmed };
};

describe("DealOutcomeDialog", () => {
  it("does not lose a deal without a reason, and shows Humand's criterion", async () => {
    // Arrange
    const { screen: rendering, confirmed } = renderDialog("lost");
    const screen = await rendering;
    await expect
      .element(screen.getByText(/5 to 7 follow-ups without an answer/))
      .toBeVisible();

    // Act
    await screen.getByRole("button", { name: "Confirm" }).click();

    // Assert
    await expect
      .element(screen.getByText("Choose why the deal is lost."))
      .toBeVisible();
    expect(confirmed).toEqual([]);
  });

  it("loses a deal with the chosen reason and details", async () => {
    // Arrange
    const { screen: rendering, confirmed } = renderDialog("lost");
    const screen = await rendering;

    // Act
    await screen.getByRole("combobox", { name: "Lost reason" }).click();
    await screen.getByRole("option", { name: "Wrong contact" }).click();
    await screen
      .getByRole("textbox", { name: "Details" })
      .fill("Talked to procurement");
    await screen.getByRole("button", { name: "Confirm" }).click();

    // Assert
    await expect
      .poll(() => confirmed)
      .toEqual([
        {
          lost_reason: "wrong-contact",
          lost_reason_detail: "Talked to procurement",
        },
      ]);
  });

  it("postpones three months ahead by default, with the reason given", async () => {
    // Arrange
    const { screen: rendering, confirmed } = renderDialog("postponed");
    const screen = await rendering;
    await expect
      .element(screen.getByLabelText("Resume on"))
      .toHaveValue(defaultPostponedUntil());

    // Act
    await screen
      .getByRole("textbox", { name: "Why it is postponed" })
      .fill("New board in January");
    await screen.getByRole("button", { name: "Confirm" }).click();

    // Assert
    await expect
      .poll(() => confirmed)
      .toEqual([
        {
          postponed_until: defaultPostponedUntil(),
          postponed_reason: "New board in January",
        },
      ]);
  });

  it("refuses a date to resume that is not in the future", async () => {
    // Arrange
    const { screen: rendering, confirmed } = renderDialog("postponed");
    const screen = await rendering;

    // Act
    await screen.getByLabelText("Resume on").fill("2020-01-01");
    await screen
      .getByRole("textbox", { name: "Why it is postponed" })
      .fill("New board");
    await screen.getByRole("button", { name: "Confirm" }).click();

    // Assert
    await expect
      .element(screen.getByText("The date to resume must be after today."))
      .toBeVisible();
    expect(confirmed).toEqual([]);
  });
});
