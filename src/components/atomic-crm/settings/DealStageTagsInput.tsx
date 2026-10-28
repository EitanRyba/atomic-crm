import { useTranslate } from "ra-core";
import { useWatch } from "react-hook-form";
import { ArrayInput } from "@/components/admin/array-input";
import { SelectInput } from "@/components/admin/select-input";
import { SimpleFormIterator } from "@/components/admin/simple-form-iterator";
import { TextInput } from "@/components/admin/text-input";

import type { DealStage } from "../types";
import { ColorInput } from "./ColorInput";
import { validateStageTags, type StageTagItem } from "./validateStageTags";

/** Settings: the tags a deal can carry in each stage, with their color. */
export const DealStageTagsInput = () => {
  const translate = useTranslate();
  const dealStages: DealStage[] = useWatch({ name: "dealStages" }) ?? [];
  const stageChoices = dealStages
    .filter((stage) => stage.value)
    .map((stage) => ({ id: stage.value, name: stage.label || stage.value }));

  return (
    <>
      <h3 className="text-lg font-medium text-muted-foreground">
        {translate("crm.settings.deals.stage_tags")}
      </h3>
      <p className="text-sm text-muted-foreground">
        {translate("crm.settings.deals.stage_tags_help")}
      </p>
      <ArrayInput
        source="dealStageTags"
        label={false}
        helperText={false}
        validate={(tags: StageTagItem[] | undefined) => {
          const error = validateStageTags(tags);
          return error ? translate(error) : undefined;
        }}
      >
        <SimpleFormIterator inline disableClear>
          <SelectInput
            source="stage"
            label={false}
            choices={stageChoices}
            helperText={false}
            className="w-44"
          />
          <TextInput source="label" label={false} className="flex-1" />
          <ColorInput source="color" />
        </SimpleFormIterator>
      </ArrayInput>
    </>
  );
};
