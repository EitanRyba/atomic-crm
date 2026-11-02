import { useQueryClient } from "@tanstack/react-query";
import {
  type Identifier,
  useGetIdentity,
  useGetOne,
  useNotify,
  useTranslate,
} from "ra-core";

import { CreateSheet } from "../misc/CreateSheet";
import type { Deal } from "../types";
import { cleanupTaskAttendees } from "./meetingTasks";
import { TaskFormContent } from "./TaskFormContent";

export interface TaskCreateSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  // the deal of the task; picked in the form when missing
  deal_id?: Identifier;
}

export const TaskCreateSheet = ({
  open,
  onOpenChange,
  deal_id,
}: TaskCreateSheetProps) => {
  const { identity } = useGetIdentity();
  const translate = useTranslate();
  const queryClient = useQueryClient();
  const notify = useNotify();

  const selectDeal = deal_id == null;
  const { data: deal } = useGetOne<Deal>(
    "deals",
    { id: deal_id! },
    { enabled: !selectDeal },
  );

  if (!identity) return null;

  const handleSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ["tasks"] });
    notify("resources.tasks.added");
    // No redirect, only close the sheet
    onOpenChange(false);
  };

  return (
    <CreateSheet
      resource="tasks"
      title={
        <span className="text-xl font-semibold truncate pr-10">
          {!selectDeal && deal
            ? translate("resources.tasks.dialog.create_for", {
                name: deal.name,
              })
            : translate("resources.tasks.dialog.create")}
        </span>
      }
      redirect={false}
      record={{
        type: "none",
        deal_id,
        due_date: new Date().toISOString(),
        sales_id: identity.id,
        attendees: [],
      }}
      transform={cleanupTaskAttendees}
      mutationOptions={{
        onSuccess: handleSuccess,
      }}
      open={open}
      onOpenChange={onOpenChange}
    >
      <TaskFormContent selectDeal={selectDeal} />
    </CreateSheet>
  );
};
