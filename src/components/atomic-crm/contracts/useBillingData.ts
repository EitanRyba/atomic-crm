import { useGetList } from "ra-core";
import { useMemo } from "react";

import type { Contract, SubcommissionPayment } from "../types";
import {
  getContractMonths,
  toMonthDate,
  toYearMonth,
  type ContractMonth,
  type YearMonth,
} from "./billing";

export interface BillingFilters {
  from: YearMonth;
  to: YearMonth;
  companyId?: string;
  referralCompanyId?: string;
  onlyPending?: boolean;
}

export interface BillingRow extends ContractMonth {
  payment?: SubcommissionPayment;
  // the sub-commission of a month already started that was not paid yet
  isPending: boolean;
}

const CONTRACTS_PAGE = 500;

/**
 * Month by month amounts of every contract in the filters, with the
 * sub-commission payment recorded for each month.
 */
export const useBillingData = (
  filters: BillingFilters,
  currentMonth: YearMonth,
) => {
  const { data: contracts, isPending: contractsPending } = useGetList<Contract>(
    "contracts",
    {
      pagination: { page: 1, perPage: CONTRACTS_PAGE },
      sort: { field: "id", order: "ASC" },
    },
  );
  const { data: payments, isPending: paymentsPending } =
    useGetList<SubcommissionPayment>("subcommission_payments", {
      pagination: { page: 1, perPage: 5000 },
      sort: { field: "month", order: "ASC" },
      filter: {
        "month@gte": toMonthDate(filters.from),
        "month@lte": toMonthDate(filters.to),
      },
    });

  const rows = useMemo<BillingRow[]>(() => {
    if (!contracts) return [];
    const paymentFor = new Map(
      (payments ?? []).map((payment) => [
        `${payment.contract_id}/${toYearMonth(payment.month)}`,
        payment,
      ]),
    );
    return contracts
      .filter(
        (contract) =>
          (!filters.companyId ||
            String(contract.company_id) === filters.companyId) &&
          (!filters.referralCompanyId ||
            String(contract.referral_company_id) === filters.referralCompanyId),
      )
      .flatMap((contract) =>
        getContractMonths(contract, filters.from, filters.to),
      )
      .map((row) => {
        const payment = paymentFor.get(`${row.contractId}/${row.month}`);
        return {
          ...row,
          payment,
          isPending:
            row.subcommission > 0 &&
            row.month <= currentMonth &&
            payment?.status !== "paid",
        };
      })
      .filter((row) => !filters.onlyPending || row.isPending);
  }, [contracts, payments, filters, currentMonth]);

  return {
    contracts: contracts ?? [],
    rows,
    isPending: contractsPending || paymentsPending,
  };
};
