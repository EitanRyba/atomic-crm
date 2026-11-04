import { useEffect, useRef } from "react";
import { useGetOne, type Identifier } from "ra-core";
import { useFormContext, useWatch } from "react-hook-form";
import { TextInput } from "@/components/admin/text-input";

import { useConfigurationContext } from "../root/ConfigurationContext";
import type { Company, Deal } from "../types";
import { defaultMeetingTitle, isMeetingTaskType } from "./meetingTasks";

/**
 * The title of a demo or meeting, which its guests see in their calendar.
 * Prefilled with "<type> - <company>" (e.g. "Demo - McDonalds") until the user
 * writes their own.
 */
export const MeetingTitleInput = () => {
  const { taskTypes } = useConfigurationContext();
  const { setValue, getValues } = useFormContext();
  const [type, dealId] = useWatch({ name: ["type", "deal_id"] });
  const isMeeting = isMeetingTaskType(type);

  const { data: deal } = useGetOne<Deal>(
    "deals",
    { id: dealId as Identifier },
    { enabled: isMeeting && dealId != null && dealId !== "" },
  );
  const { data: company } = useGetOne<Company>(
    "companies",
    { id: deal?.company_id as Identifier },
    { enabled: isMeeting && deal?.company_id != null },
  );

  const typeLabel = taskTypes.find(
    (taskType) => taskType.value === type,
  )?.label;
  const suggested = isMeeting
    ? defaultMeetingTitle(typeLabel, company?.name)
    : "";

  // The last title filled in automatically: a title still equal to it (or
  // empty) was not edited by the user, so it follows the type and company.
  const lastSuggested = useRef<string | null>(null);
  useEffect(() => {
    if (!isMeeting || !suggested) return;
    const current = (getValues("meeting_title") ?? "") as string;
    if (current !== "" && current !== lastSuggested.current) return;
    lastSuggested.current = suggested;
    if (current !== suggested) {
      setValue("meeting_title", suggested, { shouldDirty: true });
    }
  }, [isMeeting, suggested, getValues, setValue]);

  if (!isMeeting) return null;

  return (
    <TextInput
      source="meeting_title"
      label="resources.tasks.fields.meeting_title"
      helperText={false}
    />
  );
};
