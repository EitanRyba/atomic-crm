import { email, required, useSourceContext, useTranslate } from "ra-core";
import { useWatch } from "react-hook-form";
import { ArrayInput } from "@/components/admin/array-input";
import { AutocompleteInput } from "@/components/admin/autocomplete-input";
import { RadioButtonGroupInput } from "@/components/admin/radio-button-group-input";
import { ReferenceInput } from "@/components/admin/reference-input";
import { SimpleFormIterator } from "@/components/admin/simple-form-iterator";
import { TextInput } from "@/components/admin/text-input";

import { contactOptionText } from "../misc/ContactOption";
import { validateCompanyContacts } from "./companyContacts";

const MODE_CHOICES = [
  { id: "existing", name: "resources.companies.contacts_input.existing" },
  { id: "new", name: "resources.companies.contacts_input.new" },
];

const validateRows = (value: unknown) =>
  validateCompanyContacts(
    value as Parameters<typeof validateCompanyContacts>[0],
  );

/**
 * The contacts of a company being created: at least one, each picked among
 * the existing contacts or created on the spot.
 */
export const CompanyContactsInput = () => {
  const translate = useTranslate();
  return (
    <div className="flex flex-col gap-4">
      <h6 className="text-lg font-semibold">
        {translate("resources.companies.field_categories.contacts")}
      </h6>
      <ArrayInput
        source="company_contacts"
        label={false}
        helperText="resources.companies.contacts_input.help"
        validate={validateRows}
      >
        <SimpleFormIterator disableReordering disableClear fullWidth>
          <CompanyContactRowInputs />
        </SimpleFormIterator>
      </ArrayInput>
    </div>
  );
};

const CompanyContactRowInputs = () => {
  const sourceContext = useSourceContext();
  const mode = useWatch({ name: sourceContext.getSource("mode") });
  return (
    <div className="flex flex-col gap-3 w-full">
      <RadioButtonGroupInput
        source="mode"
        label={false}
        choices={MODE_CHOICES}
        defaultValue="existing"
        row
        helperText={false}
      />
      {mode === "new" ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <TextInput
            source="first_name"
            label="resources.contacts.fields.first_name"
            validate={required()}
            helperText={false}
          />
          <TextInput
            source="last_name"
            label="resources.contacts.fields.last_name"
            validate={required()}
            helperText={false}
          />
          <TextInput
            source="email"
            label="resources.contacts.fields.email"
            type="email"
            validate={[required(), email()]}
            helperText={false}
          />
        </div>
      ) : (
        <ReferenceInput source="contact_id" reference="contacts_summary">
          <AutocompleteInput
            label="resources.companies.contacts_input.existing"
            optionText={contactOptionText}
            validate={required()}
            helperText={false}
          />
        </ReferenceInput>
      )}
    </div>
  );
};
