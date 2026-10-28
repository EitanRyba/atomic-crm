import {
  defaultPostponedUntil,
  findStageTag,
  formatShortDate,
  getStageTags,
  isPostponedOverdue,
  openStagesFilter,
  postponedReminderLimit,
} from "./dealOutcome";

const today = new Date(2026, 9, 28); // 28 Oct 2026, local time

const tags = [
  {
    stage: "pilot",
    value: "kickoff-done",
    label: "Kick-off (pilot)",
    color: "#111111",
  },
  { stage: "won", value: "invoiced", label: "Invoiced", color: "#222222" },
  {
    stage: "won",
    value: "kickoff-done",
    label: "Kick-off (won)",
    color: "#333333",
  },
];

describe("defaultPostponedUntil", () => {
  it("proposes to resume three months later", () => {
    expect(defaultPostponedUntil(today)).toBe("2027-01-28");
  });
});

describe("isPostponedOverdue", () => {
  it("flags a resume date already passed", () => {
    expect(isPostponedOverdue({ postponed_until: "2026-10-27" }, today)).toBe(
      true,
    );
  });

  it("does not flag today nor a future date", () => {
    expect(isPostponedOverdue({ postponed_until: "2026-10-28" }, today)).toBe(
      false,
    );
    expect(isPostponedOverdue({ postponed_until: "2026-11-15" }, today)).toBe(
      false,
    );
  });

  it("does not flag a deal without a resume date", () => {
    expect(isPostponedOverdue({ postponed_until: null }, today)).toBe(false);
  });
});

describe("postponedReminderLimit", () => {
  it("reminds a week ahead, across a month end", () => {
    expect(postponedReminderLimit(today)).toBe("2026-11-04");
  });
});

describe("stage tags", () => {
  it("lists only the tags of the deal's stage, in their configured order", () => {
    expect(getStageTags(tags, "won").map((tag) => tag.value)).toEqual([
      "invoiced",
      "kickoff-done",
    ]);
  });

  it("finds the tag of the deal's stage when two stages share a value", () => {
    expect(findStageTag(tags, "won", "kickoff-done")?.label).toBe(
      "Kick-off (won)",
    );
  });

  it("still finds a tag applied in a stage that no longer offers it", () => {
    expect(findStageTag(tags, "agreement", "invoiced")?.label).toBe("Invoiced");
  });
});

describe("openStagesFilter", () => {
  it("keeps every column but postponed and lost", () => {
    expect(
      openStagesFilter([
        { value: "lead" },
        { value: "won" },
        { value: "postponed" },
        { value: "lost" },
      ]),
    ).toEqual({ "stage@in": "(lead,won)" });
  });
});

describe("formatShortDate", () => {
  it("shows a date column as day/month/year without shifting the day", () => {
    expect(formatShortDate("2026-01-31", "es")).toBe("31/01/2026");
  });
});
