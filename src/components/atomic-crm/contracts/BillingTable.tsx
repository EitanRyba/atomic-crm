import { useLocaleState, useTranslate } from "ra-core";
import { useState } from "react";
import { Link } from "react-router";
import { ReferenceField } from "@/components/admin/reference-field";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import type { YearMonth } from "./billing";
import { formatMonth, formatUsd } from "./formatBilling";
import type { BillingRow } from "./useBillingData";
import { useSubcommissionStatus } from "./useSubcommissionStatus";

/** One line per contract and month, newest first. */
export const BillingTable = ({
  rows,
  currentMonth,
}: {
  rows: BillingRow[];
  currentMonth: YearMonth;
}) => {
  const translate = useTranslate();
  const [locale = "es"] = useLocaleState();
  const sorted = [...rows].sort(
    (a, b) =>
      b.month.localeCompare(a.month) ||
      Number(a.contractId) - Number(b.contractId),
  );

  if (!sorted.length) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        {translate("crm.billing.empty")}
      </p>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>{translate("crm.billing.month")}</TableHead>
          <TableHead>
            {translate("resources.contracts.fields.company_id")}
          </TableHead>
          <TableHead className="text-right">
            {translate("crm.billing.fee")}
          </TableHead>
          <TableHead className="text-right">
            {translate("crm.billing.commission")}
          </TableHead>
          <TableHead>
            {translate("resources.contracts.fields.referral_company_id")}
          </TableHead>
          <TableHead className="text-right">
            {translate("crm.billing.subcommission")}
          </TableHead>
          <TableHead className="text-right">
            {translate("crm.billing.net")}
          </TableHead>
          <TableHead>{translate("crm.billing.subcommission_status")}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sorted.map((row) => (
          <TableRow key={`${row.contractId}/${row.month}`}>
            <TableCell className="whitespace-nowrap">
              {formatMonth(row.month, locale)}
              <span className="ml-1 text-xs text-muted-foreground">
                {translate("crm.billing.contract_month", {
                  month: row.contractMonth,
                })}
              </span>
            </TableCell>
            <TableCell>
              <Link
                to={`/contracts/${row.contractId}`}
                className="hover:underline"
              >
                <ReferenceField
                  record={{ id: row.contractId, company_id: row.companyId }}
                  source="company_id"
                  reference="companies"
                  link={false}
                />
              </Link>
            </TableCell>
            <TableCell className="text-right">
              {formatUsd(row.fee, locale)}
            </TableCell>
            <TableCell className="text-right whitespace-nowrap">
              {formatUsd(row.commission, locale)}
              <span className="ml-1 text-xs text-muted-foreground">
                {row.commissionPercent}%
              </span>
            </TableCell>
            <TableCell>
              {row.referralCompanyId ? (
                <ReferenceField
                  record={{
                    id: row.contractId,
                    referral_company_id: row.referralCompanyId,
                  }}
                  source="referral_company_id"
                  reference="companies"
                  link={false}
                />
              ) : (
                <span className="text-muted-foreground">—</span>
              )}
            </TableCell>
            <TableCell className="text-right">
              {row.subcommission ? formatUsd(row.subcommission, locale) : "—"}
            </TableCell>
            <TableCell className="text-right font-medium">
              {formatUsd(row.net, locale)}
            </TableCell>
            <TableCell>
              <SubcommissionStatus row={row} currentMonth={currentMonth} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

const SubcommissionStatus = ({
  row,
  currentMonth,
}: {
  row: BillingRow;
  currentMonth: YearMonth;
}) => {
  const translate = useTranslate();
  const setStatus = useSubcommissionStatus();
  const [isSaving, setIsSaving] = useState(false);

  if (!row.subcommission) return null;
  if (row.month > currentMonth && row.payment?.status !== "paid") {
    return (
      <span className="text-xs text-muted-foreground">
        {translate("crm.billing.projected")}
      </span>
    );
  }

  const isPaid = row.payment?.status === "paid";
  return (
    <div className="flex items-center gap-2">
      <Badge variant={isPaid ? "default" : "outline"}>
        {translate(isPaid ? "crm.billing.paid" : "crm.billing.pending")}
      </Badge>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="h-7 text-xs"
        disabled={isSaving}
        onClick={async () => {
          setIsSaving(true);
          await setStatus(row, isPaid ? "pending" : "paid");
          setIsSaving(false);
        }}
      >
        {translate(
          isPaid ? "crm.billing.mark_pending" : "crm.billing.mark_paid",
        )}
      </Button>
    </div>
  );
};
