import { EditBase, Form, useTranslate } from "ra-core";
import { DeleteButton } from "@/components/admin/delete-button";
import { Card, CardContent } from "@/components/ui/card";

import { FormToolbar } from "../layout/FormToolbar";
import { ContractInputs } from "./ContractInputs";

export const ContractEdit = () => {
  const translate = useTranslate();
  return (
    <EditBase redirect="list" mutationMode="pessimistic">
      <div className="mx-auto mt-4 max-w-3xl">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-2xl font-semibold">
            {translate("resources.contracts.action.edit")}
          </h1>
          <DeleteButton redirect="list" />
        </div>
        <Form>
          <Card>
            <CardContent>
              <ContractInputs />
              <FormToolbar />
            </CardContent>
          </Card>
        </Form>
      </div>
    </EditBase>
  );
};
