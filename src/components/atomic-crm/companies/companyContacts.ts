import type { DataProvider, Identifier } from "ra-core";

import { cleanupContactForCreate } from "../contacts/contactModel";
import type { Company, Contact } from "../types";
import { cleanupCompanyCategories } from "./companyCategories";
import { cleanupCompanySites } from "./companySites";

/**
 * A contact row of the company create form: an existing contact moved to the
 * new company, or a new contact created in it.
 */
export interface CompanyContactRow {
  mode?: "existing" | "new";
  contact_id?: Identifier | null;
  first_name?: string | null;
  last_name?: string | null;
  email?: string | null;
}

export type CompanyCreateValues = Partial<Company> & {
  company_contacts?: CompanyContactRow[];
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const text = (value: unknown) =>
  typeof value === "string" ? value.trim() : "";

/** Whether a row names an existing contact or a complete new one. */
export const isCompanyContactRowComplete = (row: CompanyContactRow) =>
  row.mode === "new"
    ? !!text(row.first_name) &&
      !!text(row.last_name) &&
      EMAIL_REGEX.test(text(row.email))
    : row.contact_id != null && row.contact_id !== "";

/**
 * A company is created with at least one contact, and every row is complete.
 * Returns the translation key of the error, if any.
 */
export const validateCompanyContacts = (
  rows: CompanyContactRow[] | undefined | null,
): string | undefined => {
  if (!rows?.length) {
    return "resources.companies.validation.contacts_required";
  }
  const incomplete = rows.find((row) => !isCompanyContactRowComplete(row));
  if (!incomplete) return undefined;
  return incomplete.mode === "new"
    ? "resources.companies.validation.contact_incomplete"
    : "resources.companies.validation.contact_missing";
};

/** The company record to create, without the contact rows. */
export const toCompanyData = (
  values: CompanyCreateValues,
): Partial<Company> => {
  const { company_contacts: _contacts, ...company } = values;
  const website =
    company.website && !company.website.startsWith("http")
      ? `https://${company.website}`
      : company.website;
  return cleanupCompanySites(cleanupCompanyCategories({ ...company, website }));
};

/**
 * Creates the company, then its new contacts, then moves the chosen existing
 * contacts to it. Contacts that could not be saved are counted, not thrown:
 * the company exists already at that point.
 */
export const createCompanyWithContacts = async (
  dataProvider: DataProvider,
  values: CompanyCreateValues,
  salesId?: Identifier,
): Promise<{ company: Company; failedContacts: number }> => {
  // The same existing contact picked twice is moved once
  const rows = (values.company_contacts ?? []).filter(
    (row, index, all) =>
      row.mode === "new" ||
      all.findIndex(
        (other) =>
          other.mode !== "new" &&
          String(other.contact_id) === String(row.contact_id),
      ) === index,
  );
  const { data: company } = await dataProvider.create<Company>("companies", {
    data: toCompanyData(values),
  });

  const results = await Promise.allSettled(
    rows.map(async (row) => {
      if (row.mode === "new") {
        await dataProvider.create<Contact>("contacts", {
          data: cleanupContactForCreate({
            first_name: text(row.first_name),
            last_name: text(row.last_name),
            email_jsonb: [{ email: text(row.email), type: "Work" }],
            phone_jsonb: [],
            company_id: company.id,
            sales_id: salesId,
          } as unknown as Contact),
        });
        return;
      }
      const { data: contact } = await dataProvider.getOne<Contact>("contacts", {
        id: row.contact_id as Identifier,
      });
      await dataProvider.update<Contact>("contacts", {
        id: contact.id,
        data: { company_id: company.id },
        previousData: contact,
      });
    }),
  );

  return {
    company,
    failedContacts: results.filter((result) => result.status === "rejected")
      .length,
  };
};
