import { toYearMonth } from "./billing";

/** 1234.5 -> "US$ 1.234,50" (in the user's locale). */
export const formatUsd = (value: number, locale = "es"): string =>
  new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);

/** "2026-11" or "2026-11-01" -> "nov 2026" (in the user's locale). */
export const formatMonth = (value: string, locale = "es"): string => {
  const month = toYearMonth(value);
  if (!month) return value;
  const date = new Date(
    Number(month.slice(0, 4)),
    Number(month.slice(5, 7)) - 1,
    1,
  );
  return new Intl.DateTimeFormat(locale, {
    month: "short",
    year: "numeric",
  }).format(date);
};
