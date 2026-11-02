import { useQueryClient } from "@tanstack/react-query";
import { Building2, Plus } from "lucide-react";
import {
  CreateBase,
  Form,
  useDataProvider,
  useGetIdentity,
  useNotify,
  useRedirect,
  useTranslate,
} from "ra-core";
import { Card, CardContent } from "@/components/ui/card";
import { CancelButton } from "@/components/admin/cancel-button";
import { SaveButton } from "@/components/admin/form";
import { Separator } from "@/components/ui/separator";

import { CompanyInputs } from "./CompanyInputs";
import { CompanyContactsInput } from "./CompanyContactsInput";
import {
  createCompanyWithContacts,
  type CompanyCreateValues,
} from "./companyContacts";

export const CompanyCreate = () => {
  const { identity } = useGetIdentity();
  const translate = useTranslate();
  const dataProvider = useDataProvider();
  const notify = useNotify();
  const redirect = useRedirect();
  const queryClient = useQueryClient();

  // The company and its contacts are saved together: the company first, then
  // the contacts that point to it.
  const handleSubmit = async (values: CompanyCreateValues) => {
    try {
      const { company, failedContacts } = await createCompanyWithContacts(
        dataProvider,
        values,
        identity?.id,
      );
      await queryClient.invalidateQueries();
      if (failedContacts) {
        notify("resources.companies.contacts_input.create_error", {
          type: "warning",
        });
      } else {
        notify("ra.notification.created", { messageArgs: { smart_count: 1 } });
      }
      redirect("show", "companies", company.id);
    } catch (error) {
      notify(
        error instanceof Error && error.message
          ? error.message
          : "ra.notification.http_error",
        { type: "error" },
      );
    }
  };

  return (
    <CreateBase>
      <div className="mt-2 flex lg:mr-72">
        <div className="flex-1">
          <Form
            onSubmit={handleSubmit}
            defaultValues={{
              sales_id: identity?.id,
              // Most new companies are the clients Humand sells to
              is_client: true,
              is_referral: false,
              sites: [],
              company_contacts: [{ mode: "existing" }],
            }}
          >
            <Card>
              <CardContent>
                <CompanyInputs />
                <Separator className="my-6" />
                <CompanyContactsInput />
                <div
                  role="toolbar"
                  className="sticky flex pt-4 pb-4 md:pb-0 bottom-0 bg-linear-to-b from-transparent to-card to-10% flex-row justify-end gap-2"
                >
                  <CancelButton />
                  <SaveButton
                    icon={<CreateCompanyIcon />}
                    label={translate("resources.companies.action.create", {
                      _: "Create Company",
                    })}
                  />
                </div>
              </CardContent>
            </Card>
          </Form>
        </div>
      </div>
    </CreateBase>
  );
};

/** A building with a plus: "create a company" (the default icon is a floppy disk) */
const CreateCompanyIcon = () => (
  <span className="relative inline-flex" aria-hidden>
    <Building2 className="h-4 w-4" />
    <Plus
      className="absolute -right-1.5 -top-1.5 h-3 w-3 rounded-full bg-primary"
      strokeWidth={3}
    />
  </span>
);
