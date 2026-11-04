// Google Calendar for Humand CRM: OAuth tokens and task events.
// Needs the GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET secrets, and APP_URLS
// (comma-separated CRM addresses, the first one is used in event links).
import { supabaseAdmin } from "./supabaseAdmin.ts";
import {
  buildEvent,
  eventQuery,
  extractMeetUrl,
  isMeetingTask,
  sendUpdatesFor,
  type CalendarTask,
} from "./calendarEvent.ts";

const TOKEN_URL = "https://oauth2.googleapis.com/token";
const CALENDAR_API = "https://www.googleapis.com/calendar/v3";
// calendar.events also covers the guests and the Meet link of meetings
export const GOOGLE_SCOPES = [
  "openid",
  "email",
  "https://www.googleapis.com/auth/calendar.events",
];

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

type TaskRow = CalendarTask & {
  sales_id: number | null;
  google_event_id: string | null;
};

const getTask = async (taskId: number): Promise<TaskRow | null> => {
  const { data, error } = await supabaseAdmin
    .from("tasks")
    .select(
      "id, text, type, due_date, done_date, sales_id, contact_id, deal_id, google_event_id, attendees, meet_url, meeting_title, contacts(first_name, last_name, companies(name)), deals(name, companies(name))",
    )
    .eq("id", taskId)
    .maybeSingle();
  if (error) throw error;
  return data as unknown as TaskRow | null;
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

const saveEvent = async (
  taskId: number,
  values: { google_event_id?: string | null; meet_url?: string | null },
) => {
  const { error } = await supabaseAdmin
    .from("tasks")
    .update(values)
    .eq("id", taskId);
  if (error) throw error;
};

/** The Meet link to keep after a sync: meetings only. */
const meetUrlAfterSync = (task: TaskRow, event: unknown) =>
  isMeetingTask(task) ? (extractMeetUrl(event) ?? task.meet_url) : null;

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
        sendUpdatesFor(task),
      );
      await saveEvent(task.id, { google_event_id: null, meet_url: null });
    }
    return "no_date";
  }

  const appUrl = getAppUrls()[0];
  // Meetings invite their guests: they get the invitation and its updates
  const query = eventQuery(sendUpdatesFor(task));
  if (task.google_event_id) {
    const response = await calendarFetch(
      accessToken,
      `${eventPath(connection.calendar_id, task.google_event_id)}${query}`,
      {
        method: "PATCH",
        body: JSON.stringify(
          buildEvent(task, { appUrl, requestId: crypto.randomUUID() }),
        ),
      },
    );
    if (response.ok) {
      const meetUrl = meetUrlAfterSync(task, await response.json());
      if (meetUrl !== task.meet_url) {
        await saveEvent(task.id, { meet_url: meetUrl });
      }
      return "updated";
    }
    // The event was deleted in Google Calendar: create it again
    if (response.status !== 404 && response.status !== 410) {
      throw new Error(`Google Calendar update failed: ${response.status}`);
    }
  }

  // A new event asks for a new Meet link, even if the task had one
  const response = await calendarFetch(
    accessToken,
    `${eventPath(connection.calendar_id)}${query}`,
    {
      method: "POST",
      body: JSON.stringify(
        buildEvent(
          { ...task, meet_url: null },
          { appUrl, requestId: crypto.randomUUID() },
        ),
      ),
    },
  );
  if (!response.ok) {
    throw new Error(`Google Calendar create failed: ${response.status}`);
  }
  const created = await response.json();
  await saveEvent(task.id, {
    google_event_id: created.id,
    meet_url: meetUrlAfterSync({ ...task, meet_url: null }, created),
  });
  return "created";
};

const deleteEvent = async (
  accessToken: string,
  calendarId: string,
  eventId: string,
  sendUpdates: "all" | "none",
) => {
  // Guests of a pending meeting get the cancellation
  const response = await calendarFetch(
    accessToken,
    `${eventPath(calendarId, eventId)}?sendUpdates=${sendUpdates}`,
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
  await deleteEvent(
    accessToken,
    connection.calendar_id,
    task.google_event_id,
    sendUpdatesFor(task),
  );
  await saveEvent(task.id, { google_event_id: null, meet_url: null });
  return "deleted";
};
