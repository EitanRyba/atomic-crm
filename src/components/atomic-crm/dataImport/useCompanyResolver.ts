import { useCallback, useMemo } from "react";
import { useDataProvider, useGetIdentity, type DataProvider } from "ra-core";

import {
  isPlaceholderCompanyName,
  normalizeCompanyName,
} from "../companies/placeholderCompany";
import type { Company } from "../types";

/**
 * Finds a company by name, ignoring case and extra whitespace. Never returns
 * the "Por definir" system company: contacts only go there on purpose.
 */
export const findCompanyByName = async (
  name: string,
  dataProvider: DataProvider,
): Promise<Company | undefined> => {
  const key = normalizeCompanyName(name);
  if (!key || isPlaceholderCompanyName(key)) return undefined;
  // `@ilike` matches the names containing every word, whatever the case;
  // the exact comparison is done on the normalized names
  const { data } = await dataProvider.getList<Company>("companies", {
    filter: { "name@ilike": key, "is_placeholder@neq": true },
    pagination: { page: 1, perPage: 50 },
    sort: { field: "id", order: "ASC" },
  });
  return data.find(
    (company) =>
      !company.is_placeholder && normalizeCompanyName(company.name) === key,
  );
};

/**
 * Resolves companies by name, creating the missing ones, and memoizes them in
 * the cache — keyed by normalized name — to avoid creating the same company
 * twice and to save roundtrips across the batches of a single import.
 * Returns the companies keyed by the trimmed names it was given; a name of the
 * "Por definir" system company is never resolved nor created.
 */
export const fetchCompaniesWithCache = async (
  cache: Map<string, Company>,
  names: string[],
  getCreateData: (name: string) => Partial<Company>,
  dataProvider: DataProvider,
): Promise<Map<string, Company>> => {
  const trimmedNames = [
    ...new Set(names.map((name) => name.trim()).filter(Boolean)),
  ].filter((name) => !isPlaceholderCompanyName(name));
  const uncachedKeys = [
    ...new Set(trimmedNames.map(normalizeCompanyName)),
  ].filter((key) => !cache.has(key));

  // check the backend for existing companies, then create the missing ones
  await Promise.all(
    uncachedKeys.map(async (key) => {
      const existing = await findCompanyByName(key, dataProvider);
      if (existing) {
        cache.set(key, existing);
        return;
      }
      const name = trimmedNames
        .find((candidate) => normalizeCompanyName(candidate) === key)!
        .replace(/\s+/g, " ");
      const { data } = await dataProvider.create<Company>("companies", {
        data: getCreateData(name),
      });
      cache.set(key, data);
    }),
  );

  return new Map(
    trimmedNames
      .filter((name) => cache.has(normalizeCompanyName(name)))
      .map((name) => [name, cache.get(normalizeCompanyName(name))!]),
  );
};

/**
 * Resolves companies by name, creating the missing ones as client companies.
 * Both the contact and the deal importer name companies in a text column, so
 * they share one cache: a company named twice in a CSV is created once.
 */
export function useCompanyResolver() {
  const { identity } = useGetIdentity();
  const dataProvider = useDataProvider();

  // Cache is dependent of dataProvider, so it's safe to use it as a dependency
  const companiesCache = useMemo(
    () => new Map<string, Company>(),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [dataProvider],
  );

  return useCallback(
    (names: string[]) =>
      fetchCompaniesWithCache(
        companiesCache,
        names,
        (name) => ({
          name,
          is_client: true,
          is_referral: false,
          created_at: new Date().toISOString(),
          sales_id: identity?.id,
        }),
        dataProvider,
      ),
    [companiesCache, dataProvider, identity?.id],
  );
}
