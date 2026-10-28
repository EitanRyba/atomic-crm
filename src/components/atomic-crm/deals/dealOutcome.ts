import { addMonths, format } from "date-fns";

import type { Deal, DealStageTag } from "../types";

// Stage identifiers the code relies on (dialogs, dashboard, database checks).
export const WON_STAGE = "won";
export const LOST_STAGE = "lost";
export const POSTPONED_STAGE = "postponed";
export const DISCOVERY_STAGE = "discovery";

// Stages hidden from the Kanban board unless the user asks to see them
export const CLOSED_STAGES = [POSTPONED_STAGE, LOST_STAGE];

// Whether the Kanban shows the "Pospuesto" and "Perdido" columns
export const SHOW_CLOSED_STAGES_STORE_KEY = "deals.showClosedStages";

/**
 * List filter keeping the deals of the visible Kanban columns, so that lost
 * deals piling up never push active ones out of the loaded page.
 */
export const openStagesFilter = (
  dealStages: { value: string }[],
): Record<string, string> => ({
  "stage@in": `(${dealStages
    .map((stage) => stage.value)
    .filter((value) => !CLOSED_STAGES.includes(value))
    .join(",")})`,
});

export const LOST_REASONS = [
  "said-no",
  "no-response",
  "wrong-contact",
  "contact-left",
  "pilot-churn",
] as const;

// Reason given to deals that were lost before reasons were recorded
export const UNSPECIFIED_LOST_REASON = "unspecified";

export const TAG_DESCRIPTION_MAX_LENGTH = 200;

// Postponed deals show up on the dashboard this many days before their date
export const POSTPONED_REMINDER_DAYS = 7;

/** Translation key of a lost reason ("said-no" -> "said_no"). */
export const lostReasonKey = (reason: string): string =>
  `resources.deals.outcome.lost_reasons.${reason.replaceAll("-", "_")}`;

/** Date input value (YYYY-MM-DD) three months after the given day. */
export const defaultPostponedUntil = (today: Date = new Date()): string =>
  format(addMonths(today, 3), "yyyy-MM-dd");

/** Today as a date input value (YYYY-MM-DD), in the local timezone. */
export const todayAsDateValue = (today: Date = new Date()): string =>
  format(today, "yyyy-MM-dd");

/** Whether a postponed deal should already have been resumed. */
export const isPostponedOverdue = (
  deal: Pick<Deal, "postponed_until">,
  today: Date = new Date(),
): boolean =>
  !!deal.postponed_until && deal.postponed_until < todayAsDateValue(today);

/** Latest postponed_until date shown by the dashboard reminder widget. */
export const postponedReminderLimit = (today: Date = new Date()): string => {
  const limit = new Date(today);
  limit.setDate(limit.getDate() + POSTPONED_REMINDER_DAYS);
  return todayAsDateValue(limit);
};

/** Tags of a stage, in their configured order. */
export const getStageTags = (
  dealStageTags: DealStageTag[],
  stage: string,
): DealStageTag[] => dealStageTags.filter((tag) => tag.stage === stage);

/** A configured tag, looked up first in the deal's stage then anywhere. */
export const findStageTag = (
  dealStageTags: DealStageTag[],
  stage: string,
  value: string,
): DealStageTag | undefined =>
  dealStageTags.find((tag) => tag.stage === stage && tag.value === value) ??
  dealStageTags.find((tag) => tag.value === value);

const isoDateRegex = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Day/month/year of a date column ("2026-10-28") or timestamp, in the user's
 * locale. Date columns are parsed as local days to avoid timezone shifts.
 */
export const formatShortDate = (value: string, locale = "es"): string => {
  const date = isoDateRegex.test(value)
    ? new Date(
        Number(value.slice(0, 4)),
        Number(value.slice(5, 7)) - 1,
        Number(value.slice(8, 10)),
      )
    : new Date(value);
  return new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
};
