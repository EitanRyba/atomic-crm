import type { Meta } from "@storybook/react-vite";

import { StoryWrapper, buildCompany } from "@/test/StoryWrapper";
import { addMonths, currentYearMonth, toMonthDate } from "./billing";
import { BillingPage } from "./BillingPage";

const meta = {
  title: "Atomic CRM/Contracts/Billing",
  parameters: { layout: "fullscreen" },
} satisfies Meta;

export default meta;

// A client paying since two months ago, referred by a referral company that
// earns 20% of the commission
const firstPayment = addMonths(currentYearMonth(), -2);

export const BillingWithOneContract = () => (
  <StoryWrapper
    data={{
      companies: [
        buildCompany({ id: 1, name: "Acme", is_client: true }),
        buildCompany({
          id: 2,
          name: "Partner Firm",
          is_client: false,
          is_referral: true,
        }),
      ],
      contracts: [
        {
          id: 1,
          company_id: 1,
          referral_company_id: 2,
          first_payment_month: toMonthDate(firstPayment),
          end_month: null,
          fee_history: [{ from_month: firstPayment, amount: 1000 }],
          commission_rules: [
            { from_month: 1, to_month: 12, percent: 50 },
            { from_month: 13, to_month: null, percent: 30 },
          ],
          subcommission_rules: [
            { kind: "percent", value: 20, from_month: 1, to_month: null },
          ],
          created_at: "2026-01-01T00:00:00.000Z",
          updated_at: "2026-01-01T00:00:00.000Z",
        },
      ],
      subcommission_payments: [],
    }}
  >
    <BillingPage />
  </StoryWrapper>
);
