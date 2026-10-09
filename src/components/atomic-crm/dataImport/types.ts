import type { ImportableResourceName } from "./useImportableResources";

/**
 * A single parsed CSV cell. Papa Parse runs with `dynamicTyping`, so numeric and
 * boolean cells are already converted, an empty cell is null, and everything
 * else is a string.
 */
export type ImportCell = string | number | boolean | null;

/** One parsed CSV row, keyed by column header. */
export type ImportRow = Record<string, ImportCell>;

/**
 * Things worth telling the user once the import is over, counted per batch:
 * the contacts that went to "Por definir", and the companies that existed
 * already and were reused instead of being duplicated.
 */
export type ImportNotices = {
  placeholderContacts?: number;
  duplicateCompanies?: number;
};

/** How many rows of a batch were created, with the notices they raised */
export type ImportBatchResult = { created: number; notices?: ImportNotices };

/**
 * Creates the records of one batch of parsed CSV rows, and returns how many of
 * them were created: the rows the database refused are the batch's errors.
 */
export type ProcessImportBatch = (
  batch: ImportRow[],
) => Promise<number | ImportBatchResult>;

/** A resource the import dialog can import a CSV file into. */
export type ImportableResource = {
  /** Resource name, as registered in the Admin (e.g. "companies") */
  name: ImportableResourceName;
  /** CSV content offered as a downloadable template for this resource */
  sampleCsv: string;
  /**
   * Columns Papa Parse must leave as text, because a leading zero carries
   * meaning there: a `02134` zipcode would otherwise be stored as `2134`.
   */
  textColumns?: string[];
  processBatch: ProcessImportBatch;
};
