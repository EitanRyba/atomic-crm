import { resolveImportedStage, toImportedOutcome } from "./dealStageImport";

const humandStages = [
  { value: "first-contact", label: "Primer contacto" },
  { value: "lead", label: "Lead" },
  { value: "discovery", label: "Coordinación · Discovery" },
  { value: "champion", label: "2da call · Champion" },
  { value: "negotiation", label: "Negociación" },
  { value: "won", label: "Ganado" },
  { value: "postponed", label: "Pospuesto" },
  { value: "lost", label: "Perdido" },
];

const reasonLabels = {
  "said-no": "Dijo que no",
  "no-response": "Sin respuesta",
  unspecified: "Sin motivo registrado",
};

describe("resolveImportedStage", () => {
  it("matches a configured stage by label or identifier first", () => {
    expect(resolveImportedStage("Ganado", humandStages)).toEqual({
      stage: "won",
    });
    expect(resolveImportedStage("discovery", humandStages)).toEqual({
      stage: "discovery",
    });
  });

  it("maps a stage of the previous version, with the tag that keeps its detail", () => {
    expect(resolveImportedStage("Reunión agendada", humandStages)).toEqual({
      stage: "lead",
      tag: "first-meeting-scheduled",
    });
    expect(resolveImportedStage("implementation", humandStages)).toEqual({
      stage: "won",
      tag: "implementation-in-progress",
    });
    expect(resolveImportedStage("Demo realizada", humandStages)).toEqual({
      stage: "discovery",
    });
  });

  it("returns nothing for an unknown stage, or when the mapped stage is not configured", () => {
    expect(resolveImportedStage("Archived", humandStages)).toBeUndefined();
    expect(
      resolveImportedStage("Propuesta enviada", [
        { value: "won", label: "Won" },
      ]),
    ).toBeUndefined();
  });
});

describe("toImportedOutcome", () => {
  it("reads the reason of a lost deal from its label", () => {
    expect(
      toImportedOutcome(
        { lost_reason: "dijo que no", lost_reason_detail: "Chose a rival" },
        "lost",
        reasonLabels,
      ),
    ).toEqual({ lost_reason: "said-no", lost_reason_detail: "Chose a rival" });
  });

  it("records a lost deal without a known reason as unspecified", () => {
    expect(
      toImportedOutcome({ lost_reason: null }, "lost", reasonLabels),
    ).toEqual({ lost_reason: "unspecified", lost_reason_detail: undefined });
  });

  it("keeps the day and the reason of a postponed deal", () => {
    expect(
      toImportedOutcome(
        { postponed_until: "2027-02-01", postponed_reason: "New board" },
        "postponed",
        reasonLabels,
      ),
    ).toEqual({ postponed_until: "2027-02-01", postponed_reason: "New board" });
  });

  it("rejects a postponed deal without a date to resume", () => {
    expect(() =>
      toImportedOutcome(
        { name: "Intranet", postponed_reason: "New board" },
        "postponed",
        reasonLabels,
      ),
    ).toThrow(/Intranet.*postponed_until/);
  });

  it("adds nothing for a deal still in play", () => {
    expect(
      toImportedOutcome({ lost_reason: "said-no" }, "lead", reasonLabels),
    ).toEqual({});
  });
});
