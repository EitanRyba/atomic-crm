import type { Company, CompanySite } from "../types";

export const MAIN_SITE_NAME = "Sede principal";

const clean = (value: unknown): string =>
  typeof value === "string" ? value.trim() : "";

/**
 * The sites of a company created before sites existed: its old address
 * columns become a single "Sede principal", or no site when all are empty.
 * Mirrors the backfill of the stage 5 migration.
 */
export const sitesFromAddress = (
  company: Partial<
    Pick<Company, "country" | "address" | "city" | "state_abbr">
  >,
): CompanySite[] => {
  const site: CompanySite = {
    country: clean(company.country),
    address: clean(company.address),
    city: clean(company.city),
    state: clean(company.state_abbr),
  };
  const hasData = Object.values(site).some(Boolean);
  if (!hasData) return [];
  return [
    Object.fromEntries(
      Object.entries({ name: MAIN_SITE_NAME, ...site }).filter(
        ([, value]) => value,
      ),
    ) as CompanySite,
  ];
};

/** The sites of a company, falling back on its old address columns. */
export const getCompanySites = (company: Partial<Company>): CompanySite[] =>
  company.sites?.length ? company.sites : sitesFromAddress(company);

/** "Address, City, State" of a site, skipping the empty parts. */
export const formatSiteLocation = (site: CompanySite): string =>
  [site.address, site.city, site.state].map(clean).filter(Boolean).join(", ");

/** Drops the sites the user added but left empty. */
export const cleanupCompanySites = <T extends Partial<Company>>(
  values: T,
): T =>
  Array.isArray(values.sites)
    ? {
        ...values,
        sites: values.sites
          .map((site) =>
            Object.fromEntries(
              Object.entries(site ?? {}).map(([key, value]) => [
                key,
                clean(value),
              ]),
            ),
          )
          .filter((site) => Object.values(site).some(Boolean)),
      }
    : values;
