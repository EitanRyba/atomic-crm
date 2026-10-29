import { ResponsiveBar } from "@nivo/bar";
import { useLocaleState, useTranslate } from "ra-core";

import type { MonthTotals } from "./billing";
import { formatMonth, formatUsd } from "./formatBilling";

const axisStyle = {
  ticks: { text: { fill: "var(--color-muted-foreground)" } },
  legend: { text: { fill: "var(--color-muted-foreground)" } },
};

const NET_COLOR = "#2f9e8f";
const SUBCOMMISSION_COLOR = "#e8a54b";

/**
 * Commission per month, split into what stays with you (net) and what goes
 * to the referral companies (sub-commission).
 */
export const BillingChart = ({ totals }: { totals: MonthTotals[] }) => {
  const translate = useTranslate();
  const [locale = "es"] = useLocaleState();
  const netLabel = translate("crm.billing.net");
  const subcommissionLabel = translate("crm.billing.subcommission");
  const data = totals.map((total) => ({
    month: formatMonth(total.month, locale),
    [netLabel]: total.net,
    [subcommissionLabel]: total.subcommission,
  }));

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
        <Legend color={NET_COLOR} label={netLabel} />
        <Legend color={SUBCOMMISSION_COLOR} label={subcommissionLabel} />
      </div>
      <div
        className="h-[320px]"
        role="img"
        aria-label={translate("crm.billing.chart")}
      >
        <ResponsiveBar
          data={data}
          indexBy="month"
          keys={[netLabel, subcommissionLabel]}
          colors={[NET_COLOR, SUBCOMMISSION_COLOR]}
          margin={{ top: 10, right: 60, bottom: 40, left: 10 }}
          padding={0.3}
          enableLabel={false}
          enableGridY
          axisLeft={null}
          axisBottom={{ tickSize: 0, tickPadding: 10, style: axisStyle }}
          axisRight={{
            tickSize: 0,
            tickPadding: 6,
            tickValues: 5,
            format: (value: number) =>
              new Intl.NumberFormat(locale, {
                notation: "compact",
                style: "currency",
                currency: "USD",
              }).format(value),
            style: axisStyle,
          }}
          tooltip={({ id, value, indexValue }) => (
            <div className="rounded bg-secondary p-2 text-sm text-secondary-foreground shadow">
              <strong>{indexValue}</strong> · {id}: {formatUsd(value, locale)}
            </div>
          )}
        />
      </div>
    </div>
  );
};

const Legend = ({ color, label }: { color: string; label: string }) => (
  <span className="inline-flex items-center gap-1.5">
    <span
      className="size-3 rounded-sm"
      style={{ backgroundColor: color }}
      aria-hidden
    />
    {label}
  </span>
);
