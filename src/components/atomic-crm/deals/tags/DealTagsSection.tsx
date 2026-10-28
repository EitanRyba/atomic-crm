import { useLocaleState, useTranslate } from "ra-core";

import { useConfigurationContext } from "../../root/ConfigurationContext";
import type { Deal, DealTagAssignment } from "../../types";
import { findDealLabel } from "../dealUtils";
import { findStageTag, formatShortDate, getStageTags } from "../dealOutcome";
import { DealTagList } from "./DealTagList";
import { useDealTagHistory } from "./useDealTags";

/** Deal page: the current tags (editable) and the tags it had before. */
export const DealTagsSection = ({ deal }: { deal: Deal }) => {
  const translate = useTranslate();
  const { dealStageTags } = useConfigurationContext();
  const { active, removed, isPending } = useDealTagHistory(deal.id);
  if (isPending) return null;
  const hasStageTags = getStageTags(dealStageTags, deal.stage).length > 0;

  return (
    <div className="m-4 flex flex-col gap-3">
      <div className="flex flex-col gap-1">
        <span className="text-xs tracking-wide text-muted-foreground">
          {translate("resources.deals.tags.title")}
        </span>
        {active.length || hasStageTags ? (
          <DealTagList
            deal={deal}
            assignments={active}
            readOnly={!!deal.archived_at}
          />
        ) : null}
        {!active.length && (deal.archived_at || !hasStageTags) ? (
          <span className="text-sm text-muted-foreground">—</span>
        ) : null}
      </div>
      {removed.length ? <DealTagHistory removed={removed} /> : null}
    </div>
  );
};

const DealTagHistory = ({ removed }: { removed: DealTagAssignment[] }) => {
  const translate = useTranslate();
  const [locale = "es"] = useLocaleState();
  const { dealStages, dealStageTags } = useConfigurationContext();

  return (
    <details className="text-sm">
      <summary className="cursor-pointer text-xs tracking-wide text-muted-foreground">
        {translate("resources.deals.tags.history", {
          smart_count: removed.length,
        })}
      </summary>
      <ul className="mt-2 flex flex-col gap-1.5">
        {removed.map((assignment) => {
          const tag = findStageTag(
            dealStageTags,
            assignment.stage,
            assignment.tag_value,
          );
          return (
            <li key={assignment.id} className="flex flex-col">
              <span>
                <span
                  className="mr-1.5 inline-block size-2.5 rounded-sm align-middle"
                  style={{ backgroundColor: tag?.color ?? "#e5e5e5" }}
                  aria-hidden
                />
                {tag?.label ?? assignment.tag_value}
                <span className="text-muted-foreground">
                  {" · "}
                  {findDealLabel(dealStages, assignment.stage) ??
                    assignment.stage}
                </span>
              </span>
              {assignment.description ? (
                <span className="whitespace-pre-line text-xs">
                  {assignment.description}
                </span>
              ) : null}
              <span className="text-xs text-muted-foreground">
                {translate(
                  assignment.removed_reason === "manual"
                    ? "resources.deals.tags.removed_manual"
                    : "resources.deals.tags.removed_stage_change",
                  {
                    added: formatShortDate(assignment.created_at, locale),
                    removed: formatShortDate(
                      assignment.removed_at ?? assignment.created_at,
                      locale,
                    ),
                  },
                )}
              </span>
            </li>
          );
        })}
      </ul>
    </details>
  );
};
