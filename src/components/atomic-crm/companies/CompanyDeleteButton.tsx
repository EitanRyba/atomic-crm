import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Trash } from "lucide-react";
import {
  useDataProvider,
  useNotify,
  useRecordContext,
  useRedirect,
  useTranslate,
} from "ra-core";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import type { CrmDataProvider } from "../providers/types";
import type { Company, DeleteCompanyContactsMode } from "../types";

/**
 * Deletes a company after asking what to do with its contacts: move them to
 * "Por definir" or delete them too. The database refuses to delete a company
 * that still has contacts, so every company deletion goes through here.
 */
export const CompanyDeleteButton = ({
  className = "cursor-pointer hover:bg-destructive/10! text-destructive! border-destructive! focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40",
  size,
}: {
  className?: string;
  size?: "default" | "sm" | "lg";
}) => {
  const record = useRecordContext<Company>();
  const dataProvider = useDataProvider<CrmDataProvider>();
  const queryClient = useQueryClient();
  const translate = useTranslate();
  const notify = useNotify();
  const redirect = useRedirect();
  const [open, setOpen] = useState(false);

  const { mutate, isPending } = useMutation({
    mutationFn: (contactsMode: DeleteCompanyContactsMode) =>
      dataProvider.deleteCompany(record!.id, contactsMode),
    onSuccess: () => {
      setOpen(false);
      notify("resources.companies.delete_dialog.success", { type: "info" });
      // contacts, deals and company counts all changed
      queryClient.invalidateQueries();
      redirect("list", "companies");
    },
    onError: (error) => {
      console.error("Failed to delete the company", error);
      notify("resources.companies.delete_dialog.error", { type: "error" });
    },
  });

  // The "Por definir" system company cannot be deleted
  if (!record || record.is_placeholder) return null;

  const nbContacts = record.nb_contacts ?? 0;

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size={size}
        className={className}
        onClick={() => setOpen(true)}
      >
        <Trash />
        {translate("ra.action.delete")}
      </Button>
      <Dialog
        open={open}
        onOpenChange={(isOpen) => !isPending && setOpen(isOpen)}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {nbContacts > 0
                ? translate("resources.companies.delete_dialog.title", {
                    smart_count: nbContacts,
                  })
                : translate("resources.companies.delete_dialog.confirm_title", {
                    name: record.name,
                  })}
            </DialogTitle>
            <DialogDescription>
              {nbContacts > 0
                ? translate("resources.companies.delete_dialog.description", {
                    name: record.name,
                  })
                : translate(
                    "resources.companies.delete_dialog.confirm_description",
                  )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              disabled={isPending}
              onClick={() => setOpen(false)}
            >
              {translate("ra.action.cancel")}
            </Button>
            {nbContacts > 0 ? (
              <>
                <Button
                  type="button"
                  variant="outline"
                  disabled={isPending}
                  onClick={() => mutate("move")}
                >
                  {translate("resources.companies.delete_dialog.move")}
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  disabled={isPending}
                  onClick={() => mutate("delete")}
                >
                  {translate("resources.companies.delete_dialog.delete")}
                </Button>
              </>
            ) : (
              <Button
                type="button"
                variant="destructive"
                disabled={isPending}
                onClick={() => mutate("move")}
              >
                {translate("ra.action.delete")}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
