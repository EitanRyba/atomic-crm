import type { Contract } from "../types";
import {
  DEFAULT_COMMISSION_RULES,
  addMonths,
  contractMonthOf,
  feeAt,
  getContractMonths,
  getContractStatus,
  monthRange,
  totalsByMonth,
} from "./billing";

const buildContract = (overrides: Partial<Contract> = {}): Contract => ({
  id: 1,
  company_id: 10,
  referral_company_id: 20,
  first_payment_month: "2026-03-01",
  end_month: null,
  fee_history: [{ from_month: "2026-03", amount: 1000 }],
  commission_rules: DEFAULT_COMMISSION_RULES,
  subcommission_rules: [],
  created_at: "2026-03-01T00:00:00.000Z",
  updated_at: "2026-03-01T00:00:00.000Z",
  ...overrides,
});

describe("months", () => {
  it("counts contract months from the first payment, across years", () => {
    expect(contractMonthOf("2026-03", "2026-03")).toBe(1);
    expect(contractMonthOf("2026-03", "2027-02")).toBe(12);
    expect(contractMonthOf("2026-03", "2027-03")).toBe(13);
  });

  it("walks months across a year end", () => {
    expect(addMonths("2026-11", 3)).toBe("2027-02");
    expect(addMonths("2026-01", -1)).toBe("2025-12");
    expect(monthRange("2026-11", "2027-01")).toEqual([
      "2026-11",
      "2026-12",
      "2027-01",
    ]);
    expect(monthRange("2027-01", "2026-11")).toEqual([]);
  });
});

describe("feeAt", () => {
  const history = [
    { from_month: "2026-07", amount: 1500 },
    { from_month: "2026-03", amount: 1000 },
  ];

  it("applies each fee from its month on, whatever the order entered", () => {
    expect(feeAt(history, "2026-06")).toBe(1000);
    expect(feeAt(history, "2026-07")).toBe(1500);
    expect(feeAt(history, "2027-01")).toBe(1500);
  });

  it("applies the first fee before its month", () => {
    expect(feeAt(history, "2026-01")).toBe(1000);
  });
});

describe("getContractMonths", () => {
  it("pays 50% of the fee the first 12 months and 30% from month 13", () => {
    const months = getContractMonths(buildContract(), "2027-01", "2027-04");

    expect(
      months.map(({ month, contractMonth, commission }) => ({
        month,
        contractMonth,
        commission,
      })),
    ).toEqual([
      { month: "2027-01", contractMonth: 11, commission: 500 },
      { month: "2027-02", contractMonth: 12, commission: 500 },
      { month: "2027-03", contractMonth: 13, commission: 300 },
      { month: "2027-04", contractMonth: 14, commission: 300 },
    ]);
  });

  it("gives the referral company a % of the commission for a limited time", () => {
    const contract = buildContract({
      subcommission_rules: [
        { kind: "percent", value: 20, from_month: 1, to_month: 6 },
      ],
    });

    const [sixth, seventh] = getContractMonths(contract, "2026-08", "2026-09");

    expect(sixth).toMatchObject({
      commission: 500,
      subcommission: 100,
      net: 400,
    });
    expect(seventh).toMatchObject({
      commission: 500,
      subcommission: 0,
      net: 500,
    });
  });

  it("adds up a fixed sub-commission and an open-ended %", () => {
    const contract = buildContract({
      subcommission_rules: [
        { kind: "fixed", value: 50, from_month: 1, to_month: null },
        { kind: "percent", value: 10, from_month: 1, to_month: null },
      ],
    });

    const [month] = getContractMonths(contract, "2030-01", "2030-01");

    // month 47: 30% of 1000 = 300, 10% of it = 30, plus 50 fixed
    expect(month).toMatchObject({
      commission: 300,
      subcommission: 80,
      net: 220,
    });
  });

  it("has no month before the first payment nor after the contract ended", () => {
    const contract = buildContract({ end_month: "2026-05-01" });

    expect(
      getContractMonths(contract, "2026-01", "2026-12").map((m) => m.month),
    ).toEqual(["2026-03", "2026-04", "2026-05"]);
  });

  it("projects nothing while the client has not paid yet", () => {
    expect(
      getContractMonths(
        buildContract({ first_payment_month: null }),
        "2026-01",
        "2026-12",
      ),
    ).toEqual([]);
  });
});

describe("totalsByMonth", () => {
  it("sums every contract per month, including the months without billing", () => {
    const rows = [
      ...getContractMonths(buildContract(), "2026-02", "2026-03"),
      ...getContractMonths(
        buildContract({
          id: 2,
          fee_history: [{ from_month: "2026-01", amount: 400.5 }],
        }),
        "2026-02",
        "2026-03",
      ),
    ];

    expect(totalsByMonth(rows, "2026-02", "2026-03")).toEqual([
      { month: "2026-02", fee: 0, commission: 0, subcommission: 0, net: 0 },
      {
        month: "2026-03",
        fee: 1400.5,
        commission: 700.25,
        subcommission: 0,
        net: 700.25,
      },
    ]);
  });
});

describe("getContractStatus", () => {
  it("tells apart awaiting, active and ended contracts", () => {
    expect(getContractStatus(buildContract(), "2026-02")).toBe(
      "awaiting_payment",
    );
    expect(getContractStatus(buildContract(), "2026-03")).toBe("active");
    expect(
      getContractStatus(buildContract({ end_month: "2026-05-01" }), "2026-06"),
    ).toBe("ended");
  });
});
