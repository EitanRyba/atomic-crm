import { useEffect, useId, useMemo, useRef } from "react";
import {
  useGetIdentity,
  useGetList,
  useGetOne,
  useInput,
  useRecordContext,
  useTranslate,
  type Identifier,
} from "ra-core";
import { useWatch } from "react-hook-form";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

import type {
  Company,
  Contact,
  Deal,
  Sale,
  Task,
  TaskAttendee,
} from "../types";
import {
  buildAttendeeCandidates,
  isMeetingTaskType,
  type AttendeeCandidate,
} from "./meetingTasks";

const toAttendee = ({ email, name }: TaskAttendee): TaskAttendee => ({
  email,
  name,
});

const sameEmail = (a: string, b: string) => a.toLowerCase() === b.toLowerCase();

/** The people who can be invited to a demo or meeting of a deal. */
const useAttendeeCandidates = (dealId: Identifier | null | undefined) => {
  const { identity } = useGetIdentity();
  const { data: deal, isPending: isDealPending } = useGetOne<Deal>(
    "deals",
    { id: dealId as Identifier },
    { enabled: dealId != null && dealId !== "" },
  );
  const { data: company, isPending: isCompanyPending } = useGetOne<Company>(
    "companies",
    { id: deal?.company_id as Identifier },
    { enabled: deal?.company_id != null },
  );
  const companyIds = [company?.id, company?.referred_by_company_id].filter(
    (id) => id != null,
  );
  const { data: contacts, isPending: isContactsPending } = useGetList<Contact>(
    "contacts_summary",
    {
      filter: { "company_id@in": `(${companyIds.join(",")})` },
      pagination: { page: 1, perPage: 500 },
      sort: { field: "last_name", order: "ASC" },
    },
    { enabled: companyIds.length > 0 },
  );
  // The contacts linked to the deal, whatever their company
  const dealContactIds = deal?.contact_ids ?? [];
  const { data: dealContacts, isPending: isDealContactsPending } =
    useGetList<Contact>(
      "contacts_summary",
      {
        filter: { "id@in": `(${dealContactIds.join(",")})` },
        pagination: { page: 1, perPage: 500 },
        sort: { field: "last_name", order: "ASC" },
      },
      { enabled: dealContactIds.length > 0 },
    );
  const { data: sales, isPending: isSalesPending } = useGetList<Sale>("sales", {
    filter: { "disabled@neq": true },
    pagination: { page: 1, perPage: 200 },
    sort: { field: "first_name", order: "ASC" },
  });

  const candidates = useMemo(
    () =>
      buildAttendeeCandidates({
        companyContacts: contacts?.filter(
          (contact) => String(contact.company_id) === String(company?.id),
        ),
        dealContacts: dealContactIds.length ? dealContacts : [],
        referrerContacts:
          company?.referred_by_company_id != null
            ? contacts?.filter(
                (contact) =>
                  String(contact.company_id) ===
                  String(company.referred_by_company_id),
              )
            : [],
        sales,
        currentSaleId: identity?.id,
      }),
    [
      contacts,
      dealContacts,
      dealContactIds.length,
      company,
      sales,
      identity?.id,
    ],
  );

  // Contacts nobody can invite, shown so the missing email gets noticed
  const withoutEmail = useMemo(() => {
    const all = [
      ...(contacts ?? []),
      ...(dealContactIds.length ? (dealContacts ?? []) : []),
    ];
    const names = all
      .filter((contact) => !contact.email_jsonb?.some((e) => e?.email?.trim()))
      .map((contact) =>
        [contact.first_name, contact.last_name].filter(Boolean).join(" "),
      );
    return [...new Set(names)];
  }, [contacts, dealContacts, dealContactIds.length]);

  const isPending =
    dealId == null ||
    isDealPending ||
    isSalesPending ||
    (deal?.company_id != null && isCompanyPending) ||
    (companyIds.length > 0 && isContactsPending) ||
    (dealContactIds.length > 0 && isDealContactsPending);

  return { candidates, withoutEmail, isPending };
};

/**
 * The guests of a demo or meeting: everyone who can be invited is checked by
 * default on a new meeting, and can be unchecked. Their emails go to the
 * Google Calendar event.
 */
export const TaskAttendeesInput = () => {
  const translate = useTranslate();
  const record = useRecordContext<Task>();
  const [type, dealId] = useWatch({ name: ["type", "deal_id"] });
  const { field } = useInput<TaskAttendee[]>({
    source: "attendees",
    defaultValue: [],
  });
  const { candidates, withoutEmail, isPending } = useAttendeeCandidates(dealId);
  const isMeeting = isMeetingTaskType(type);

  // A new meeting (or a task just turned into one) invites everyone; a saved
  // meeting keeps the guests chosen then.
  const preselect = !record?.id || !isMeetingTaskType(record.type);
  const preselectedFor = useRef<string | null>(null);
  useEffect(() => {
    if (!isMeeting || !preselect || isPending) return;
    const key = String(dealId);
    if (preselectedFor.current === key) return;
    preselectedFor.current = key;
    field.onChange(candidates.map(toAttendee));
  }, [isMeeting, preselect, isPending, dealId, candidates, field]);

  if (!isMeeting) return null;

  const selected: TaskAttendee[] = Array.isArray(field.value)
    ? field.value
    : [];
  // Guests saved earlier who are not offered anymore stay visible
  const options: AttendeeCandidate[] = [
    ...candidates,
    ...selected
      .filter(
        (attendee) =>
          !candidates.some((candidate) =>
            sameEmail(candidate.email, attendee.email),
          ),
      )
      .map((attendee) => ({ ...attendee, group: "company" as const })),
  ];

  const toggle = (candidate: AttendeeCandidate, checked: boolean) => {
    const others = selected.filter(
      (attendee) => !sameEmail(attendee.email, candidate.email),
    );
    field.onChange(checked ? [...others, toAttendee(candidate)] : others);
  };

  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="text-sm font-medium mb-1">
        {translate("resources.tasks.attendees.title")}
      </legend>
      {dealId == null || dealId === "" ? (
        <p className="text-sm text-muted-foreground">
          {translate("resources.tasks.attendees.pick_deal")}
        </p>
      ) : isPending ? null : options.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          {translate("resources.tasks.attendees.empty")}
        </p>
      ) : (
        <>
          <p className="text-xs text-muted-foreground">
            {translate("resources.tasks.attendees.help")}
          </p>
          <div className="flex flex-col gap-2 max-h-60 overflow-y-auto">
            {options.map((candidate) => (
              <AttendeeOption
                key={candidate.email.toLowerCase()}
                candidate={candidate}
                checked={selected.some((attendee) =>
                  sameEmail(attendee.email, candidate.email),
                )}
                onCheckedChange={(checked) => toggle(candidate, checked)}
              />
            ))}
          </div>
        </>
      )}
      {!isPending && withoutEmail.length > 0 && (
        <ul className="flex flex-col gap-1">
          {withoutEmail.map((name) => (
            <li key={name} className="text-sm text-muted-foreground">
              {name}
              <span className="ml-2 text-xs">
                {translate("resources.tasks.attendees.no_email")}
              </span>
            </li>
          ))}
        </ul>
      )}
    </fieldset>
  );
};

const AttendeeOption = ({
  candidate,
  checked,
  onCheckedChange,
}: {
  candidate: AttendeeCandidate;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}) => {
  const translate = useTranslate();
  const id = useId();
  return (
    <div className="flex items-start gap-2">
      <Checkbox
        id={id}
        checked={checked}
        onCheckedChange={(value) => onCheckedChange(value === true)}
        className="mt-0.5"
      />
      <Label htmlFor={id} className="flex flex-col items-start gap-0">
        <span>
          {candidate.name || candidate.email}
          <span className="ml-2 text-xs font-normal text-muted-foreground">
            {translate(`resources.tasks.attendees.${candidate.group}`)}
          </span>
        </span>
        <span className="text-xs font-normal text-muted-foreground">
          {candidate.email}
        </span>
      </Label>
    </div>
  );
};
