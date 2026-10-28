import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CalendarClock } from "lucide-react";
import {
  useDataProvider,
  useGetList,
  useLocaleState,
  useNotify,
  useTranslate,
} from "ra-core";
import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

import {
  DISCOVERY_STAGE,
  POSTPONED_STAGE,
  formatShortDate,
  isPostponedOverdue,
  postponedReminderLimit,
} from "../deals/dealOutcome";
import { findDealLabel } from "../deals/dealUtils";
import { useConfigurationContext } from "../root/ConfigurationContext";
import type { Deal } from "../types";

const MAX_ITEMS = 10;

/**
 * Postponed deals whose date to resume has come, or comes within a week.
 * Each one can go back to Discovery in one click. Hidden when there is none.
 */
export const PostponedDeals = () => {
  const translate = useTranslate();
  const [locale = "es"] = useLocaleState();
  const { dealStages } = useConfigurationContext();
  const { data: deals = [], total = 0 } = useGetList<Deal>("deals", {
    filter: {
      stage: POSTPONED_STAGE,
      "postponed_until@lte": postponedReminderLimit(),
      "archived_at@is": null,
    },
    pagination: { page: 1, perPage: MAX_ITEMS },
    sort: { field: "postponed_until", order: "ASC" },
  });

  if (!total) return null;

  const discoveryLabel =
    findDealLabel(dealStages, DISCOVERY_STAGE) ?? DISCOVERY_STAGE;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center">
        <div className="mr-3 flex">
          <CalendarClock className="text-muted-foreground w-6 h-6" />
        </div>
        <h2 className="text-xl font-semibold text-muted-foreground">
          {translate("crm.dashboard.postponed.title")}
        </h2>
      </div>
      <Card className="gap-3 p-4">
        {deals.map((deal) => (
          <div key={deal.id} className="flex flex-col gap-1">
            <Link
              to={`/deals/${deal.id}/show`}
              className="text-sm font-medium hover:underline"
            >
              {deal.name}
            </Link>
            <span
              className={`text-xs ${
                isPostponedOverdue(deal)
                  ? "font-medium text-destructive"
                  : "text-muted-foreground"
              }`}
            >
              {translate("resources.deals.outcome.resume_on", {
                date: deal.postponed_until
                  ? formatShortDate(deal.postponed_until, locale)
                  : "—",
              })}
            </span>
            <BackToDiscoveryButton deal={deal} label={discoveryLabel} />
          </div>
        ))}
      </Card>
    </div>
  );
};

const BackToDiscoveryButton = ({
  deal,
  label,
}: {
  deal: Deal;
  label: string;
}) => {
  const translate = useTranslate();
  const dataProvider = useDataProvider();
  const queryClient = useQueryClient();
  const notify = useNotify();

  const { mutate, isPending } = useMutation({
    mutationFn: async () => {
      // Append the deal at the bottom of the Discovery column
      const { total = 0 } = await dataProvider.getList("deals", {
        filter: { stage: DISCOVERY_STAGE },
        pagination: { page: 1, perPage: 1 },
        sort: { field: "index", order: "ASC" },
      });
      return dataProvider.update("deals", {
        id: deal.id,
        data: { stage: DISCOVERY_STAGE, index: total },
        previousData: deal,
      });
    },
    onSuccess: () => {
      notify("crm.dashboard.postponed.moved", {
        type: "info",
        messageArgs: { name: deal.name, stage: label },
      });
      queryClient.invalidateQueries({ queryKey: ["deals"] });
    },
    onError: () => {
      notify("resources.deals.outcome.move_error", { type: "error" });
    },
  });

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className="h-7 self-start text-xs"
      disabled={isPending}
      onClick={() => mutate()}
    >
      {translate("crm.dashboard.postponed.back_to", { stage: label })}
    </Button>
  );
};
