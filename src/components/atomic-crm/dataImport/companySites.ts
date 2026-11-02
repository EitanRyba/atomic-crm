import { sitesFromAddress } from "../companies/companySites";
import type { CompanySite } from "../types";
import { toText } from "./parseCell";
import type { ImportRow } from "./types";

const SITE_KEYS = ["name", "country", "address", "city", "state"] as const;

const toSite = (value: unknown): CompanySite | null => {
  if (!value || typeof value !== "object") return null;
  const source = value as Record<string, unknown>;
  const site = Object.fromEntries(
    SITE_KEYS.flatMap((key) => {
      const text = toText(
        typeof source[key] === "string" ? (source[key] as string) : null,
      );
      return text ? [[key, text]] : [];
    }),
  ) as CompanySite;
  return Object.keys(site).length ? site : null;
};

/**
 * The sites of an imported company: the JSON array of the `sites` column (as
 * a company export writes it), or else a "Sede principal" site built from the
 * address columns.
 */
export const parseCompanySites = (row: ImportRow): CompanySite[] => {
  const json = toText(row.sites ?? null);
  if (json) {
    try {
      const parsed: unknown = JSON.parse(json);
      if (Array.isArray(parsed)) {
        const sites = parsed
          .map(toSite)
          .filter((site): site is CompanySite => site !== null);
        if (sites.length) return sites;
      }
    } catch {
      // not JSON: fall back on the address columns
    }
  }
  return sitesFromAddress({
    country: toText(row.country),
    address: toText(row.address),
    city: toText(row.city),
    state_abbr: toText(row.state_abbr),
  });
};
