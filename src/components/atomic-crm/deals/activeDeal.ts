import { useCallback } from "react";
import { useDataProvider, type DataProvider, type Identifier } from "ra-core";

import type { Deal } from "../types";

export const ACTIVE_DEAL_ERROR =
  "resources.deals.validation.company_has_active_deal";

// The partial unique index of the stage 5 migration
const ACTIVE_DEAL_INDEX = "deals_company_id_active_unique_idx";

/** Whether a save failed on the "one active deal per company" index. */
export const isActiveDealConflictError = (error: unknown): boolean => {
  if (!error || typeof error !== "object") return false;
  const { message, body } = error as { message?: unknown; body?: unknown };
  const texts = [message, JSON.stringify(body ?? "")];
  return texts.some(
    (text) => typeof text === "string" && text.includes(ACTIVE_DEAL_INDEX),
  );
};

/**
 * Whether another active (non-archived) deal of the company exists: a company
 * has at most one. `dealId` is the deal being edited, if any.
 */
export const companyHasOtherActiveDeal = async (
  dataProvider: DataProvider,
  companyId: Identifier,
  dealId?: Identifier,
): Promise<boolean> => {
  const { data } = await dataProvider.getList<Deal>("deals", {
    filter: { company_id: companyId, "archived_at@is": null },
    pagination: { page: 1, perPage: 2 },
    sort: { field: "id", order: "ASC" },
  });
  return data.some((deal) => String(deal.id) !== String(dealId));
};

/** Form validator of `company_id`: refuses a company with an active deal. */
export const useValidateSingleActiveDeal = () => {
  const dataProvider = useDataProvider();
  return useCallback(
    async (companyId: unknown, values: Partial<Deal>) => {
      if (companyId == null || companyId === "" || values?.archived_at) {
        return undefined;
      }
      try {
        const taken = await companyHasOtherActiveDeal(
          dataProvider,
          companyId as Identifier,
          values?.id,
        );
        return taken ? ACTIVE_DEAL_ERROR : undefined;
      } catch (error) {
        // The database index still refuses a second active deal on save
        console.error("Could not check the active deals of the company", error);
        return undefined;
      }
    },
    [dataProvider],
  );
};
