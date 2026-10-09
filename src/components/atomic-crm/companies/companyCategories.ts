import type { Company } from "../types";

/**
 * A company is a client company, a referral company, or both. Validated on
 * `is_client` with the whole form values, as the rule spans both checkboxes.
 */
export const validateCompanyCategories = (
  _value: unknown,
  values: Partial<Company>,
) =>
  values?.is_client || values?.is_referral
    ? undefined
    : "resources.companies.validation.category_required";

/**
 * Only a client company is referred by a referral company: unchecking
 * "client company" drops the referral link instead of saving a stale one.
 */
export const cleanupCompanyCategories = <T extends Partial<Company>>(
  values: T,
): T =>
  values.is_client === false
    ? { ...values, referred_by_company_id: null }
    : values;
