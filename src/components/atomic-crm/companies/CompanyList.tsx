import jsonExport from "jsonexport/dist";
import {
  downloadCSV,
  type Exporter,
  useGetIdentity,
  useListContext,
  useListParams,
  useTranslate,
} from "ra-core";
import { CreateButton } from "@/components/admin/create-button";
import { ExportButton } from "@/components/admin/export-button";
import { List } from "@/components/admin/list";
import { ListPagination } from "@/components/admin/list-pagination";
import { SortButton } from "@/components/admin/sort-button";

import { DataImportButton } from "../dataImport/DataImportButton";
import { TopToolbar } from "../layout/TopToolbar";
import type { Company } from "../types";
import { CompanyEmpty } from "./CompanyEmpty";
import { CompanyListFilter } from "./CompanyListFilter";
import { ImageList } from "./GridList";

const sort = { field: "name", order: "ASC" } as const;

export const CompanyList = () => {
  const { identity } = useGetIdentity();
  // The "Por definir" system company only shows up with its own filter: read
  // the list parameters the List itself will use to know whether it is on
  const [{ filterValues }] = useListParams({
    resource: "companies",
    perPage: 25,
    sort,
  });
  const showsPlaceholder =
    (filterValues as { is_placeholder?: boolean }).is_placeholder === true;
  if (!identity) return null;
  return (
    <List
      title={false}
      perPage={25}
      sort={sort}
      filter={showsPlaceholder ? undefined : { "is_placeholder@neq": true }}
      exporter={exporter}
      actions={<CompanyListActions />}
      pagination={<ListPagination rowsPerPageOptions={[10, 25, 50, 100]} />}
    >
      <CompanyListLayout />
    </List>
  );
};

const CompanyListLayout = () => {
  const { data, isPending, filterValues } = useListContext();
  const hasFilters = filterValues && Object.keys(filterValues).length > 0;

  if (isPending) return null;
  if (!data?.length && !hasFilters) return <CompanyEmpty />;

  return (
    <div className="w-full flex flex-row gap-8">
      <CompanyListFilter />
      <div className="flex flex-col flex-1 gap-4">
        <ImageList />
      </div>
    </div>
  );
};

const CompanyListActions = () => {
  const translate = useTranslate();
  return (
    <TopToolbar>
      <SortButton fields={["name", "created_at", "nb_contacts"]} />
      <DataImportButton resource="companies" />
      <ExportButton exporter={exporter} />
      <CreateButton
        label={translate("resources.companies.action.new", {
          _: "New Company",
        })}
      />
    </TopToolbar>
  );
};

/**
 * Exports the companies with the `category` and `referred_by` columns the
 * company CSV import reads, so that an export can be imported back.
 */
const exporter: Exporter<Company> = (records) => {
  const companies = records.map(
    ({
      is_client,
      is_referral,
      is_placeholder: _isPlaceholder,
      referred_by_company_id: _referredById,
      referred_by_name,
      ...company
    }) => ({
      ...company,
      category: [is_client && "cliente", is_referral && "referido"]
        .filter(Boolean)
        .join(", "),
      referred_by: referred_by_name ?? "",
    }),
  );
  return jsonExport(companies, {}, (_err: any, csv: string) => {
    downloadCSV(csv, "companies");
  });
};
