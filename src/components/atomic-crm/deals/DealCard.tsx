import { Draggable } from "@hello-pangea/dnd";
import {
  useLocaleState,
  useRedirect,
  useTranslate,
  RecordContextProvider,
} from "ra-core";
import { ReferenceField } from "@/components/admin/reference-field";
import { NumberField } from "@/components/admin/number-field";
import { SelectField } from "@/components/admin/select-field";
import { Card, CardContent } from "@/components/ui/card";

import { CompanyAvatar } from "../companies/CompanyAvatar";
import { useConfigurationContext } from "../root/ConfigurationContext";
import type { Deal } from "../types";
import {
  LOST_STAGE,
  POSTPONED_STAGE,
  formatShortDate,
  isPostponedOverdue,
  lostReasonKey,
} from "./dealOutcome";
import { DealTagList } from "./tags/DealTagList";
import { useActiveDealTags } from "./tags/useDealTags";

export const DealCard = ({ deal, index }: { deal: Deal; index: number }) => {
  if (!deal) return null;

  return (
    <Draggable draggableId={String(deal.id)} index={index}>
      {(provided, snapshot) => (
        <DealCardContent provided={provided} snapshot={snapshot} deal={deal} />
      )}
    </Draggable>
  );
};

export const DealCardContent = ({
  provided,
  snapshot,
  deal,
}: {
  provided?: any;
  snapshot?: any;
  deal: Deal;
}) => {
  const { dealCategories, currency } = useConfigurationContext();
  const getDealTags = useActiveDealTags();
  const redirect = useRedirect();
  const handleClick = () => {
    redirect(`/deals/${deal.id}/show`, undefined, undefined, undefined, {
      _scrollToTop: false,
    });
  };

  return (
    <div
      className="cursor-pointer"
      {...provided?.draggableProps}
      {...provided?.dragHandleProps}
      ref={provided?.innerRef}
      onClick={handleClick}
    >
      <RecordContextProvider value={deal}>
        <Card
          className={`py-3 transition-all duration-200 ${
            snapshot?.isDragging
              ? "opacity-90 transform rotate-1 shadow-lg"
              : "shadow-sm hover:shadow-md"
          }`}
        >
          <CardContent className="px-3 flex flex-col">
            <div className="flex-1 flex">
              <p className="flex-1 text-sm font-medium mb-2">
                <ReferenceField
                  source="company_id"
                  reference="companies"
                  link={false}
                />
                {" - "}
                {deal.name}
              </p>
              <ReferenceField
                source="company_id"
                reference="companies"
                link={false}
              >
                <CompanyAvatar width={20} height={20} />
              </ReferenceField>
            </div>
            <p className="text-xs text-muted-foreground">
              <NumberField
                source="amount"
                options={{
                  notation: "compact",
                  style: "currency",
                  currency,
                  currencyDisplay: "narrowSymbol",
                  minimumSignificantDigits: 3,
                }}
              />
              {deal.category && ", "}
              <SelectField
                source="category"
                choices={dealCategories}
                optionText="label"
                optionValue="value"
              />
            </p>
            <DealOutcomeLine deal={deal} />
            <div className="mt-2 empty:hidden">
              <DealTagList deal={deal} assignments={getDealTags(deal.id)} />
            </div>
          </CardContent>
        </Card>
      </RecordContextProvider>
    </div>
  );
};

/** "Retomar el ..." for a postponed deal, the reason for a lost one. */
const DealOutcomeLine = ({ deal }: { deal: Deal }) => {
  const translate = useTranslate();
  const [locale = "es"] = useLocaleState();

  if (deal.stage === POSTPONED_STAGE && deal.postponed_until) {
    return (
      <p
        className={`mt-1 text-xs ${
          isPostponedOverdue(deal)
            ? "font-medium text-destructive"
            : "text-muted-foreground"
        }`}
      >
        {translate("resources.deals.outcome.resume_on", {
          date: formatShortDate(deal.postponed_until, locale),
        })}
      </p>
    );
  }
  if (deal.stage === LOST_STAGE && deal.lost_reason) {
    return (
      <p className="mt-1 text-xs text-muted-foreground">
        {translate(lostReasonKey(deal.lost_reason), {
          _: deal.lost_reason,
        })}
      </p>
    );
  }
  return null;
};
