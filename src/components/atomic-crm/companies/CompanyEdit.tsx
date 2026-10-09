import { EditBase, Form, useEditContext } from "ra-core";
import { Card, CardContent } from "@/components/ui/card";

import type { Company } from "../types";
import { CompanyInputs } from "./CompanyInputs";
import { cleanupCompanyCategories } from "./companyCategories";
import { CompanyAside } from "./CompanyAside";
import { PlaceholderCompanyNotice } from "./PlaceholderCompanyNotice";
import { FormToolbar } from "../layout/FormToolbar";

export const CompanyEdit = () => (
  <EditBase
    actions={false}
    redirect="show"
    transform={(values) => {
      // add https:// before website if not present
      if (values.website && !values.website.startsWith("http")) {
        values.website = `https://${values.website}`;
      }
      return cleanupCompanyCategories(values);
    }}
  >
    <CompanyEditContent />
  </EditBase>
);

const CompanyEditContent = () => {
  const { record } = useEditContext<Company>();

  // The "Por definir" system company cannot be edited
  if (record?.is_placeholder) {
    return (
      <div className="mt-2 flex gap-8">
        <div className="flex-1">
          <PlaceholderCompanyNotice />
        </div>
        <CompanyAside link="show" />
      </div>
    );
  }

  return (
    <div className="mt-2 flex gap-8">
      <Form className="flex flex-1 flex-col gap-4 pb-2">
        <Card>
          <CardContent>
            <CompanyInputs />
            <FormToolbar />
          </CardContent>
        </Card>
      </Form>

      <CompanyAside link="show" />
    </div>
  );
};
