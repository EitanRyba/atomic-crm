import { useLocaleState, useTranslate } from "ra-core";
import { Link } from "react-router";
import { CreateButton } from "@/components/admin/create-button";
import { DataTable } from "@/components/admin/data-table";
import { List } from "@/components/admin/list";
import { ReferenceField } from "@/components/admin/reference-field";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import { TopToolbar } from "../layout/TopToolbar";
import type { Contract } from "../types";
import {
  commissionPercentAt,
  contractMonthOf,
  currentYearMonth,
  feeAt,
  getContractStatus,
  toYearMonth,
  type ContractStatus,
} from "./billing";
import { formatMonth, formatUsd } from "./formatBilling";

const ContractListActions = () => {
  const translate = useTranslate();
  return (
    <TopToolbar>
      <Button asChild variant="outline" size="sm" className="h-9">
        <Link to="/billing">{translate("crm.billing.title")}</Link>
      </Button>
      <CreateButton label="resources.contracts.action.new" />
    </TopToolbar>
  );
};

const statusVariant: Record<
  ContractStatus,
  "default" | "secondary" | "outline"
> = {
  active: "default",
  awaiting_payment: "outline",
  ended: "secondary",
};

export const ContractList = () => {
  const translate = useTranslate();
  const [locale = "es"] = useLocaleState();
  const month = currentYearMonth();

  return (
    <List
      title={translate("resources.contracts.name", { smart_count: 2 })}
      actions={<ContractListActions />}
      sort={{ field: "first_payment_month", order: "DESC" }}
      perPage={50}
    >
      <DataTable rowClick="edit" bulkActionButtons={false}>
        <DataTable.Col source="company_id">
          <ReferenceField
            source="company_id"
            reference="companies"
            link={false}
          />
        </DataTable.Col>
        <DataTable.Col source="referral_company_id">
          <ReferenceField
            source="referral_company_id"
            reference="companies"
            link={false}
            empty={<span className="text-muted-foreground">—</span>}
          />
        </DataTable.Col>
        <DataTable.Col
          source="first_payment_month"
          render={(contract: Contract) =>
            contract.first_payment_month
              ? formatMonth(contract.first_payment_month, locale)
              : "—"
          }
        />
        <DataTable.Col
          label="resources.contracts.fields.current_fee"
          render={(contract: Contract) =>
            formatUsd(feeAt(contract.fee_history ?? [], month), locale)
          }
        />
        <DataTable.Col
          label="resources.contracts.fields.current_commission"
          render={(contract: Contract) => {
            const firstPayment = toYearMonth(contract.first_payment_month);
            const contractMonth = firstPayment
              ? Math.max(1, contractMonthOf(firstPayment, month))
              : 1;
            return `${commissionPercentAt(contract.commission_rules ?? [], contractMonth)}%`;
          }}
        />
        <DataTable.Col
          label="resources.contracts.fields.status"
          render={(contract: Contract) => {
            const status = getContractStatus(contract, month);
            return (
              <Badge variant={statusVariant[status]}>
                {translate(`resources.contracts.statuses.${status}`)}
              </Badge>
            );
          }}
        />
      </DataTable>
    </List>
  );
};
