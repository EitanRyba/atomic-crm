import { useQueryClient } from "@tanstack/react-query";
import { useDataProvider, useNotify } from "ra-core";
import { useCallback } from "react";

import type { SubcommissionPaymentStatus } from "../types";
import { toMonthDate } from "./billing";
import type { BillingRow } from "./useBillingData";

const RESOURCE = "subcommission_payments";

/** Today as a date column value (YYYY-MM-DD), in the local timezone. */
const today = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
};

/**
 * Marks the sub-commission of a contract month as paid or pending. A paid
 * month keeps the amount computed at that moment and the payment date.
 */
export const useSubcommissionStatus = () => {
  const dataProvider = useDataProvider();
  const queryClient = useQueryClient();
  const notify = useNotify();

  return useCallback(
    async (row: BillingRow, status: SubcommissionPaymentStatus) => {
      const data =
        status === "paid"
          ? { status, amount: row.subcommission, paid_at: today() }
          : { status, amount: null, paid_at: null };
      try {
        if (row.payment) {
          await dataProvider.update(RESOURCE, {
            id: row.payment.id,
            data,
            previousData: row.payment,
          });
        } else {
          await dataProvider.create(RESOURCE, {
            data: {
              contract_id: row.contractId,
              month: toMonthDate(row.month),
              ...data,
            },
          });
        }
      } catch {
        notify("crm.billing.status_error", { type: "error" });
      } finally {
        await queryClient.invalidateQueries({ queryKey: [RESOURCE] });
      }
    },
    [dataProvider, notify, queryClient],
  );
};
