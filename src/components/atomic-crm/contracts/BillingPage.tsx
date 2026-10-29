import { CanAccess, useGetMany, useLocaleState, useTranslate } from "ra-core";
import { Link, useSearchParams } from "react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import type { Company } from "../types";
import {
  addMonths,
  currentYearMonth,
  toYearMonth,
  totalsByMonth,
  type YearMonth,
} from "./billing";
import { BillingChart } from "./BillingChart";
import { BillingTable } from "./BillingTable";
import { formatUsd } from "./formatBilling";
import { useBillingData, type BillingFilters } from "./useBillingData";

// Months shown by default around the current one
const MONTHS_BEFORE = 5;
const MONTHS_AFTER = 6;
const ALL = "";

/** Billing: projected fees, commissions and sub-commissions (admins only). */
export const BillingPage = () => (
  <CanAccess resource="contracts" action="list">
    <BillingContent />
  </CanAccess>
);

BillingPage.path = "/billing";

const BillingContent = () => {
  const translate = useTranslate();
  const [locale = "es"] = useLocaleState();
  const currentMonth = currentYearMonth();
  const [searchParams, setSearchParams] = useSearchParams();

  // Filters live in the URL, so a filtered view can be reloaded or shared
  const filters: BillingFilters = {
    from:
      toYearMonth(searchParams.get("from")) ??
      addMonths(currentMonth, -MONTHS_BEFORE),
    to:
      toYearMonth(searchParams.get("to")) ??
      addMonths(currentMonth, MONTHS_AFTER),
    companyId: searchParams.get("company") ?? undefined,
    referralCompanyId: searchParams.get("referral") ?? undefined,
    onlyPending: searchParams.get("pending") === "1",
  };
  const setFilter = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    setSearchParams(next, { replace: true });
  };

  const { contracts, rows, isPending } = useBillingData(filters, currentMonth);
  const totals = totalsByMonth(
    rows,
    filters.from,
    filters.to < filters.from ? filters.from : filters.to,
  );
  const sum = (key: "fee" | "commission" | "subcommission" | "net") =>
    rows.reduce((total, row) => total + row[key], 0);
  const pendingSubcommission = rows
    .filter((row) => row.isPending)
    .reduce((total, row) => total + row.subcommission, 0);

  const companyIds = [...new Set(contracts.map((c) => c.company_id))];
  const referralIds = [
    ...new Set(
      contracts
        .map((c) => c.referral_company_id)
        .filter((id): id is NonNullable<typeof id> => id != null),
    ),
  ];
  const { data: companies = [] } = useGetMany<Company>("companies", {
    ids: [...new Set([...companyIds, ...referralIds])],
  });
  const nameOf = (id: unknown) =>
    companies.find((company) => company.id === id)?.name ?? String(id);

  return (
    <div className="mt-4 flex flex-col gap-6 pb-10">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-2xl font-semibold">
          {translate("crm.billing.title")}
        </h1>
        <div className="flex gap-2">
          <Button asChild variant="outline" size="sm">
            <Link to="/contracts">
              {translate("resources.contracts.name", { smart_count: 2 })}
            </Link>
          </Button>
          <Button asChild size="sm">
            <Link to="/contracts/create">
              {translate("resources.contracts.action.new")}
            </Link>
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="flex flex-wrap items-end gap-4">
          <MonthFilter
            id="billing-from"
            label={translate("crm.billing.from")}
            value={filters.from}
            onChange={(value) => setFilter("from", value)}
          />
          <MonthFilter
            id="billing-to"
            label={translate("crm.billing.to")}
            value={filters.to}
            onChange={(value) => setFilter("to", value)}
          />
          <SelectFilter
            id="billing-company"
            label={translate("resources.contracts.fields.company_id")}
            value={filters.companyId ?? ALL}
            options={companyIds.map((id) => ({
              id: String(id),
              name: nameOf(id),
            }))}
            onChange={(value) => setFilter("company", value)}
          />
          <SelectFilter
            id="billing-referral"
            label={translate("resources.contracts.fields.referral_company_id")}
            value={filters.referralCompanyId ?? ALL}
            options={referralIds.map((id) => ({
              id: String(id),
              name: nameOf(id),
            }))}
            onChange={(value) => setFilter("referral", value)}
          />
          <div className="flex items-center gap-2 pb-2">
            <Checkbox
              id="billing-pending"
              checked={!!filters.onlyPending}
              onCheckedChange={(checked) =>
                setFilter("pending", checked ? "1" : "")
              }
            />
            <Label htmlFor="billing-pending">
              {translate("crm.billing.only_pending")}
            </Label>
          </div>
        </CardContent>
      </Card>

      {isPending ? null : (
        <>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
            <Kpi
              label={translate("crm.billing.fee")}
              value={formatUsd(sum("fee"), locale)}
            />
            <Kpi
              label={translate("crm.billing.commission")}
              value={formatUsd(sum("commission"), locale)}
            />
            <Kpi
              label={translate("crm.billing.subcommission")}
              value={formatUsd(sum("subcommission"), locale)}
            />
            <Kpi
              label={translate("crm.billing.net")}
              value={formatUsd(sum("net"), locale)}
            />
            <Kpi
              label={translate("crm.billing.pending_subcommission")}
              value={formatUsd(pendingSubcommission, locale)}
              tone={pendingSubcommission > 0 ? "warning" : undefined}
            />
          </div>

          <Card>
            <CardContent>
              <BillingChart totals={totals} />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="overflow-x-auto">
              <BillingTable rows={rows} currentMonth={currentMonth} />
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

const Kpi = ({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "warning";
}) => (
  <Card className="gap-1 p-4">
    <span className="text-xs text-muted-foreground">{label}</span>
    <span
      className={`text-lg font-semibold ${tone === "warning" ? "text-orange-600 dark:text-orange-400" : ""}`}
    >
      {value}
    </span>
  </Card>
);

const MonthFilter = ({
  id,
  label,
  value,
  onChange,
}: {
  id: string;
  label: string;
  value: YearMonth;
  onChange: (value: string) => void;
}) => (
  <div className="flex flex-col gap-1">
    <Label htmlFor={id}>{label}</Label>
    <Input
      id={id}
      type="month"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="w-40"
    />
  </div>
);

const SelectFilter = ({
  id,
  label,
  value,
  options,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  options: { id: string; name: string }[];
  onChange: (value: string) => void;
}) => {
  const translate = useTranslate();
  return (
    <div className="flex flex-col gap-1">
      <Label htmlFor={id}>{label}</Label>
      <select
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-9 w-48 rounded-md border bg-background px-2 text-sm"
      >
        <option value={ALL}>{translate("crm.billing.all")}</option>
        {[...options]
          .sort((a, b) => a.name.localeCompare(b.name))
          .map((option) => (
            <option key={option.id} value={option.id}>
              {option.name}
            </option>
          ))}
      </select>
    </div>
  );
};
