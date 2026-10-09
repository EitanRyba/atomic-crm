import { useGetList, type DataProvider } from "ra-core";

import type { Company } from "../types";

/**
 * Name of the "Por definir" system company, which holds the contacts whose
 * company is not known yet. The database creates it and forbids renaming it.
 */
export const PLACEHOLDER_COMPANY_NAME = "Por definir";

/** Filter matching only the placeholder company */
export const PLACEHOLDER_COMPANY_FILTER = { is_placeholder: true };

/**
 * Compares company names regardless of case and of extra whitespace, so that
 * " ACME  corp" and "Acme Corp" are the same company.
 */
export const normalizeCompanyName = (name: string) =>
  name.trim().replace(/\s+/g, " ").toLocaleLowerCase();

export const isPlaceholderCompanyName = (name: string) =>
  normalizeCompanyName(name) === normalizeCompanyName(PLACEHOLDER_COMPANY_NAME);

/**
 * Fetches the placeholder company. The database always has one; a fake
 * database built for a test or a story may not, so it is created on demand.
 */
export const getPlaceholderCompany = async (
  dataProvider: DataProvider,
): Promise<Company> => {
  const { data } = await dataProvider.getList<Company>("companies", {
    filter: PLACEHOLDER_COMPANY_FILTER,
    pagination: { page: 1, perPage: 1 },
    sort: { field: "id", order: "ASC" },
  });
  if (data[0]) {
    return data[0];
  }
  const { data: created } = await dataProvider.create<Company>("companies", {
    data: {
      name: PLACEHOLDER_COMPANY_NAME,
      is_placeholder: true,
      is_client: false,
      is_referral: false,
    },
  });
  return created;
};

/** The placeholder company, or undefined while it loads */
export const usePlaceholderCompany = (options: { enabled?: boolean } = {}) => {
  const { data, isPending } = useGetList<Company>(
    "companies",
    {
      filter: PLACEHOLDER_COMPANY_FILTER,
      pagination: { page: 1, perPage: 1 },
      sort: { field: "id", order: "ASC" },
    },
    { staleTime: 5 * 60 * 1000, ...options },
  );
  return { placeholderCompany: data?.[0], isPending };
};
