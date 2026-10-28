import { validateStageTags } from "./validateStageTags";

describe("validateStageTags", () => {
  it("accepts the same tag name in two different stages", () => {
    expect(
      validateStageTags([
        { stage: "pilot", value: "kickoff-done", label: "Kick-off done" },
        { stage: "won", value: "kickoff-done", label: "Kick-off done" },
      ]),
    ).toBeUndefined();
  });

  it("rejects two tags with the same name in one stage", () => {
    expect(
      validateStageTags([
        { stage: "won", label: "Invoiced" },
        { stage: "won", label: "invoiced" },
      ]),
    ).toBe("crm.settings.deals.stage_tags_duplicate");
  });

  it("rejects a tag without a stage or a name", () => {
    expect(validateStageTags([{ label: "Invoiced" }])).toBe(
      "crm.settings.deals.stage_tags_incomplete",
    );
    expect(validateStageTags([{ stage: "won", label: "  " }])).toBe(
      "crm.settings.deals.stage_tags_incomplete",
    );
  });
});
