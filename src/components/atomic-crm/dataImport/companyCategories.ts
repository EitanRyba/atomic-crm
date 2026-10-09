import { toText } from "./parseCell";
import type { ImportCell } from "./types";

export type CompanyCategories = { is_client: boolean; is_referral: boolean };

const CLIENT_WORDS = ["cliente", "client"];
const REFERRAL_WORDS = ["referido", "referral"];

/**
 * Reads the `category` column of a company CSV: "cliente", "referido" or
 * "cliente, referido" (also "client" and "referral"), whatever the case.
 * When it is empty or unknown, a company whose description starts with
 * "MULTIPLICADORA" is a referral company, any other one a client company.
 */
export const parseCompanyCategories = (
  category: ImportCell,
  description: ImportCell,
): CompanyCategories => {
  const words = (toText(category) ?? "")
    .split(/[,;/|+]+/)
    .map((word) => word.trim().toLocaleLowerCase())
    .filter(Boolean);
  const is_client = words.some((word) => CLIENT_WORDS.includes(word));
  const is_referral = words.some((word) => REFERRAL_WORDS.includes(word));
  if (is_client || is_referral) {
    return { is_client, is_referral };
  }

  const isMultiplier = (toText(description) ?? "")
    .toLocaleUpperCase()
    .startsWith("MULTIPLICADORA");
  return isMultiplier
    ? { is_client: false, is_referral: true }
    : { is_client: true, is_referral: false };
};
