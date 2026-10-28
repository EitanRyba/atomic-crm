import { Droppable } from "@hello-pangea/dnd";
import { Info } from "lucide-react";
import { useTranslate } from "ra-core";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { useConfigurationContext } from "../root/ConfigurationContext";
import type { Deal } from "../types";
import { findDealLabel } from "./dealUtils";
import { DealCard } from "./DealCard";

export const DealColumn = ({
  stage,
  deals,
}: {
  stage: string;
  deals: Deal[];
}) => {
  const totalAmount = deals.reduce((sum, deal) => sum + deal.amount, 0);
  const { dealStages, currency } = useConfigurationContext();
  const translate = useTranslate();
  const dealStage = dealStages.find((s) => s.value === stage);
  return (
    <div className="flex-1 min-w-48 pb-8">
      <div className="flex flex-col items-center">
        <div className="flex items-center gap-1">
          <h3 className="text-base font-medium text-center">
            {findDealLabel(dealStages, stage)}
          </h3>
          {dealStage?.description || dealStage?.humandStage ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  className="text-muted-foreground hover:text-foreground"
                  aria-label={translate("resources.deals.board.stage_info")}
                >
                  <Info className="size-3.5" />
                </button>
              </TooltipTrigger>
              <TooltipContent className="max-w-72">
                {dealStage.humandStage ? (
                  <p className="font-medium">
                    {translate("resources.deals.board.humand_stage", {
                      stage: dealStage.humandStage,
                    })}
                  </p>
                ) : null}
                {dealStage.description ? <p>{dealStage.description}</p> : null}
              </TooltipContent>
            </Tooltip>
          ) : null}
        </div>
        <p className="text-sm text-muted-foreground">
          {totalAmount.toLocaleString("en-US", {
            notation: "compact",
            style: "currency",
            currency,
            currencyDisplay: "narrowSymbol",
            minimumSignificantDigits: 3,
          })}
        </p>
      </div>
      <Droppable droppableId={stage}>
        {(droppableProvided, snapshot) => (
          <div
            ref={droppableProvided.innerRef}
            {...droppableProvided.droppableProps}
            className={`flex flex-col rounded-2xl mt-2 gap-2 ${
              snapshot.isDraggingOver ? "bg-muted" : ""
            }`}
          >
            {deals.map((deal, index) => (
              <DealCard key={deal.id} deal={deal} index={index} />
            ))}
            {droppableProvided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
};
