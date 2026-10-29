import { useGetOne, useTranslate } from "ra-core";
import { useEffect, type ReactNode } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { ArrayInput } from "@/components/admin/array-input";
import { AutocompleteInput } from "@/components/admin/autocomplete-input";
import { NumberInput } from "@/components/admin/number-input";
import { ReferenceInput } from "@/components/admin/reference-input";
import { SelectInput } from "@/components/admin/select-input";
import { SimpleFormIterator } from "@/components/admin/simple-form-iterator";
import { TextInput } from "@/components/admin/text-input";
import { Separator } from "@/components/ui/separator";

import type { Company } from "../types";
import { toMonthDate, toYearMonth } from "./billing";
import { validateContractField } from "./validateContract";

const validateEndMonth = validateContractField("end_month");
const validateCompany = validateContractField("company_id");
const validateFees = validateContractField("fee_history");
const validateCommissions = validateContractField("commission_rules");
const validateSubcommissions = validateContractField("subcommission_rules");

// Date columns hold the first day of a month; the input shows the month only
const formatMonthDate = (value?: string | null) => toYearMonth(value) ?? "";
const parseMonthDate = (value: string) =>
  toYearMonth(value) ? toMonthDate(value) : null;
const parseYearMonth = (value: string) => toYearMonth(value) ?? null;

export const ContractInputs = () => {
  const translate = useTranslate();
  return (
    <div className="flex flex-col gap-6">
      <ContractPartiesInputs />

      <div className="flex flex-col gap-4 sm:flex-row">
        <TextInput
          source="first_payment_month"
          type="month"
          format={formatMonthDate}
          parse={parseMonthDate}
          helperText="resources.contracts.help.first_payment_month"
          className="flex-1"
        />
        <TextInput
          source="end_month"
          type="month"
          validate={validateEndMonth}
          format={formatMonthDate}
          parse={parseMonthDate}
          helperText="resources.contracts.help.end_month"
          className="flex-1"
        />
      </div>

      <Separator />
      <Section
        title={translate("resources.contracts.fields.fee_history")}
        help={translate("resources.contracts.help.fee_history")}
      >
        <ArrayInput
          source="fee_history"
          label={false}
          helperText={false}
          validate={validateFees}
        >
          <SimpleFormIterator inline disableReordering disableClear>
            <TextInput
              source="from_month"
              label="resources.contracts.rule_fields.fee_from_month"
              type="month"
              format={(value?: string | null) => toYearMonth(value) ?? ""}
              parse={parseYearMonth}
              helperText={false}
            />
            <NumberInput
              source="amount"
              label="resources.contracts.rule_fields.amount"
              min={0}
              step={0.01}
              helperText={false}
            />
          </SimpleFormIterator>
        </ArrayInput>
      </Section>

      <Separator />
      <Section
        title={translate("resources.contracts.fields.commission_rules")}
        help={translate("resources.contracts.help.commission_rules")}
      >
        <ArrayInput
          source="commission_rules"
          label={false}
          helperText={false}
          validate={validateCommissions}
        >
          <SimpleFormIterator inline disableReordering disableClear>
            <NumberInput
              source="from_month"
              label="resources.contracts.rule_fields.from_month"
              min={1}
              step={1}
              helperText={false}
            />
            <NumberInput
              source="to_month"
              label="resources.contracts.rule_fields.to_month"
              min={1}
              step={1}
              helperText={false}
            />
            <NumberInput
              source="percent"
              label="resources.contracts.rule_fields.percent"
              min={0}
              max={100}
              step={0.01}
              helperText={false}
            />
          </SimpleFormIterator>
        </ArrayInput>
      </Section>

      <Separator />
      <Section
        title={translate("resources.contracts.fields.subcommission_rules")}
        help={translate("resources.contracts.help.subcommission_rules")}
      >
        <ArrayInput
          source="subcommission_rules"
          label={false}
          helperText={false}
          validate={validateSubcommissions}
        >
          <SimpleFormIterator inline disableReordering disableClear>
            <SelectInput
              source="kind"
              label="resources.contracts.rule_fields.kind"
              choices={[
                {
                  id: "percent",
                  name: "resources.contracts.subcommission_kinds.percent",
                },
                {
                  id: "fixed",
                  name: "resources.contracts.subcommission_kinds.fixed",
                },
              ]}
              defaultValue="percent"
              helperText={false}
            />
            <NumberInput
              source="value"
              label="resources.contracts.rule_fields.value"
              min={0}
              step={0.01}
              helperText={false}
            />
            <NumberInput
              source="from_month"
              label="resources.contracts.rule_fields.from_month"
              min={1}
              step={1}
              helperText={false}
            />
            <NumberInput
              source="to_month"
              label="resources.contracts.rule_fields.to_month"
              min={1}
              step={1}
              helperText={false}
            />
          </SimpleFormIterator>
        </ArrayInput>
      </Section>

      <Separator />
      <TextInput source="notes" multiline rows={3} helperText={false} />
    </div>
  );
};

const Section = ({
  title,
  help,
  children,
}: {
  title: string;
  help: string;
  children: ReactNode;
}) => (
  <div className="flex flex-col gap-2">
    <h3 className="text-base font-medium">{title}</h3>
    <p className="text-sm text-muted-foreground">{help}</p>
    {children}
  </div>
);

/**
 * The client company, the won deal it comes from, and the referral company
 * owed a sub-commission. Choosing a client proposes the company that referred
 * it (its "Referida por").
 */
const ContractPartiesInputs = () => {
  const { setValue, getValues } = useFormContext();
  const companyId = useWatch({ name: "company_id" });
  const { data: company } = useGetOne<Company>(
    "companies",
    { id: companyId },
    { enabled: companyId != null && companyId !== "" },
  );

  useEffect(() => {
    if (company?.referred_by_company_id && !getValues("referral_company_id")) {
      setValue("referral_company_id", company.referred_by_company_id, {
        shouldDirty: true,
      });
    }
  }, [company, getValues, setValue]);

  return (
    <div className="flex flex-col gap-4">
      <ReferenceInput
        source="company_id"
        reference="companies"
        filter={{ is_client: true, "is_placeholder@neq": true }}
        sort={{ field: "name", order: "ASC" }}
      >
        <AutocompleteInput
          label="resources.contracts.fields.company_id"
          optionText="name"
          helperText={false}
          validate={validateCompany}
        />
      </ReferenceInput>
      <ReferenceInput
        source="deal_id"
        reference="deals"
        filter={companyId ? { company_id: companyId } : {}}
        sort={{ field: "name", order: "ASC" }}
      >
        <AutocompleteInput
          label="resources.contracts.fields.deal_id"
          optionText="name"
          helperText={false}
          clearable
        />
      </ReferenceInput>
      <ReferenceInput
        source="referral_company_id"
        reference="companies"
        filter={{ is_referral: true }}
        sort={{ field: "name", order: "ASC" }}
      >
        <AutocompleteInput
          label="resources.contracts.fields.referral_company_id"
          optionText="name"
          helperText={false}
          clearable
        />
      </ReferenceInput>
    </div>
  );
};
