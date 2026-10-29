import { CreateBase, Form, useTranslate } from "ra-core";
import { Card, CardContent } from "@/components/ui/card";

import { FormToolbar } from "../layout/FormToolbar";
import { DEFAULT_COMMISSION_RULES } from "./billing";
import { ContractInputs } from "./ContractInputs";

export const ContractCreate = () => {
  const translate = useTranslate();
  return (
    <CreateBase redirect="list">
      <div className="mx-auto mt-4 max-w-3xl">
        <h1 className="mb-4 text-2xl font-semibold">
          {translate("resources.contracts.action.new")}
        </h1>
        <Form
          defaultValues={{
            fee_history: [{ from_month: null, amount: null }],
            commission_rules: DEFAULT_COMMISSION_RULES,
            subcommission_rules: [],
          }}
        >
          <Card>
            <CardContent>
              <ContractInputs />
              <FormToolbar />
            </CardContent>
          </Card>
        </Form>
      </div>
    </CreateBase>
  );
};
