import { ReferenceField } from "@/components/admin";
import type { Identifier } from "ra-core";
import { useTranslate } from "ra-core";
import { EditSheet } from "../misc/EditSheet";
import type { Deal, Task } from "../types";
import { cleanupTaskMeetingFields } from "./meetingTasks";
import { TaskFormContent } from "./TaskFormContent";

export interface TaskEditSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  taskId: Identifier;
}

export const TaskEditSheet = ({
  open,
  onOpenChange,
  taskId,
}: TaskEditSheetProps) => {
  const translate = useTranslate();
  return (
    <EditSheet
      resource="tasks"
      id={taskId}
      title={
        <ReferenceField<Task, Deal>
          source="deal_id"
          reference="deals"
          empty={
            <span className="text-xl font-semibold truncate pr-10">
              {translate("resources.tasks.sheet.edit")}
            </span>
          }
          render={({ referenceRecord }) => (
            <span className="text-xl font-semibold truncate pr-10">
              {referenceRecord
                ? translate("resources.tasks.sheet.edit_for", {
                    name: referenceRecord.name,
                  })
                : translate("resources.tasks.sheet.edit")}
            </span>
          )}
        />
      }
      redirect={false}
      transform={cleanupTaskMeetingFields}
      open={open}
      onOpenChange={onOpenChange}
    >
      <TaskFormContent />
    </EditSheet>
  );
};
