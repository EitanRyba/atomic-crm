import { useCallback, useMemo } from "react";
import { useDataProvider, useGetIdentity } from "ra-core";

import { mapSizeToCategory } from "../companies/sizes";
import { useConfigurationContext } from "../root/ConfigurationContext";
import {
  isPlaceholderCompanyName,
  normalizeCompanyName,
} from "../companies/placeholderCompany";
import type { Company } from "../types";
import { parseCompanyCategories } from "./companyCategories";
import { findCompanyByName } from "./useCompanyResolver";
import {
  competitorChoices,
  continentChoices,
  type ChoiceDefinition,
} from "../misc/prospectingChoices";
import { toConfiguredValue, toInteger, toNumber, toText } from "./parseCell";
import type { ImportCell, ProcessImportBatch } from "./types";

/**
 * Creates a company per CSV row. Unknown columns are ignored, missing ones are
 * left empty — except `name`, which the database requires.
 *
 * - `category` holds "cliente", "referido" or both (see
 *   `parseCompanyCategories`).
 * - `referred_by` names the referral company that introduced a client: an
 *   existing company becomes a referral company if it was not one, an unknown
 *   one is created as a referral company.
 * - A company that exists already, by name regardless of case and extra
 *   whitespace, is reused instead of duplicated, and reported as a notice.
 *
 * Rows are created one after the other, so that a row can name a company that
 * an earlier row of the same file created.
 */
export function useCompanyImport(): ProcessImportBatch {
  const { companySectors } = useConfigurationContext();
  const { identity } = useGetIdentity();
  const dataProvider = useDataProvider();

  // Companies by normalized name, across the batches of a single import.
  // Cache is dependent of dataProvider, so it's safe to use it as a dependency
  const cache = useMemo(
    () => new Map<string, Company>(),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [dataProvider],
  );

  return useCallback(
    async (batch) => {
      const findCompany = async (name: string) => {
        const key = normalizeCompanyName(name);
        if (!cache.has(key)) {
          const existing = await findCompanyByName(name, dataProvider);
          if (existing) cache.set(key, existing);
        }
        return cache.get(key);
      };

      const getReferralCompany = async (name: string) => {
        const existing = await findCompany(name);
        if (existing?.is_referral) return existing;
        const { data } = existing
          ? await dataProvider.update<Company>("companies", {
              id: existing.id,
              data: { is_referral: true },
              previousData: existing,
            })
          : await dataProvider.create<Company>("companies", {
              data: {
                name: name.trim().replace(/\s+/g, " "),
                is_client: false,
                is_referral: true,
                sales_id: identity?.id,
                created_at: new Date().toISOString(),
              },
            });
        const company = { ...existing, ...data };
        cache.set(normalizeCompanyName(name), company);
        return company;
      };

      let created = 0;
      let duplicateCompanies = 0;
      for (const row of batch) {
        try {
          const name = toText(row.name);
          if (!name) {
            throw new Error("The company name is required");
          }
          if (isPlaceholderCompanyName(name)) {
            throw new Error(
              `"${name}" is the system company and cannot be imported`,
            );
          }
          if (await findCompany(name)) {
            duplicateCompanies += 1;
            created += 1;
            continue;
          }

          const categories = parseCompanyCategories(
            row.category,
            row.description,
          );
          // Only a client company is referred by a referral company
          const referrerName = toText(row.referred_by);
          const referrer =
            categories.is_client &&
            referrerName &&
            !isPlaceholderCompanyName(referrerName) &&
            normalizeCompanyName(referrerName) !== normalizeCompanyName(name)
              ? await getReferralCompany(referrerName)
              : undefined;

          const { data } = await dataProvider.create<Company>("companies", {
            data: {
              name,
              sector: toConfiguredValue(row.sector, companySectors),
              size: sizeOf(row.size),
              linkedin_url: toText(row.linkedin_url),
              website: toText(row.website),
              phone_number: toText(row.phone_number),
              address: toText(row.address),
              zipcode: toText(row.zipcode),
              city: toText(row.city),
              state_abbr: toText(row.state_abbr),
              country: toText(row.country),
              description: toText(row.description),
              revenue: toText(row.revenue),
              tax_identifier: toText(row.tax_identifier),
              continent: toConfiguredValue(row.continent, continentOptions),
              network: toText(row.network),
              headcount: toInteger(row.headcount),
              headcount_source: toText(row.headcount_source),
              current_competitor: toConfiguredValue(
                row.current_competitor,
                competitorOptions,
              ),
              ...categories,
              referred_by_company_id: referrer?.id ?? null,
              sales_id: identity?.id,
              created_at: new Date().toISOString(),
            } as Partial<Company>,
          });
          cache.set(normalizeCompanyName(name), data);
          created += 1;
        } catch (error) {
          console.error("Failed to import a row", error);
        }
      }
      return { created, notices: { duplicateCompanies } };
    },
    [cache, companySectors, dataProvider, identity?.id],
  );
}

const toOptions = (choices: ChoiceDefinition[]) =>
  choices.map(({ id, name }) => ({ value: id, label: name }));

const continentOptions = toOptions(continentChoices);
const competitorOptions = toOptions(competitorChoices);

/**
 * `size` is a bucket id, not a headcount, so an arbitrary CSV number is coerced
 * into the nearest bucket the company screens can render.
 */
const sizeOf = (cell: ImportCell) => {
  const size = toNumber(cell);
  return size === undefined ? undefined : mapSizeToCategory(size);
};
