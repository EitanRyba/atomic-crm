// Google Calendar for Humand CRM: OAuth tokens and task events.
// Needs the GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET secrets, and APP_URLS
// (comma-separated CRM addresses, the first one is used in event links).
import { supabaseAdmin } from "./supabaseAdmin.ts";

const TOKEN_URL = "https://oauth2.googleapis.com/token";
const CALENDAR_API = "https://www.googleapis.com/calendar/v3";
export const GOOGLE_SCOPES = [
  "openid",
  "email",
  "https://www.googleapis.com/auth/calendar.events",
];
// Timed tasks become events of this length
const EVENT_MINUTES = 30;
const DONE_PREFIX = "✓ ";

export const getAppUrls = (): string[] =>
  (Deno.env.get("APP_URLS") ?? "")
    .split(",")
    .map((url) => url.trim())
    .filter(Boolean);

export const getRedirectUri = () =>
  `${Deno.env.get("SUPABASE_URL")}/functions/v1/google_calendar`;

export const isGoogleConfigured = () =>
  !!Deno.env.get("GOOGLE_CLIENT_ID") && !!Deno.env.get("GOOGLE_CLIENT_SECRET");

export class GoogleAuthRevokedError extends Error {}

const postToken = async (params: Record<string, string>) => {
  const response = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: Deno.env.get("GOOGLE_CLIENT_ID") ?? "",
      client_secret: Deno.env.get("GOOGLE_CLIENT_SECRET") ?? "",
      ...params,
    }),
  });
  const body = await response.json();
  if (!response.ok) {
    if (body?.error === "invalid_grant") {
      throw new GoogleAuthRevokedError(
        body.error_description ?? "invalid_grant",
      );
    }
    throw new Error(`Google token error ${response.status}: ${body?.error}`);
  }
  return body as {
    access_token: string;
    refresh_token?: string;
    id_token?: string;
  };
};

/** Exchanges the OAuth code for tokens, and reads the account's email. */
export const exchangeCode = async (code: string) => {
  const tokens = await postToken({
    code,
    grant_type: "authorization_code",
    redirect_uri: getRedirectUri(),
  });
  let email: string | null = null;
  if (tokens.id_token) {
    try {
      const payload = tokens.id_token.split(".")[1];
      const json = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
      email = JSON.parse(json).email ?? null;
    } catch (error) {
      console.error("Could not read the Google account email", error);
    }
  }
  return { ...tokens, email };
};

export const revokeToken = async (token: string) => {
  const response = await fetch(
    `https://oauth2.googleapis.com/revoke?token=${encodeURIComponent(token)}`,
    { method: "POST" },
  );
  if (!response.ok) {
    console.error("Google token revocation failed", response.status);
  }
};

type Connection = {
  sales_id: number;
  refresh_token: string;
  calendar_id: string;
};

export const getConnection = async (
  salesId: number,
): Promise<Connection | null> => {
  const { data, error } = await supabaseAdmin
    .from("google_calendar_connections")
    .select("sales_id, refresh_token, calendar_id")
    .eq("sales_id", salesId)
    .maybeSingle();
  if (error) throw error;
  return data;
};

/** A fresh access token; a revoked connection is forgotten. */
const getAccessToken = async (connection: Connection) => {
  try {
    const tokens = await postToken({
      refresh_token: connection.refresh_token,
      grant_type: "refresh_token",
    });
    return tokens.access_token;
  } catch (error) {
    if (error instanceof GoogleAuthRevokedError) {
      await supabaseAdmin
        .from("google_calendar_connections")
        .delete()
        .eq("sales_id", connection.sales_id);
    }
    throw error;
  }
};

type TaskRow = {
  id: number;
  text: string | null;
  type: string | null;
  due_date: string | null;
  done_date: string | null;
  sales_id: number | null;
  contact_id: number;
  google_event_id: string | null;
  contacts: {
    first_name: string | null;
    last_name: string | null;
    companies: { name: string | null } | null;
  } | null;
};

const getTask = async (taskId: number): Promise<TaskRow | null> => {
  const { data, error } = await supabaseAdmin
    .from("tasks")
    .select(
      "id, text, type, due_date, done_date, sales_id, contact_id, google_event_id, contacts(first_name, last_name, companies(name))",
    )
    .eq("id", taskId)
    .maybeSingle();
  if (error) throw error;
  return data as TaskRow | null;
};

const buildEvent = (task: TaskRow) => {
  const contact = task.contacts;
  const who = [contact?.first_name, contact?.last_name]
    .filter(Boolean)
    .join(" ");
  const company = contact?.companies?.name;
  const title = [task.text ?? "", who && `— ${who}`, company && `(${company})`]
    .filter(Boolean)
    .join(" ");
  const start = new Date(task.due_date!);
  const end = new Date(start.getTime() + EVENT_MINUTES * 60 * 1000);
  const appUrl = getAppUrls()[0];
  return {
    summary: `${task.done_date ? DONE_PREFIX : ""}${title}`.slice(0, 250),
    description: appUrl
      ? `${appUrl.replace(/\/?$/, "/")}#/contacts/${task.contact_id}/show`
      : undefined,
    start: { dateTime: start.toISOString() },
    end: { dateTime: end.toISOString() },
    source: appUrl ? { title: "Humand CRM", url: appUrl } : undefined,
  };
};

const calendarFetch = (
  accessToken: string,
  path: string,
  init: RequestInit = {},
) =>
  fetch(`${CALENDAR_API}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      ...init.headers,
    },
  });

const eventPath = (calendarId: string, eventId?: string) =>
  `/calendars/${encodeURIComponent(calendarId)}/events${eventId ? `/${encodeURIComponent(eventId)}` : ""}`;

const saveEventId = (taskId: number, eventId: string | null) =>
  supabaseAdmin
    .from("tasks")
    .update({ google_event_id: eventId })
    .eq("id", taskId);

/**
 * Creates, updates or removes the calendar event of a task, in the calendar
 * of the user the task belongs to. Does nothing when that user has not
 * connected a calendar.
 */
export const syncTask = async (taskId: number): Promise<string> => {
  const task = await getTask(taskId);
  if (!task || task.sales_id == null) return "no_task";
  const connection = await getConnection(task.sales_id);
  if (!connection) return "not_connected";
  const accessToken = await getAccessToken(connection);

  // A task without a date has no event
  if (!task.due_date) {
    if (task.google_event_id) {
      await deleteEvent(
        accessToken,
        connection.calendar_id,
        task.google_event_id,
      );
      await saveEventId(task.id, null);
    }
    return "no_date";
  }

  const event = JSON.stringify(buildEvent(task));
  if (task.google_event_id) {
    const response = await calendarFetch(
      accessToken,
      eventPath(connection.calendar_id, task.google_event_id),
      { method: "PATCH", body: event },
    );
    if (response.ok) return "updated";
    // The event was deleted in Google Calendar: create it again
    if (response.status !== 404 && response.status !== 410) {
      throw new Error(`Google Calendar update failed: ${response.status}`);
    }
  }

  const response = await calendarFetch(
    accessToken,
    eventPath(connection.calendar_id),
    { method: "POST", body: event },
  );
  if (!response.ok) {
    throw new Error(`Google Calendar create failed: ${response.status}`);
  }
  const created = await response.json();
  await saveEventId(task.id, created.id);
  return "created";
};

const deleteEvent = async (
  accessToken: string,
  calendarId: string,
  eventId: string,
) => {
  const response = await calendarFetch(
    accessToken,
    eventPath(calendarId, eventId),
    { method: "DELETE" },
  );
  // Already gone is fine
  if (!response.ok && response.status !== 404 && response.status !== 410) {
    throw new Error(`Google Calendar delete failed: ${response.status}`);
  }
};

/** Removes the calendar event of a task about to be deleted. */
export const deleteTaskEvent = async (taskId: number): Promise<string> => {
  const task = await getTask(taskId);
  if (!task?.google_event_id || task.sales_id == null) return "no_event";
  const connection = await getConnection(task.sales_id);
  if (!connection) return "not_connected";
  const accessToken = await getAccessToken(connection);
  await deleteEvent(accessToken, connection.calendar_id, task.google_event_id);
  await saveEventId(task.id, null);
  return "deleted";
};
