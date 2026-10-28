import { StickyNote } from "lucide-react";
import { useLocaleState, useTranslate } from "ra-core";
import { useState, type MouseEvent } from "react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { useGetSalesName } from "../../sales/useGetSalesName";
import type { DealStageTag, DealTagAssignment } from "../../types";
import { TAG_DESCRIPTION_MAX_LENGTH, formatShortDate } from "../dealOutcome";
import { useDealTagMutations } from "./useDealTagMutations";

const FALLBACK_TAG_COLOR = "#e5e5e5";

// Clicks inside a tag must not open the deal (the Kanban card is a link)
const stopPropagation = (event: MouseEvent) => event.stopPropagation();

interface DealTagChipProps {
  assignment: DealTagAssignment;
  tag?: DealStageTag;
  readOnly?: boolean;
}

/**
 * A tag applied to a deal. Hovering shows its description; clicking opens an
 * editor for the description (and to remove the tag).
 */
export const DealTagChip = ({
  assignment,
  tag,
  readOnly = false,
}: DealTagChipProps) => {
  const [open, setOpen] = useState(false);
  const label = tag?.label ?? assignment.tag_value;
  const chip = (
    <span
      className="inline-flex max-w-full items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] font-medium leading-4 text-neutral-900 shadow-xs"
      style={{ backgroundColor: tag?.color ?? FALLBACK_TAG_COLOR }}
    >
      <span className="truncate">{label}</span>
      {assignment.description ? (
        <StickyNote className="size-3 shrink-0" aria-hidden />
      ) : null}
    </span>
  );

  if (readOnly) {
    return assignment.description ? (
      <Tooltip>
        <TooltipTrigger asChild>{chip}</TooltipTrigger>
        <TooltipContent className="max-w-64 whitespace-pre-line">
          {assignment.description}
        </TooltipContent>
      </Tooltip>
    ) : (
      chip
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Tooltip>
        <TooltipTrigger asChild>
          <PopoverTrigger asChild>
            <button
              type="button"
              className="max-w-full cursor-pointer rounded-md focus-visible:outline-2 focus-visible:outline-ring"
              onClick={stopPropagation}
              aria-label={label}
            >
              {chip}
            </button>
          </PopoverTrigger>
        </TooltipTrigger>
        {assignment.description && !open ? (
          <TooltipContent className="max-w-64 whitespace-pre-line">
            {assignment.description}
          </TooltipContent>
        ) : null}
      </Tooltip>
      <PopoverContent className="w-80" onClick={stopPropagation}>
        {open ? (
          <DealTagEditor
            assignment={assignment}
            label={label}
            onDone={() => setOpen(false)}
          />
        ) : null}
      </PopoverContent>
    </Popover>
  );
};

const DealTagEditor = ({
  assignment,
  label,
  onDone,
}: {
  assignment: DealTagAssignment;
  label: string;
  onDone: () => void;
}) => {
  const translate = useTranslate();
  const [locale = "es"] = useLocaleState();
  const { updateDescription, removeTag } = useDealTagMutations();
  const [description, setDescription] = useState(assignment.description ?? "");
  const [isSaving, setIsSaving] = useState(false);
  const createdBy = useGetSalesName(assignment.sales_id ?? undefined);
  const updatedBy = useGetSalesName(assignment.updated_by ?? undefined);

  const save = async () => {
    setIsSaving(true);
    const saved = await updateDescription(assignment, description);
    setIsSaving(false);
    if (saved) onDone();
  };

  const remove = async () => {
    setIsSaving(true);
    const removed = await removeTag(assignment);
    setIsSaving(false);
    if (removed) onDone();
  };

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm font-medium">{label}</p>
      <div className="flex flex-col gap-1">
        <Textarea
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          maxLength={TAG_DESCRIPTION_MAX_LENGTH}
          placeholder={translate(
            "resources.deals.tags.description_placeholder",
          )}
          aria-label={translate("resources.deals.tags.description")}
          rows={3}
          autoFocus
        />
        <span className="self-end text-xs text-muted-foreground">
          {description.length}/{TAG_DESCRIPTION_MAX_LENGTH}
        </span>
      </div>
      <div className="flex flex-col gap-0.5 text-xs text-muted-foreground">
        <span>
          {translate("resources.deals.tags.added_by", {
            name: createdBy || "—",
            date: formatShortDate(assignment.created_at, locale),
          })}
        </span>
        {assignment.updated_at ? (
          <span>
            {translate("resources.deals.tags.edited_by", {
              name: updatedBy || "—",
              date: formatShortDate(assignment.updated_at, locale),
            })}
          </span>
        ) : null}
      </div>
      <div className="flex justify-between gap-2">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="text-destructive"
          onClick={remove}
          disabled={isSaving}
        >
          {translate("resources.deals.tags.remove")}
        </Button>
        <Button type="button" size="sm" onClick={save} disabled={isSaving}>
          {translate("ra.action.save")}
        </Button>
      </div>
    </div>
  );
};
