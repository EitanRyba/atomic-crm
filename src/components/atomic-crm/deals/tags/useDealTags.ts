import { useGetList, type Identifier } from "ra-core";
import { useMemo } from "react";

import type { DealTagAssignment } from "../../types";
import { DEAL_TAG_RESOURCE } from "./useDealTagMutations";

const EMPTY: DealTagAssignment[] = [];

/**
 * Active tags of every deal, grouped by deal. All Kanban cards share this one
 * query (same parameters, same cache entry).
 */
export const useActiveDealTags = () => {
  const { data } = useGetList<DealTagAssignment>(DEAL_TAG_RESOURCE, {
    pagination: { page: 1, perPage: 1000 },
    sort: { field: "created_at", order: "ASC" },
    filter: { "removed_at@is": null },
  });

  return useMemo(() => {
    const byDeal = new Map<Identifier, DealTagAssignment[]>();
    (data ?? []).forEach((assignment) => {
      const list = byDeal.get(assignment.deal_id) ?? [];
      byDeal.set(assignment.deal_id, [...list, assignment]);
    });
    return (dealId: Identifier) => byDeal.get(dealId) ?? EMPTY;
  }, [data]);
};

/** Every tag a deal ever had: the active ones and the history. */
export const useDealTagHistory = (dealId: Identifier) => {
  const { data, isPending } = useGetList<DealTagAssignment>(DEAL_TAG_RESOURCE, {
    pagination: { page: 1, perPage: 500 },
    sort: { field: "created_at", order: "DESC" },
    filter: { deal_id: dealId },
  });

  return useMemo(
    () => ({
      active: (data ?? []).filter((a) => !a.removed_at).reverse(),
      removed: (data ?? []).filter((a) => !!a.removed_at),
      isPending,
    }),
    [data, isPending],
  );
};
