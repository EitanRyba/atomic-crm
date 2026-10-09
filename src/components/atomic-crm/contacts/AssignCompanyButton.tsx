import { useState } from "react";
import { Building2 } from "lucide-react";
import {
  Form,
  required,
  useListContext,
  useNotify,
  useRecordContext,
  useRefresh,
  useTranslate,
  useUpdate,
  type Identifier,
} from "ra-core";
import { ReferenceInput } from "@/components/admin/reference-input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

import { AutocompleteCompanyInput } from "../companies/AutocompleteCompanyInput";
import { warningBadgeClassName } from "../companies/CompanyBadges";
import type { Contact } from "../types";

/** Flags a contact waiting in the "Por definir" company */
export const PlaceholderCompanyBadge = ({
  className,
}: {
  className?: string;
}) => {
  const translate = useTranslate();
  return (
    <Badge variant="outline" className={cn(warningBadgeClassName, className)}>
      {translate("resources.contacts.placeholder_badge")}
    </Badge>
  );
};

/**
 * For a contact in "Por definir": a badge, and a button to move the contact
 * to its real company.
 */
export const ContactPlaceholderCompany = ({
  className,
}: {
  className?: string;
}) => {
  const record = useRecordContext<Contact>();
  if (!record?.company_is_placeholder) return null;
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <PlaceholderCompanyBadge />
      <AssignCompanyButton contacts={[record]} />
    </span>
  );
};

/** Assigns a company to the contacts selected in the contact list */
export const BulkAssignCompanyButton = () => {
  const {
    selectedIds = [],
    data = [],
    onUnselectItems,
  } = useListContext<Contact>();
  if (!selectedIds.length) return null;
  const contacts = data.filter((contact) => selectedIds.includes(contact.id));
  return (
    <AssignCompanyButton
      contacts={contacts}
      size="default"
      className="h-9"
      onAssigned={onUnselectItems}
    />
  );
};

export const AssignCompanyButton = ({
  contacts,
  size = "sm",
  className,
  onAssigned,
}: {
  contacts: Contact[];
  size?: "default" | "sm";
  className?: string;
  onAssigned?: () => void;
}) => {
  const translate = useTranslate();
  const notify = useNotify();
  const refresh = useRefresh();
  const [update] = useUpdate<Contact>();
  const [open, setOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const assign = async ({ company_id }: { company_id?: Identifier }) => {
    if (company_id == null) return;
    setIsSaving(true);
    try {
      await Promise.all(
        contacts.map((contact) =>
          update(
            "contacts",
            {
              id: contact.id,
              data: { company_id },
              previousData: contact,
            },
            { mutationMode: "pessimistic", returnPromise: true },
          ),
        ),
      );
      notify("resources.contacts.assign_company.success", {
        type: "success",
        messageArgs: { smart_count: contacts.length },
      });
      setOpen(false);
      onAssigned?.();
      refresh();
    } catch (error) {
      console.error("Failed to assign the company", error);
      notify("resources.contacts.assign_company.error", { type: "error" });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size={size}
        className={className}
        onClick={(event) => {
          // The button may sit next to a link to the contact
          event.preventDefault();
          event.stopPropagation();
          setOpen(true);
        }}
      >
        <Building2 />
        {translate("resources.contacts.assign_company.action")}
      </Button>
      <Dialog
        open={open}
        onOpenChange={(isOpen) => !isSaving && setOpen(isOpen)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {translate("resources.contacts.assign_company.action")}
            </DialogTitle>
            <DialogDescription>
              {translate("resources.contacts.assign_company.description", {
                smart_count: contacts.length,
              })}
            </DialogDescription>
          </DialogHeader>
          <Form onSubmit={assign} record={{}}>
            <div className="flex flex-col gap-4">
              <ReferenceInput
                source="company_id"
                reference="companies"
                filter={{ "is_placeholder@neq": true }}
                perPage={10}
              >
                <AutocompleteCompanyInput
                  label="resources.contacts.fields.company_id"
                  validate={required()}
                  modal
                />
              </ReferenceInput>
              <DialogFooter>
                <Button
                  type="button"
                  variant="ghost"
                  disabled={isSaving}
                  onClick={() => setOpen(false)}
                >
                  {translate("ra.action.cancel")}
                </Button>
                <Button type="submit" disabled={isSaving}>
                  {translate("resources.contacts.assign_company.action")}
                </Button>
              </DialogFooter>
            </div>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
};
