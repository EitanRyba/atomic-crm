import type { Meta } from "@storybook/react-vite";
import { useGetOne } from "ra-core";

import type { Deal, DealStage, DealStageTag } from "../../types";
import { DealTagsSection } from "./DealTagsSection";

import { StoryWrapper, buildCompany, buildDeal } from "@/test/StoryWrapper";

const meta = {
  title: "Atomic CRM/Deals/Deal Tags",
} satisfies Meta;

export default meta;

const dealStages: DealStage[] = [
  { value: "discovery", label: "Discovery" },
  { value: "champion", label: "Champion" },
];

const dealStageTags: DealStageTag[] = [
  {
    stage: "discovery",
    value: "pain-identified",
    label: "Pain identified",
    color: "#c6e8c2",
  },
  {
    stage: "champion",
    value: "proposal-sent",
    label: "Proposal sent",
    color: "#d9cdf2",
  },
  {
    stage: "champion",
    value: "second-meeting-scheduled",
    label: "Second meeting scheduled",
    color: "#c6dcf2",
  },
];

const DealTagsOfDeal = ({ id }: { id: number }) => {
  const { data } = useGetOne<Deal>("deals", { id });
  return data ? <DealTagsSection deal={data} /> : null;
};

export const DealPageTags = () => (
  <StoryWrapper
    configuration={{ dealStages, dealStageTags }}
    data={{
      companies: [buildCompany()],
      deals: [buildDeal({ id: 1, name: "Intranet", stage: "champion" })],
      deal_tag_assignments: [
        {
          id: 1,
          deal_id: 1,
          stage: "discovery",
          tag_value: "pain-identified",
          description: "Payslips are sent by email",
          sales_id: 0,
          created_at: "2026-09-01T10:00:00.000Z",
          removed_at: "2026-09-15T10:00:00.000Z",
          removed_reason: "stage_change",
        },
      ],
    }}
  >
    <DealTagsOfDeal id={1} />
  </StoryWrapper>
);
