import { useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import {
  CreateBase,
  Form,
  useGetIdentity,
  useNotify,
  useRecordContext,
  useTranslate,
} from "ra-core";
import { useState } from "react";
import { SaveButton } from "@/components/admin/form";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import type { Deal } from "../types";
import { cleanupTaskMeetingFields } from "./meetingTasks";
import { TaskFormContent } from "./TaskFormContent";

/**
 * Adds a task to a deal: the deal in the record context, or one picked in the
 * form with `selectDeal` (e.g. from the dashboard).
 */
export const AddTask = ({
  selectDeal,
  dealFilter,
  display = "chip",
}: {
  selectDeal?: boolean;
  // with selectDeal: limits the deals offered (e.g. a company's)
  dealFilter?: Record<string, unknown>;
  display?: "chip" | "icon";
}) => {
  const { identity } = useGetIdentity();
  const notify = useNotify();
  const translate = useTranslate();
  const queryClient = useQueryClient();
  const deal = useRecordContext<Deal>();
  const [open, setOpen] = useState(false);
  const handleOpen = () => {
    setOpen(true);
  };

  const handleSuccess = () => {
    setOpen(false);
    queryClient.invalidateQueries({ queryKey: ["tasks"] });
    notify("resources.tasks.added");
  };

  if (!identity) return null;

  return (
    <>
      {display === "icon" ? (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="sm"
                variant="ghost"
                className="p-2 cursor-pointer"
                onClick={handleOpen}
                aria-label={translate("resources.tasks.action.create")}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {translate("resources.tasks.action.create")}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ) : (
        <div className="my-2">
          <Button
            variant="outline"
            className="h-6 cursor-pointer"
            onClick={handleOpen}
            size="sm"
          >
            <Plus className="w-4 h-4" />
            {translate("resources.tasks.action.add")}
          </Button>
        </div>
      )}

      <CreateBase
        resource="tasks"
        record={{
          type: "none",
          // the record in context is a deal unless one must be picked
          deal_id: selectDeal ? undefined : deal?.id,
          due_date: new Date().toISOString(),
          sales_id: identity.id,
          attendees: [],
        }}
        transform={cleanupTaskMeetingFields}
        mutationOptions={{ onSuccess: handleSuccess }}
      >
        <Dialog open={open} onOpenChange={() => setOpen(false)}>
          <DialogContent className="lg:max-w-xl overflow-y-auto max-h-9/10 top-1/20 translate-y-0">
            {open ? (
              <Form className="flex flex-col gap-4">
                <DialogHeader>
                  <DialogTitle>
                    {!selectDeal && deal
                      ? translate("resources.tasks.dialog.create_for", {
                          name: deal.name,
                        })
                      : translate("resources.tasks.dialog.create")}
                  </DialogTitle>
                </DialogHeader>
                <TaskFormContent
                  selectDeal={selectDeal}
                  dealFilter={dealFilter}
                />
                <DialogFooter className="w-full justify-end">
                  <SaveButton />
                </DialogFooter>
              </Form>
            ) : null}
          </DialogContent>
        </Dialog>
      </CreateBase>
    </>
  );
};
