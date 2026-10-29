import type {
  CommissionRule,
  Contract,
  FeeChange,
  SubcommissionRule,
} from "../types";

/** "YYYY-MM": a calendar month. */
export type YearMonth = string;

// Humand pays 50% of the fee during the first 12 months of a contract, then
// 30%. Every new contract starts with these rules; each one can change them.
export const DEFAULT_COMMISSION_RULES: CommissionRule[] = [
  { from_month: 1, to_month: 12, percent: 50 },
  { from_month: 13, to_month: null, percent: 30 },
];

const yearMonthRegex = /^\d{4}-\d{2}$/;

/** "2026-11-01" or "2026-11" -> "2026-11". Undefined when not a month. */
export const toYearMonth = (
  value: string | null | undefined,
): YearMonth | undefined => {
  const month = value?.slice(0, 7);
  return month && yearMonthRegex.test(month) ? month : undefined;
};

/** "2026-11" -> "2026-11-01", the value stored in date columns. */
export const toMonthDate = (month: YearMonth): string => `${month}-01`;

const monthNumber = (month: YearMonth): number =>
  Number(month.slice(0, 4)) * 12 + Number(month.slice(5, 7)) - 1;

const fromMonthNumber = (value: number): YearMonth => {
  const year = Math.floor(value / 12);
  const month = (value % 12) + 1;
  return `${year}-${String(month).padStart(2, "0")}`;
};

export const addMonths = (month: YearMonth, count: number): YearMonth =>
  fromMonthNumber(monthNumber(month) + count);

/** Months from `from` to `to`, both included. Empty when `to` is before. */
export const monthRange = (from: YearMonth, to: YearMonth): YearMonth[] => {
  const start = monthNumber(from);
  const end = monthNumber(to);
  return Array.from({ length: Math.max(0, end - start + 1) }, (_, index) =>
    fromMonthNumber(start + index),
  );
};

/** The current calendar month. */
export const currentYearMonth = (today: Date = new Date()): YearMonth =>
  `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;

/** 1 for the month of the first payment, 2 for the next one... */
export const contractMonthOf = (
  firstPaymentMonth: YearMonth,
  month: YearMonth,
): number => monthNumber(month) - monthNumber(firstPaymentMonth) + 1;

const roundCents = (value: number): number => Math.round(value * 100) / 100;

const inRange = (
  rule: { from_month: number; to_month?: number | null },
  contractMonth: number,
) =>
  contractMonth >= rule.from_month &&
  (rule.to_month == null || contractMonth <= rule.to_month);

/**
 * The monthly fee in effect in a month: the last change on or before it.
 * Before the first change, the first fee applies.
 */
export const feeAt = (feeHistory: FeeChange[], month: YearMonth): number => {
  const changes = feeHistory
    .filter((change) => toYearMonth(change.from_month))
    .sort((a, b) => a.from_month.localeCompare(b.from_month));
  const inEffect = changes.filter((change) => change.from_month <= month);
  return Number((inEffect.at(-1) ?? changes[0])?.amount ?? 0);
};

/** The commission % of a contract month (0 when no rule covers it). */
export const commissionPercentAt = (
  rules: CommissionRule[],
  contractMonth: number,
): number =>
  Number(rules.find((rule) => inRange(rule, contractMonth))?.percent ?? 0);

/** What the referral company earns in a contract month: every rule adds up. */
export const subcommissionAt = (
  rules: SubcommissionRule[],
  contractMonth: number,
  commission: number,
): number =>
  rules
    .filter((rule) => inRange(rule, contractMonth))
    .reduce(
      (total, rule) =>
        total +
        (rule.kind === "fixed"
          ? Number(rule.value)
          : (commission * Number(rule.value)) / 100),
      0,
    );

export interface ContractMonth {
  contractId: Contract["id"];
  companyId: Contract["company_id"];
  referralCompanyId: Contract["referral_company_id"];
  month: YearMonth;
  contractMonth: number;
  fee: number;
  commissionPercent: number;
  commission: number;
  subcommission: number;
  // what is left once the referral company is paid
  net: number;
}

/**
 * Month by month amounts of a contract between two months (both included),
 * from its first payment and until it ended. A contract without a first
 * payment yet has no month.
 */
export const getContractMonths = (
  contract: Contract,
  from: YearMonth,
  to: YearMonth,
): ContractMonth[] => {
  const firstPayment = toYearMonth(contract.first_payment_month);
  if (!firstPayment) return [];
  const end = toYearMonth(contract.end_month);
  const start = firstPayment > from ? firstPayment : from;
  const last = end && end < to ? end : to;

  return monthRange(start, last).map((month) => {
    const contractMonth = contractMonthOf(firstPayment, month);
    const fee = feeAt(contract.fee_history ?? [], month);
    const commissionPercent = commissionPercentAt(
      contract.commission_rules ?? [],
      contractMonth,
    );
    const commission = roundCents((fee * commissionPercent) / 100);
    const subcommission = roundCents(
      subcommissionAt(
        contract.subcommission_rules ?? [],
        contractMonth,
        commission,
      ),
    );
    return {
      contractId: contract.id,
      companyId: contract.company_id,
      referralCompanyId: contract.referral_company_id,
      month,
      contractMonth,
      fee: roundCents(fee),
      commissionPercent,
      commission,
      subcommission,
      net: roundCents(commission - subcommission),
    };
  });
};

export interface MonthTotals {
  month: YearMonth;
  fee: number;
  commission: number;
  subcommission: number;
  net: number;
}

/** Totals per month, for every month of the range (zero when none). */
export const totalsByMonth = (
  rows: ContractMonth[],
  from: YearMonth,
  to: YearMonth,
): MonthTotals[] =>
  monthRange(from, to).map((month) => {
    const ofMonth = rows.filter((row) => row.month === month);
    const sum = (key: "fee" | "commission" | "subcommission" | "net") =>
      roundCents(ofMonth.reduce((total, row) => total + row[key], 0));
    return {
      month,
      fee: sum("fee"),
      commission: sum("commission"),
      subcommission: sum("subcommission"),
      net: sum("net"),
    };
  });

export type ContractStatus = "active" | "ended" | "awaiting_payment";

/** Where a contract stands this month. */
export const getContractStatus = (
  contract: Contract,
  month = currentYearMonth(),
): ContractStatus => {
  const firstPayment = toYearMonth(contract.first_payment_month);
  if (!firstPayment || firstPayment > month) return "awaiting_payment";
  const end = toYearMonth(contract.end_month);
  return end && end < month ? "ended" : "active";
};
