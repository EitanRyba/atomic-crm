import type { CommissionRule, FeeChange, SubcommissionRule } from "../types";
import { toYearMonth } from "./billing";

type ContractFormValues = {
  company_id?: unknown;
  first_payment_month?: string | null;
  end_month?: string | null;
  fee_history?: Partial<FeeChange>[];
  commission_rules?: Partial<CommissionRule>[];
  subcommission_rules?: Partial<SubcommissionRule>[];
};

const isBlank = (value: unknown) =>
  value === undefined || value === null || value === "";

const isMonthRangeValid = (rule: {
  from_month?: number | null;
  to_month?: number | null;
}) =>
  Number.isInteger(Number(rule.from_month)) &&
  Number(rule.from_month) >= 1 &&
  (isBlank(rule.to_month) || Number(rule.to_month) >= Number(rule.from_month));

const overlaps = (rules: Partial<CommissionRule>[]) => {
  const sorted = [...rules].sort(
    (a, b) => Number(a.from_month) - Number(b.from_month),
  );
  return sorted.some((rule, index) => {
    const next = sorted[index + 1];
    if (!next) return false;
    return (
      isBlank(rule.to_month) || Number(rule.to_month) >= Number(next.from_month)
    );
  });
};

const PREFIX = "resources.contracts.validation";

/**
 * Form-level validation of a contract. Returns the translation key of each
 * field in error, or an empty object.
 */
export const validateContract = (
  values: ContractFormValues,
): Record<string, string> => {
  const errors: Record<string, string> = {};

  if (isBlank(values.company_id)) {
    errors.company_id = "ra.validation.required";
  }

  const firstPayment = toYearMonth(values.first_payment_month);
  const end = toYearMonth(values.end_month);
  if (end && (!firstPayment || end < firstPayment)) {
    errors.end_month = `${PREFIX}.end_before_start`;
  }

  const fees = values.fee_history ?? [];
  if (!fees.length) {
    errors.fee_history = `${PREFIX}.fee_required`;
  } else if (
    fees.some(
      (fee) =>
        !toYearMonth(fee.from_month) ||
        isBlank(fee.amount) ||
        Number(fee.amount) < 0,
    )
  ) {
    errors.fee_history = `${PREFIX}.fee_incomplete`;
  } else if (new Set(fees.map((fee) => fee.from_month)).size !== fees.length) {
    errors.fee_history = `${PREFIX}.fee_duplicate_month`;
  }

  const commissions = values.commission_rules ?? [];
  if (
    commissions.some(
      (rule) =>
        !isMonthRangeValid(rule) ||
        isBlank(rule.percent) ||
        Number(rule.percent) < 0 ||
        Number(rule.percent) > 100,
    )
  ) {
    errors.commission_rules = `${PREFIX}.commission_incomplete`;
  } else if (overlaps(commissions)) {
    errors.commission_rules = `${PREFIX}.commission_overlap`;
  }

  const subcommissions = values.subcommission_rules ?? [];
  if (
    subcommissions.some(
      (rule) =>
        (rule.kind !== "percent" && rule.kind !== "fixed") ||
        !isMonthRangeValid(rule) ||
        isBlank(rule.value) ||
        Number(rule.value) < 0 ||
        (rule.kind === "percent" && Number(rule.value) > 100),
    )
  ) {
    errors.subcommission_rules = `${PREFIX}.subcommission_incomplete`;
  }

  return errors;
};

/**
 * Input validator showing the contract error of one field, so every rule is
 * checked against the whole form.
 */
export const validateContractField =
  (field: keyof ContractFormValues) =>
  (_value: unknown, allValues: ContractFormValues): string | undefined =>
    validateContract(allValues)[field];
