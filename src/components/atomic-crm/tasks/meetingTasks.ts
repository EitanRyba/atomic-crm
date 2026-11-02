import type { Contact, Sale, Task, TaskAttendee } from "../types";

/** Task types whose calendar event invites guests and gets a Meet link */
export const MEETING_TASK_TYPES = ["demo", "meeting"];

export const isMeetingTaskType = (type: string | null | undefined): boolean =>
  !!type && MEETING_TASK_TYPES.includes(type);

export type AttendeeGroup = "company" | "referrer" | "team";

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

const firstEmail = (contact: ContactLike) =>
  contact.email_jsonb?.find((entry) => entry?.email?.trim())?.email?.trim();

/**
 * Who can be invited to a demo or meeting of a deal: the contacts of the
 * deal's company, the contacts of the company that referred it, and the other
 * CRM users (not disabled, not the current user). Only people with an email,
 * each email once, in that order.
 */
export const buildAttendeeCandidates = ({
  companyContacts = [],
  referrerContacts = [],
  sales = [],
  currentSaleId,
}: {
  companyContacts?: ContactLike[];
  referrerContacts?: ContactLike[];
  sales?: SaleLike[];
  currentSaleId?: Sale["id"] | null;
}): AttendeeCandidate[] => {
  const candidates = [
    ...companyContacts.map((contact) => ({
      email: firstEmail(contact),
      name: fullName(contact.first_name, contact.last_name),
      group: "company" as const,
    })),
    ...referrerContacts.map((contact) => ({
      email: firstEmail(contact),
      name: fullName(contact.first_name, contact.last_name),
      group: "referrer" as const,
    })),
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

/** Only demo and meeting tasks keep guests. */
export const cleanupTaskAttendees = <T extends Partial<Task>>(values: T): T =>
  isMeetingTaskType(values.type)
    ? {
        ...values,
        attendees: (values.attendees ?? []).map(({ email, name }) => ({
          email,
          name,
        })),
      }
    : { ...values, attendees: [] };

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
