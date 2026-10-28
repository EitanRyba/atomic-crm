import { Plus } from "lucide-react";
import { useTranslate } from "ra-core";
import { useState, type MouseEvent } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import { useConfigurationContext } from "../../root/ConfigurationContext";
import type { Deal, DealTagAssignment } from "../../types";
import { findStageTag, getStageTags } from "../dealOutcome";
import { DealTagChip } from "./DealTagChip";
import { useDealTagMutations } from "./useDealTagMutations";

const stopPropagation = (event: MouseEvent) => event.stopPropagation();

interface DealTagListProps {
  deal: Pick<Deal, "id" | "stage">;
  // Active (not removed) tags of this deal
  assignments: DealTagAssignment[];
  readOnly?: boolean;
}

/** The tags of a deal, plus a button to add one of its stage's tags. */
export const DealTagList = ({
  deal,
  assignments,
  readOnly = false,
}: DealTagListProps) => {
  const { dealStageTags } = useConfigurationContext();
  const stageTags = getStageTags(dealStageTags, deal.stage);
  const available = stageTags.filter(
    (tag) => !assignments.some((a) => a.tag_value === tag.value),
  );

  if (!assignments.length && (readOnly || !available.length)) return null;

  return (
    <div className="flex flex-wrap items-center gap-1">
      {assignments.map((assignment) => (
        <DealTagChip
          key={assignment.id}
          assignment={assignment}
          tag={findStageTag(dealStageTags, deal.stage, assignment.tag_value)}
          readOnly={readOnly}
        />
      ))}
      {!readOnly && available.length ? (
        <AddDealTagButton deal={deal} available={available} />
      ) : null}
    </div>
  );
};

const AddDealTagButton = ({
  deal,
  available,
}: {
  deal: Pick<Deal, "id" | "stage">;
  available: ReturnType<typeof getStageTags>;
}) => {
  const translate = useTranslate();
  const [open, setOpen] = useState(false);
  const { addTag } = useDealTagMutations();

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          onClick={stopPropagation}
          className="inline-flex cursor-pointer items-center gap-0.5 rounded-md border border-dashed px-1.5 py-0.5 text-[11px] leading-4 text-muted-foreground hover:bg-muted"
        >
          <Plus className="size-3" aria-hidden />
          {translate("resources.deals.tags.add")}
        </button>
      </PopoverTrigger>
      <PopoverContent
        className="flex w-60 flex-col gap-1 p-2"
        onClick={stopPropagation}
      >
        {available.map((tag) => (
          <button
            key={tag.value}
            type="button"
            className="flex cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-left text-sm hover:bg-muted"
            onClick={async () => {
              setOpen(false);
              await addTag(deal, tag.value);
            }}
          >
            <span
              className="size-3 shrink-0 rounded-sm"
              style={{ backgroundColor: tag.color }}
              aria-hidden
            />
            {tag.label}
          </button>
        ))}
      </PopoverContent>
    </Popover>
  );
};
