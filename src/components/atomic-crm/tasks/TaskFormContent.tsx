import { AutocompleteInput } from "@/components/admin/autocomplete-input";
import { ReferenceInput } from "@/components/admin/reference-input";
import { SelectInput } from "@/components/admin/select-input";
import { TextInput } from "@/components/admin/text-input";
import { required } from "ra-core";
import { DateTimeInput } from "@/components/admin";

import { useConfigurationContext } from "../root/ConfigurationContext";
import { TaskAttendeesInput } from "./TaskAttendeesInput";

export const TaskFormContent = ({
  selectDeal,
  dealFilter,
}: {
  // the deal is picked in the form instead of coming from the context
  selectDeal?: boolean;
  // limits the deals offered, e.g. to those of a company
  dealFilter?: Record<string, unknown>;
}) => {
  const { taskTypes } = useConfigurationContext();
  return (
    <div className="flex flex-col gap-4">
      <TextInput
        autoFocus
        source="text"
        validate={required()}
        multiline
        className="m-0"
        helperText={false}
      />
      {selectDeal && (
        <ReferenceInput
          source="deal_id"
          reference="deals"
          // tasks go to active deals only
          filter={{ "archived_at@is": null, ...dealFilter }}
          sort={{ field: "name", order: "ASC" }}
        >
          <AutocompleteInput
            label="resources.tasks.fields.deal_id"
            optionText="name"
            helperText={false}
            validate={required()}
            modal
          />
        </ReferenceInput>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <DateTimeInput
          source="due_date"
          helperText={false}
          validate={required()}
        />
        <SelectInput
          source="type"
          validate={required()}
          choices={taskTypes}
          optionText="label"
          optionValue="value"
          defaultValue="none"
          helperText={false}
        />
      </div>

      <TaskAttendeesInput />
    </div>
  );
};
