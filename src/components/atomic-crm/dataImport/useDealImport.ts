import { useCallback } from "react";
import {
  useDataProvider,
  useGetIdentity,
  useTranslate,
  type DataProvider,
} from "ra-core";

import { useConfigurationContext } from "../root/ConfigurationContext";
import { useCompanyResolver } from "./useCompanyResolver";
import { createEachRow } from "./createEachRow";
import {
  LOST_REASONS,
  UNSPECIFIED_LOST_REASON,
  lostReasonKey,
} from "../deals/dealOutcome";
import { resolveImportedStage, toImportedOutcome } from "./dealStageImport";
import { toConfiguredValue, toInteger, toIsoDate, toText } from "./parseCell";
import type { ImportRow, ProcessImportBatch } from "./types";

/** One CSV row, with the values needed before its deal can be created. */
type DealRow = {
  row: ImportRow;
  companyName: string | undefined;
  stage: string | undefined;
  // tag carried over from a stage of the previous version of the CRM
  tag: string | undefined;
};

/**
 * Creates a deal per CSV row. Unknown columns are ignored, missing ones are
 * left empty — except `name`, which the database requires. The `company` column
 * holds a company name and is required: matching companies are reused, unknown
 * ones are created as client companies. Stages of the previous version of the
 * CRM are mapped to the current ones, and lost / postponed deals take their
 * details from the lost_reason, lost_reason_detail, postponed_until and
 * postponed_reason columns.
 */
export function useDealImport(): ProcessImportBatch {
  const { dealCategories, dealStages } = useConfigurationContext();
  const { identity } = useGetIdentity();
  const dataProvider = useDataProvider();
  const getCompanies = useCompanyResolver();
  const translate = useTranslate();

  return useCallback(
    async (batch) => {
      // Parse the company name and the stage once per row: both are needed to
      // resolve companies and column indexes up front, then again per deal.
      const rows: DealRow[] = batch.map((row) => {
        const imported = resolveImportedStage(row.stage, dealStages);
        return {
          row,
          companyName: toText(row.company),
          // stage is required, so fall back to the first configured one
          stage: imported?.stage ?? dealStages[0]?.value,
          tag: imported?.tag,
        };
      });
      const reasonLabels = Object.fromEntries(
        [...LOST_REASONS, UNSPECIFIED_LOST_REASON].map((reason) => [
          reason,
          translate(lostReasonKey(reason)),
        ]),
      );

      const [companies, indexes] = await Promise.all([
        getCompanies(
          rows
            .map(({ companyName }) => companyName)
            .filter((name): name is string => name !== undefined),
        ),
        appendedIndexes(rows, dataProvider),
      ]);

      const now = new Date().toISOString();
      return createEachRow(
        rows.map(async ({ row, companyName, stage, tag }) => {
          // A deal is sold to a client company: a row naming none fails
          const company = companyName ? companies.get(companyName) : undefined;
          if (!company) {
            throw new Error(
              companyName
                ? `Deal "${toText(row.name) ?? ""}" cannot be linked to the company "${companyName}"`
                : `Deal "${toText(row.name) ?? ""}" has no company: the company column is required`,
            );
          }
          const outcome = toImportedOutcome(row, stage ?? "", reasonLabels);
          const { data: deal } = await dataProvider.create("deals", {
            data: {
              name: toText(row.name),
              company_id: company.id,
              contact_ids: [],
              category: toConfiguredValue(row.category, dealCategories),
              stage,
              description: toText(row.description),
              // amount lands in a bigint column, which rejects "4500.50"
              amount: toInteger(row.amount),
              expected_closing_date: toIsoDate(row.expected_closing_date),
              sales_id: identity?.id,
              index: indexes.get(row) ?? 0,
              created_at: now,
              updated_at: now,
              ...outcome,
            },
          });
          if (tag) {
            // The deal exists already: a missing tag must not count the row
            // as failed, which would duplicate it on the next import
            await dataProvider
              .create("deal_tag_assignments", {
                data: {
                  deal_id: deal.id,
                  stage,
                  tag_value: tag,
                  created_at: now,
                },
              })
              .catch((error: unknown) => {
                console.error("Failed to tag an imported deal", error);
              });
          }
          return deal;
        }),
      );
    },
    [
      dataProvider,
      dealCategories,
      dealStages,
      getCompanies,
      identity?.id,
      translate,
    ],
  );
}

/**
 * One distinct index per imported deal, appended below the deals already in its
 * stage and keeping the CSV row order.
 *
 * The Kanban board sorts each column on `index`, and its drag handler shifts the
 * indexes of the cards around the drop target. A column whose deals all share
 * `index: 0` therefore cannot be reordered — the drop writes `index: 0` again
 * and the card snaps back — and its order is whatever the backend returns.
 */
const appendedIndexes = async (
  rows: DealRow[],
  dataProvider: DataProvider,
): Promise<Map<ImportRow, number>> => {
  const stages = [
    ...new Set(
      rows
        .map(({ stage }) => stage)
        .filter((stage): stage is string => stage !== undefined),
    ),
  ];
  const lastIndexes = new Map(
    await Promise.all(
      stages.map(
        async (stage) =>
          [stage, await lastIndexOf(stage, dataProvider)] as const,
      ),
    ),
  );

  return new Map(
    stages.flatMap((stage) => {
      const firstIndex = (lastIndexes.get(stage) ?? -1) + 1;
      return rows
        .filter((candidate) => candidate.stage === stage)
        .map(({ row }, position) => [row, firstIndex + position] as const);
    }),
  );
};

/** Highest index currently used in a stage, or -1 when it holds no deal. */
const lastIndexOf = async (stage: string, dataProvider: DataProvider) => {
  const { data } = await dataProvider.getList("deals", {
    filter: { stage },
    pagination: { page: 1, perPage: 1 },
    sort: { field: "index", order: "DESC" },
  });
  return data[0]?.index ?? -1;
};
