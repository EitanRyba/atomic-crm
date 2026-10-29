import { DEFAULT_COMMISSION_RULES } from "./billing";
import { validateContract } from "./validateContract";

const valid = {
  company_id: 1,
  first_payment_month: "2026-03-01",
  fee_history: [{ from_month: "2026-03", amount: 1000 }],
  commission_rules: DEFAULT_COMMISSION_RULES,
  subcommission_rules: [],
};

describe("validateContract", () => {
  it("accepts a contract with the default commission", () => {
    expect(validateContract(valid)).toEqual({});
  });

  it("requires a client company and a monthly fee", () => {
    expect(
      validateContract({ ...valid, company_id: null, fee_history: [] }),
    ).toEqual({
      company_id: "ra.validation.required",
      fee_history: "resources.contracts.validation.fee_required",
    });
  });

  it("rejects two fees starting the same month", () => {
    expect(
      validateContract({
        ...valid,
        fee_history: [
          { from_month: "2026-03", amount: 1000 },
          { from_month: "2026-03", amount: 1200 },
        ],
      }).fee_history,
    ).toBe("resources.contracts.validation.fee_duplicate_month");
  });

  it("rejects commission lines covering the same months", () => {
    expect(
      validateContract({
        ...valid,
        commission_rules: [
          { from_month: 1, to_month: null, percent: 50 },
          { from_month: 13, to_month: null, percent: 30 },
        ],
      }).commission_rules,
    ).toBe("resources.contracts.validation.commission_overlap");
  });

  it("rejects a % sub-commission above 100 but accepts a large fixed one", () => {
    expect(
      validateContract({
        ...valid,
        subcommission_rules: [
          { kind: "percent", value: 120, from_month: 1, to_month: null },
        ],
      }).subcommission_rules,
    ).toBe("resources.contracts.validation.subcommission_incomplete");
    expect(
      validateContract({
        ...valid,
        subcommission_rules: [
          { kind: "fixed", value: 120, from_month: 1, to_month: 24 },
        ],
      }),
    ).toEqual({});
  });

  it("rejects a contract ending before its first payment", () => {
    expect(
      validateContract({ ...valid, end_month: "2026-01-01" }).end_month,
    ).toBe("resources.contracts.validation.end_before_start");
  });
});
