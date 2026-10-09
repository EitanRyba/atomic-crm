import { useDataProvider, useGetIdentity } from "ra-core";
import { useCallback, useMemo } from "react";

import type { Company, Tag } from "../types";
import { buyerRoleChoices } from "../misc/prospectingChoices";
import { toConfiguredValue } from "../dataImport/parseCell";
import { createEachRow } from "../dataImport/createEachRow";
import { fetchRecordsWithCache } from "../dataImport/fetchRecordsWithCache";
import { useCompanyResolver } from "../dataImport/useCompanyResolver";
import type { ImportBatchResult } from "../dataImport/types";
import {
  getPlaceholderCompany,
  isPlaceholderCompanyName,
} from "../companies/placeholderCompany";

export type ContactImportSchema = {
  first_name: string;
  last_name: string;
  gender: string;
  title: string;
  company: string;
  email_work: string;
  email_home: string;
  email_other: string;
  phone_work: string;
  phone_home: string;
  phone_other: string;
  background: string;
  avatar: string;
  first_seen: string;
  last_seen: string;
  has_newsletter: string;
  status: string;
  tags: string;
  linkedin_url: string;
  buyer_role?: string;
};

export function useContactImport() {
  const today = new Date().toISOString();
  const user = useGetIdentity();
  const dataProvider = useDataProvider();

  const getCompanies = useCompanyResolver();

  // Tags cache to avoid creating the same tag multiple times and costly roundtrips
  // Cache is dependent of dataProvider, so it's safe to use it as a dependency
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const tagsCache = useMemo(() => new Map<string, Tag>(), [dataProvider]);
  const getTags = useCallback(
    async (names: string[]) =>
      fetchRecordsWithCache<Tag>(
        "tags",
        tagsCache,
        names,
        (name) => ({
          name,
          color: "#f9f9f9",
        }),
        dataProvider,
      ),
    [tagsCache, dataProvider],
  );

  // The "Por definir" company, fetched once per import
  const placeholderCache = useMemo(
    () => ({ company: undefined as Promise<Company> | undefined }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [dataProvider],
  );
  const getPlaceholder = useCallback(() => {
    placeholderCache.company ??= getPlaceholderCompany(dataProvider);
    return placeholderCache.company;
  }, [dataProvider, placeholderCache]);

  const processBatch = useCallback(
    async (batch: ContactImportSchema[]): Promise<ImportBatchResult> => {
      // A contact whose company is unknown waits in "Por definir"
      const hasUnknownCompany = (companyName?: string) =>
        !companyName?.trim() || isPlaceholderCompanyName(companyName);
      const placeholder = batch.some(({ company }) =>
        hasUnknownCompany(company),
      )
        ? await getPlaceholder()
        : undefined;
      let placeholderContacts = 0;

      const [companies, tags] = await Promise.all([
        getCompanies(
          batch
            .map((contact) => contact.company?.trim())
            .filter((name) => name),
        ),
        getTags(batch.flatMap((batch) => parseTags(batch.tags))),
      ]);

      const createdCount = await createEachRow(
        batch.map(
          ({
            first_name,
            last_name,
            gender,
            title,
            email_work,
            email_home,
            email_other,
            phone_work,
            phone_home,
            phone_other,
            background,
            first_seen,
            last_seen,
            has_newsletter,
            status,
            company: companyName,
            tags: tagNames,
            linkedin_url,
            buyer_role,
          }) => {
            const email_jsonb = [
              { email: email_work, type: "Work" },
              { email: email_home, type: "Home" },
              { email: email_other, type: "Other" },
            ].filter(({ email }) => email);
            const phone_jsonb = [
              { number: phone_work, type: "Work" },
              { number: phone_home, type: "Home" },
              { number: phone_other, type: "Other" },
            ].filter(({ number }) => number);
            const company = hasUnknownCompany(companyName)
              ? placeholder
              : companies.get(companyName.trim());
            const tagList = parseTags(tagNames)
              .map((name) => tags.get(name))
              .filter((tag): tag is Tag => !!tag);

            const created = dataProvider.create("contacts", {
              data: {
                first_name,
                last_name,
                gender,
                title,
                email_jsonb,
                phone_jsonb,
                background,
                first_seen: first_seen
                  ? new Date(first_seen).toISOString()
                  : today,
                last_seen: last_seen
                  ? new Date(last_seen).toISOString()
                  : today,
                has_newsletter,
                status,
                company_id: company?.id,
                tags: tagList.map((tag) => tag.id),
                sales_id: user?.identity?.id,
                linkedin_url,
                buyer_role: toConfiguredValue(
                  buyer_role ?? null,
                  buyerRoleOptions,
                ),
              },
            });
            return company && company.id === placeholder?.id
              ? created.then((result) => {
                  placeholderContacts += 1;
                  return result;
                })
              : created;
          },
        ),
      );

      return { created: createdCount, notices: { placeholderContacts } };
    },
    [
      dataProvider,
      getCompanies,
      getPlaceholder,
      getTags,
      user?.identity?.id,
      today,
    ],
  );

  return processBatch;
}

const buyerRoleOptions = buyerRoleChoices.map(({ id, name }) => ({
  value: id,
  label: name,
}));

const parseTags = (tags: string) =>
  tags
    ?.split(",")
    ?.map((tag: string) => tag.trim())
    ?.filter((tag: string) => tag) ?? [];
