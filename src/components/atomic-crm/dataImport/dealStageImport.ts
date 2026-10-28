import type { DealStage } from "../types";
import {
  LOST_REASONS,
  LOST_STAGE,
  POSTPONED_STAGE,
  UNSPECIFIED_LOST_REASON,
} from "../deals/dealOutcome";
import { toConfiguredValue, toIsoDate, toText } from "./parseCell";
import type { ImportRow } from "./types";

/**
 * Stages of the first version of this CRM (identifiers and their Spanish
 * labels, as found in older exports) and where they land now, with the tag
 * that keeps the detail the new stage no longer carries.
 */
const LEGACY_STAGES: Record<string, { stage: string; tag?: string }> = {
  identified: { stage: "first-contact" },
  "prospecto identificado": { stage: "first-contact" },
  "meeting-scheduled": { stage: "lead", tag: "first-meeting-scheduled" },
  "reunión agendada": { stage: "lead", tag: "first-meeting-scheduled" },
  "demo-done": { stage: "discovery" },
  "demo realizada": { stage: "discovery" },
  "proposal-sent": { stage: "champion", tag: "proposal-sent" },
  "propuesta enviada": { stage: "champion", tag: "proposal-sent" },
  "in-negociation": { stage: "negotiation" },
  implementation: { stage: "won", tag: "implementation-in-progress" },
  "en implementación": { stage: "won", tag: "implementation-in-progress" },
};

export type ImportedStage = { stage: string; tag?: string };

/**
 * The stage of an imported deal: a configured stage (by identifier or label)
 * first, then a stage of the previous version mapped to its new stage.
 * Undefined when the cell matches neither.
 */
export const resolveImportedStage = (
  cell: ImportRow[string],
  dealStages: DealStage[],
): ImportedStage | undefined => {
  const configured = toConfiguredValue(cell, dealStages);
  if (configured) return { stage: configured };

  const legacy = LEGACY_STAGES[toText(cell)?.toLowerCase() ?? ""];
  if (legacy && dealStages.some((stage) => stage.value === legacy.stage)) {
    return legacy;
  }
  return undefined;
};

export type ImportedOutcome = {
  lost_reason?: string;
  lost_reason_detail?: string;
  postponed_until?: string;
  postponed_reason?: string;
};

/**
 * Lost / postponed details of an imported deal. A lost deal without a known
 * reason gets the "unspecified" one; a postponed deal needs a date and a
 * reason, else the row is rejected (the database requires both).
 *
 * @param reasonLabels translated label of each lost reason, by identifier
 */
export const toImportedOutcome = (
  row: ImportRow,
  stage: string,
  reasonLabels: Record<string, string>,
): ImportedOutcome => {
  if (stage === LOST_STAGE) {
    const reasons = [...LOST_REASONS, UNSPECIFIED_LOST_REASON].map((value) => ({
      value,
      label: reasonLabels[value] ?? value,
    }));
    return {
      lost_reason:
        toConfiguredValue(row.lost_reason, reasons) ?? UNSPECIFIED_LOST_REASON,
      lost_reason_detail: toText(row.lost_reason_detail),
    };
  }

  if (stage === POSTPONED_STAGE) {
    const postponedUntil = toIsoDate(row.postponed_until);
    const postponedReason = toText(row.postponed_reason);
    if (!postponedUntil || !postponedReason) {
      throw new Error(
        `Deal "${toText(row.name) ?? ""}" is postponed: the postponed_until and postponed_reason columns are required`,
      );
    }
    return {
      // a date column: keep the day only
      postponed_until: postponedUntil.slice(0, 10),
      postponed_reason: postponedReason,
    };
  }

  return {};
};
