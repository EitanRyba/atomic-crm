import type { Contact, Sale, Task, TaskAttendee } from "../types";

/** Task types whose calendar event invites guests and gets a Meet link */
export const MEETING_TASK_TYPES = ["demo", "meeting"];

export const isMeetingTaskType = (type: string | null | undefined): boolean =>
  !!type && MEETING_TASK_TYPES.includes(type);

export type AttendeeGroup = "company" | "deal" | "referrer" | "team";

export interface AttendeeCandidate extends TaskAttendee {
  group: AttendeeGroup;
}

type ContactLike = Pick<Contact, "first_name" | "last_name" | "email_jsonb">;
type SaleLike = Pick<
  Sale,
  "id" | "first_name" | "last_name" | "email" | "disabled"
>;

const fullName = (first?: string | null, last?: string | null) =>
  [first, last].filter(Boolean).join(" ").trim();

/** One candidate per email of the contact: a contact may have several. */
const contactCandidates = (contacts: ContactLike[], group: AttendeeGroup) =>
  contacts.flatMap((contact) =>
    (contact.email_jsonb ?? []).map((entry) => ({
      email: entry?.email?.trim(),
      name: fullName(contact.first_name, contact.last_name),
      group,
    })),
  );

/**
 * Who can be invited to a demo or meeting of a deal: every email of the
 * contacts of the deal's company, of the contacts linked to the deal, and of
 * the contacts of the company that referred it, then the other CRM users
 * (not disabled, not the current user). Each email once (whatever its case),
 * in that order.
 */
export const buildAttendeeCandidates = ({
  companyContacts = [],
  dealContacts = [],
  referrerContacts = [],
  sales = [],
  currentSaleId,
}: {
  companyContacts?: ContactLike[];
  dealContacts?: ContactLike[];
  referrerContacts?: ContactLike[];
  sales?: SaleLike[];
  currentSaleId?: Sale["id"] | null;
}): AttendeeCandidate[] => {
  const candidates = [
    ...contactCandidates(companyContacts, "company"),
    ...contactCandidates(dealContacts, "deal"),
    ...contactCandidates(referrerContacts, "referrer"),
    ...sales
      .filter(
        (sale) =>
          !sale.disabled &&
          (currentSaleId == null || String(sale.id) !== String(currentSaleId)),
      )
      .map((sale) => ({
        email: sale.email?.trim(),
        name: fullName(sale.first_name, sale.last_name),
        group: "team" as const,
      })),
  ];

  const seen = new Set<string>();
  return candidates.flatMap((candidate) => {
    if (!candidate.email) return [];
    const key = candidate.email.toLowerCase();
    if (seen.has(key)) return [];
    seen.add(key);
    return [{ ...candidate, email: candidate.email }];
  });
};

/** "Demo - McDonalds": the default title of a meeting, for its guests. */
export const defaultMeetingTitle = (
  typeLabel: string | null | undefined,
  companyName: string | null | undefined,
): string => [typeLabel, companyName].filter(Boolean).join(" - ");

/** Only demo and meeting tasks keep guests and a meeting title. */
export const cleanupTaskMeetingFields = <T extends Partial<Task>>(
  values: T,
): T =>
  isMeetingTaskType(values.type)
    ? {
        ...values,
        meeting_title: values.meeting_title?.trim() || null,
        attendees: (values.attendees ?? []).map(({ email, name }) => ({
          email,
          name,
        })),
      }
    : { ...values, attendees: [], meeting_title: null };

/** The next demo or meeting of a deal: not done, due now or later. */
export const findNextMeeting = <
  T extends Pick<Task, "type" | "due_date" | "done_date">,
>(
  tasks: T[] | undefined,
  now: Date = new Date(),
): T | undefined =>
  (tasks ?? [])
    .filter(
      (task) =>
        isMeetingTaskType(task.type) &&
        !task.done_date &&
        !!task.due_date &&
        new Date(task.due_date).getTime() >= now.getTime(),
    )
    .sort(
      (a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime(),
    )[0];
