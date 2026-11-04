import { useEffect } from "react";
import {
  FieldTitle,
  required,
  useInput,
  useRecordContext,
  useTranslate,
} from "ra-core";
import { useFormContext, useWatch } from "react-hook-form";
import { AutocompleteInput } from "@/components/admin/autocomplete-input";
import { FormError, FormField, FormLabel } from "@/components/admin/form";
import { ReferenceInput } from "@/components/admin/reference-input";
import { Checkbox } from "@/components/ui/checkbox";
import { TextInput } from "@/components/admin/text-input";
import { SelectInput } from "@/components/admin/select-input";
import { NumberInput } from "@/components/admin/number-input";
import { ArrayInput } from "@/components/admin/array-input";
import { SimpleFormIterator } from "@/components/admin/simple-form-iterator";
import { Separator } from "@/components/ui/separator";
import { useIsMobile } from "@/hooks/use-mobile";

import ImageEditorField from "../misc/ImageEditorField";
import { isLinkedinUrl } from "../misc/isLinkedInUrl";
import {
  competitorChoices,
  translateChoices,
} from "../misc/prospectingChoices";
import { useConfigurationContext } from "../root/ConfigurationContext";
import { validateCompanyCategories } from "./companyCategories";
import type { Company, Sale } from "../types";

const isUrl = (url: string) => {
  if (!url) return;
  const UrlRegex = new RegExp(
    /^(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)?[a-z0-9]+([-.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?$/i,
  );
  if (!UrlRegex.test(url)) {
    return {
      message: "crm.validation.invalid_url",
      args: { _: "Must be a valid URL" },
    };
  }
};

export const CompanyInputs = () => {
  const isMobile = useIsMobile();

  return (
    <div className="flex flex-col gap-4 p-1">
      <CompanyCategoryInputs />
      <CompanyDisplayInputs />
      <div className={`flex gap-6 ${isMobile ? "flex-col" : "flex-row"}`}>
        <div className="flex flex-col gap-10 flex-1">
          <CompanyContactInputs />
          <CompanyContextInputs />
        </div>
        <Separator orientation={isMobile ? "horizontal" : "vertical"} />
        <div className="flex flex-col gap-8 flex-1">
          <CompanyProspectingInputs />
          <CompanySitesInputs />
          <CompanyAdditionalInformationInputs />
        </div>
      </div>
    </div>
  );
};

const CompanyCategoryInputs = () => {
  const translate = useTranslate();
  const record = useRecordContext<Company>();
  const { trigger, formState } = useFormContext();
  const [isClient, isReferral] = useWatch({
    name: ["is_client", "is_referral"],
  });

  // The rule spans both checkboxes, so checking one clears the error shown
  // under the other once the form has been submitted
  const { isSubmitted } = formState;
  useEffect(() => {
    if (isSubmitted) trigger("is_client");
  }, [isClient, isReferral, isSubmitted, trigger]);

  return (
    <div className="flex flex-col gap-4">
      <h6 className="text-lg font-semibold">
        {translate("resources.companies.field_categories.categories", {
          _: "Categories",
        })}
      </h6>
      <div className="flex flex-col gap-3 sm:flex-row sm:gap-8">
        <CategoryCheckbox
          source="is_client"
          defaultValue={true}
          validate={validateCompanyCategories}
        />
        <CategoryCheckbox source="is_referral" defaultValue={false} />
      </div>
      {isClient ? (
        <ReferenceInput
          source="referred_by_company_id"
          reference="companies"
          filter={{
            is_referral: true,
            ...(record?.id != null ? { "id@neq": record.id } : {}),
          }}
          sort={{ field: "name", order: "ASC" }}
        >
          <AutocompleteInput
            label="resources.companies.fields.referred_by_company_id"
            optionText="name"
            helperText={false}
            clearable
          />
        </ReferenceInput>
      ) : null}
    </div>
  );
};

const CategoryCheckbox = ({
  source,
  defaultValue,
  validate,
}: {
  source: "is_client" | "is_referral";
  defaultValue: boolean;
  validate?: typeof validateCompanyCategories;
}) => {
  const { id, field } = useInput({
    source,
    defaultValue,
    type: "checkbox",
    validate,
  });
  return (
    <FormField id={id} name={field.name}>
      <div className="flex items-center gap-2">
        <Checkbox
          id={id}
          checked={Boolean(field.value)}
          onCheckedChange={(checked) => {
            field.onChange(checked === true);
            field.onBlur();
          }}
        />
        <FormLabel htmlFor={id}>
          <FieldTitle source={source} resource="companies" />
        </FormLabel>
      </div>
      <FormError />
    </FormField>
  );
};

const CompanyDisplayInputs = () => {
  const translate = useTranslate();
  const record = useRecordContext<Company>();
  return (
    <div className="flex gap-4 flex-1 flex-row">
      <ImageEditorField
        source="logo"
        type="avatar"
        width={60}
        height={60}
        emptyText={record?.name.charAt(0)}
        linkPosition="bottom"
      />
      <TextInput
        source="name"
        className="w-full h-fit"
        validate={required()}
        helperText={false}
        placeholder={translate("resources.companies.fields.name", {
          _: "Company name",
        })}
      />
    </div>
  );
};

const CompanyContactInputs = () => {
  const translate = useTranslate();
  return (
    <div className="flex flex-col gap-4">
      <h6 className="text-lg font-semibold">
        {translate("resources.companies.field_categories.contact", {
          _: "Company info",
        })}
      </h6>
      <TextInput source="website" helperText={false} validate={isUrl} />
      <TextInput
        source="linkedin_url"
        helperText={false}
        validate={isLinkedinUrl}
      />
      <TextInput source="phone_number" helperText={false} />
    </div>
  );
};

// Size, revenue and tax identifier are kept in the database but not edited
const CompanyContextInputs = () => {
  const translate = useTranslate();
  const { companySectors } = useConfigurationContext();
  return (
    <div className="flex flex-col gap-4">
      <h6 className="text-lg font-semibold">
        {translate("resources.companies.field_categories.context", {
          _: "Context",
        })}
      </h6>
      <SelectInput
        source="sector"
        choices={companySectors}
        optionText="label"
        optionValue="value"
        helperText={false}
      />
    </div>
  );
};

const CompanyProspectingInputs = () => {
  const translate = useTranslate();
  return (
    <div className="flex flex-col gap-4">
      <h6 className="text-lg font-semibold">
        {translate("resources.companies.field_categories.prospecting", {
          _: "Humand prospecting",
        })}
      </h6>
      {/* Continent and headcount source are kept but not edited anymore */}
      <TextInput source="network" helperText={false} />
      <NumberInput source="headcount" min={0} step={1} helperText={false} />
      <SelectInput
        source="current_competitor"
        choices={translateChoices(competitorChoices, translate)}
        translateChoice={false}
        helperText={false}
      />
    </div>
  );
};

/**
 * The company sites ("Sedes"). They replace the single address, whose columns
 * are kept in the database but not edited anymore.
 */
const CompanySitesInputs = () => {
  const translate = useTranslate();
  return (
    <div className="flex flex-col gap-4">
      <h6 className="text-lg font-semibold">
        {translate("resources.companies.field_categories.sites", {
          _: "Sites",
        })}
      </h6>
      <ArrayInput source="sites" label={false} helperText={false}>
        <SimpleFormIterator disableReordering disableClear fullWidth>
          <TextInput
            source="name"
            label="resources.companies.site_fields.name"
            placeholder={translate(
              "resources.companies.site_fields.name_placeholder",
            )}
            helperText={false}
          />
          <TextInput
            source="country"
            label="resources.companies.site_fields.country"
            helperText={false}
          />
          <TextInput
            source="address"
            label="resources.companies.site_fields.address"
            helperText={false}
          />
          <TextInput
            source="city"
            label="resources.companies.site_fields.city"
            helperText={false}
          />
          <TextInput
            source="state"
            label="resources.companies.site_fields.state"
            helperText={false}
          />
        </SimpleFormIterator>
      </ArrayInput>
    </div>
  );
};

const CompanyAdditionalInformationInputs = () => {
  const translate = useTranslate();
  return (
    <div className="flex flex-col gap-4">
      <h6 className="text-lg font-semibold">
        {translate("resources.companies.field_categories.additional_info", {
          _: "Additional information",
        })}
      </h6>
      <TextInput source="description" multiline helperText={false} />
      <ArrayInput source="context_links" helperText={false}>
        <SimpleFormIterator disableReordering fullWidth getItemLabel={false}>
          <TextInput
            source=""
            label={false}
            helperText={false}
            validate={isUrl}
          />
        </SimpleFormIterator>
      </ArrayInput>
      <ReferenceInput
        source="sales_id"
        reference="sales"
        filter={{
          "disabled@neq": true,
        }}
      >
        <SelectInput helperText={false} optionText={saleOptionRenderer} />
      </ReferenceInput>
    </div>
  );
};

const saleOptionRenderer = (choice: Sale) =>
  `${choice.first_name} ${choice.last_name}`;
