import { required, useTranslate } from "ra-core";
import { useWatch } from "react-hook-form";
import { AutocompleteArrayInput } from "@/components/admin/autocomplete-array-input";
import { ReferenceArrayInput } from "@/components/admin/reference-array-input";
import { ReferenceInput } from "@/components/admin/reference-input";
import { TextInput } from "@/components/admin/text-input";
import { NumberInput } from "@/components/admin/number-input";
import { DateInput } from "@/components/admin/date-input";
import { SelectInput } from "@/components/admin/select-input";
import { Separator } from "@/components/ui/separator";
import { useIsMobile } from "@/hooks/use-mobile";

import { contactOptionText } from "../misc/ContactOption";
import { useConfigurationContext } from "../root/ConfigurationContext";
import { AutocompleteCompanyInput } from "../companies/AutocompleteCompanyInput.tsx";
import {
  LOST_REASONS,
  LOST_STAGE,
  POSTPONED_STAGE,
  UNSPECIFIED_LOST_REASON,
  defaultPostponedUntil,
  lostReasonKey,
} from "./dealOutcome";

export const DealInputs = () => {
  const isMobile = useIsMobile();
  return (
    <div className="flex flex-col gap-8">
      <DealInfoInputs />

      <div className={`flex gap-6 ${isMobile ? "flex-col" : "flex-row"}`}>
        <DealLinkedToInputs />
        <Separator orientation={isMobile ? "horizontal" : "vertical"} />
        <DealMiscInputs />
      </div>
    </div>
  );
};

const DealInfoInputs = () => {
  return (
    <div className="flex flex-col gap-4 flex-1">
      <TextInput source="name" validate={required()} helperText={false} />
      <TextInput source="description" multiline rows={3} helperText={false} />
    </div>
  );
};

const DealLinkedToInputs = () => {
  const translate = useTranslate();
  return (
    <div className="flex flex-col gap-4 flex-1">
      <h3 className="text-base font-medium">
        {translate("resources.deals.inputs.linked_to")}
      </h3>
      {/* Deals are sold to client companies, never to "Por definir" */}
      <ReferenceInput
        source="company_id"
        reference="companies"
        filter={{ is_client: true, "is_placeholder@neq": true }}
      >
        <AutocompleteCompanyInput
          label="resources.deals.fields.company_id"
          validate={required()}
          modal
        />
      </ReferenceInput>

      <ReferenceArrayInput source="contact_ids" reference="contacts_summary">
        <AutocompleteArrayInput
          label="resources.deals.fields.contact_ids"
          optionText={contactOptionText}
          helperText={false}
        />
      </ReferenceArrayInput>
    </div>
  );
};

const DealMiscInputs = () => {
  const { dealStages, dealCategories } = useConfigurationContext();
  const translate = useTranslate();
  return (
    <div className="flex flex-col gap-4 flex-1">
      <h3 className="text-base font-medium">
        {translate("resources.deals.field_categories.misc")}
      </h3>

      <SelectInput
        source="category"
        choices={dealCategories}
        optionText="label"
        optionValue="value"
        helperText={false}
      />
      <NumberInput
        source="amount"
        defaultValue={0}
        helperText={false}
        validate={required()}
      />
      <DateInput
        validate={required()}
        source="expected_closing_date"
        helperText={false}
        defaultValue={new Date().toISOString().split("T")[0]}
      />
      <SelectInput
        source="stage"
        choices={dealStages}
        optionText="label"
        optionValue="value"
        defaultValue={dealStages[0]?.value}
        helperText={false}
        validate={required()}
      />
      <DealOutcomeInputs />
    </div>
  );
};

/** Reason of a lost deal, or date and reason of a postponed one. */
const DealOutcomeInputs = () => {
  const translate = useTranslate();
  const stage = useWatch({ name: "stage" });

  if (stage === LOST_STAGE) {
    const choices = [...LOST_REASONS, UNSPECIFIED_LOST_REASON].map(
      (reason) => ({ id: reason, name: translate(lostReasonKey(reason)) }),
    );
    return (
      <>
        <SelectInput
          source="lost_reason"
          choices={choices}
          helperText={false}
          validate={required()}
        />
        <TextInput
          source="lost_reason_detail"
          multiline
          rows={2}
          helperText={false}
        />
      </>
    );
  }

  if (stage === POSTPONED_STAGE) {
    return (
      <>
        <DateInput
          source="postponed_until"
          helperText={false}
          validate={required()}
          defaultValue={defaultPostponedUntil()}
        />
        <TextInput
          source="postponed_reason"
          multiline
          rows={2}
          helperText={false}
          validate={required()}
        />
      </>
    );
  }

  return null;
};
