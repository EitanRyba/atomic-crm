import { useQueryClient } from "@tanstack/react-query";
import { useDataProvider, useNotify } from "ra-core";
import { useCallback } from "react";

import type { Deal, DealTagAssignment } from "../../types";

export const DEAL_TAG_RESOURCE = "deal_tag_assignments";

/**
 * Add, describe and remove the tags of a deal. Every change refreshes the
 * cached tag lists, and failures are reported to the user.
 */
export const useDealTagMutations = () => {
  const dataProvider = useDataProvider();
  const queryClient = useQueryClient();
  const notify = useNotify();

  const run = useCallback(
    async (mutation: () => Promise<unknown>): Promise<boolean> => {
      try {
        await mutation();
        return true;
      } catch {
        notify("resources.deals.tags.error", { type: "error" });
        return false;
      } finally {
        await queryClient.invalidateQueries({ queryKey: [DEAL_TAG_RESOURCE] });
      }
    },
    [notify, queryClient],
  );

  const addTag = useCallback(
    (deal: Pick<Deal, "id" | "stage">, tagValue: string) =>
      run(() =>
        dataProvider.create(DEAL_TAG_RESOURCE, {
          data: {
            deal_id: deal.id,
            stage: deal.stage,
            tag_value: tagValue,
            created_at: new Date().toISOString(),
          },
        }),
      ),
    [dataProvider, run],
  );

  const updateDescription = useCallback(
    (assignment: DealTagAssignment, description: string) =>
      run(() =>
        dataProvider.update(DEAL_TAG_RESOURCE, {
          id: assignment.id,
          data: { description: description.trim() || null },
          previousData: assignment,
        }),
      ),
    [dataProvider, run],
  );

  const removeTag = useCallback(
    (assignment: DealTagAssignment) =>
      run(() =>
        dataProvider.update(DEAL_TAG_RESOURCE, {
          id: assignment.id,
          data: {
            removed_at: new Date().toISOString(),
            removed_reason: "manual",
          },
          previousData: assignment,
        }),
      ),
    [dataProvider, run],
  );

  return { addTag, updateDescription, removeTag };
};
