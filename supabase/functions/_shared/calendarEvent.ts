// The Google Calendar event of a CRM task. Pure: no Deno or Supabase import,
// so that it can be unit tested.

// Task types whose event invites guests and gets a Google Meet link
export const MEETING_TASK_TYPES = ["demo", "meeting"];
// Timed tasks become events of this length
export const EVENT_MINUTES = 30;
export const DONE_PREFIX = "✓ ";

export type TaskAttendee = { email: string; name?: string | null };

export type CalendarTask = {
  id: number;
  text: string | null;
  type: string | null;
  due_date: string | null;
  done_date: string | null;
  contact_id: number | null;
  deal_id: number | null;
  attendees: TaskAttendee[] | null;
  meet_url: string | null;
  contacts: {
    first_name: string | null;
    last_name: string | null;
    companies: { name: string | null } | null;
  } | null;
  deals: {
    name: string | null;
    companies: { name: string | null } | null;
  } | null;
};

export const isMeetingTask = (task: Pick<CalendarTask, "type">) =>
  !!task.type && MEETING_TASK_TYPES.includes(task.type);

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** The guests of a meeting task, each valid email once. */
export const eventAttendees = (task: Pick<CalendarTask, "attendees">) => {
  const seen = new Set<string>();
  return (Array.isArray(task.attendees) ? task.attendees : []).flatMap(
    (attendee) => {
      const email =
        typeof attendee?.email === "string" ? attendee.email.trim() : "";
      if (!EMAIL_REGEX.test(email) || seen.has(email.toLowerCase())) {
        return [];
      }
      seen.add(email.toLowerCase());
      return [
        attendee.name
          ? { email, displayName: String(attendee.name) }
          : { email },
      ];
    },
  );
};

/** "Task text — Deal (Company)", or the contact for older tasks. */
export const eventTitle = (task: CalendarTask) => {
  const deal = task.deals;
  if (deal) {
    const company = deal.companies?.name;
    return [
      task.text ?? "",
      deal.name && `— ${deal.name}`,
      company && `(${company})`,
    ]
      .filter(Boolean)
      .join(" ");
  }
  const contact = task.contacts;
  const who = [contact?.first_name, contact?.last_name]
    .filter(Boolean)
    .join(" ");
  const company = contact?.companies?.name;
  return [task.text ?? "", who && `— ${who}`, company && `(${company})`]
    .filter(Boolean)
    .join(" ");
};

const crmLink = (task: CalendarTask, appUrl?: string) => {
  if (!appUrl) return undefined;
  const base = appUrl.replace(/\/?$/, "/");
  if (task.deal_id != null) return `${base}#/deals/${task.deal_id}/show`;
  if (task.contact_id != null)
    return `${base}#/contacts/${task.contact_id}/show`;
  return base;
};

/**
 * The event body sent to Google Calendar. A pending demo or meeting invites
 * its guests and, when it has no Meet link yet, asks Google for one
 * (`requestId` identifies that request). Other tasks have no guests, and lose
 * the conference of a task that used to be a meeting.
 */
export const buildEvent = (
  task: CalendarTask,
  { appUrl, requestId }: { appUrl?: string; requestId: string },
) => {
  const start = new Date(task.due_date!);
  const end = new Date(start.getTime() + EVENT_MINUTES * 60 * 1000);
  const meeting = isMeetingTask(task);
  const event: Record<string, unknown> = {
    summary: `${task.done_date ? DONE_PREFIX : ""}${eventTitle(task)}`.slice(
      0,
      250,
    ),
    description: crmLink(task, appUrl),
    start: { dateTime: start.toISOString() },
    end: { dateTime: end.toISOString() },
    source: appUrl ? { title: "Humand CRM", url: appUrl } : undefined,
    attendees: meeting ? eventAttendees(task) : [],
  };
  if (meeting && !task.meet_url) {
    event.conferenceData = {
      createRequest: {
        requestId,
        conferenceSolutionKey: { type: "hangoutsMeet" },
      },
    };
  }
  if (!meeting && task.meet_url) {
    event.conferenceData = null;
  }
  return event;
};

/**
 * Guests get the invitations, updates and cancellations of a pending meeting
 * (or of a task that just stopped being one). Done tasks change silently.
 */
export const sendUpdatesFor = (
  task: Pick<CalendarTask, "type" | "done_date" | "meet_url">,
): "all" | "none" =>
  !task.done_date && (isMeetingTask(task) || !!task.meet_url) ? "all" : "none";

/** The Meet link of a Google Calendar event, if it has one. */
export const extractMeetUrl = (event: unknown): string | null => {
  if (!event || typeof event !== "object") return null;
  const { hangoutLink, conferenceData } = event as {
    hangoutLink?: unknown;
    conferenceData?: {
      entryPoints?: { entryPointType?: string; uri?: unknown }[];
    };
  };
  const video = conferenceData?.entryPoints?.find(
    (entry) => entry?.entryPointType === "video",
  )?.uri;
  const url = typeof hangoutLink === "string" ? hangoutLink : video;
  return typeof url === "string" && url.startsWith("https://") ? url : null;
};

/** Query string of the event calls: Meet support, and who gets emails. */
export const eventQuery = (sendUpdates: "all" | "none") =>
  `?conferenceDataVersion=1&sendUpdates=${sendUpdates}`;
