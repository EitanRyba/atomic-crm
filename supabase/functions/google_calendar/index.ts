import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { corsHeaders, OptionsMiddleware } from "../_shared/cors.ts";
import { AuthMiddleware, UserMiddleware } from "../_shared/authentication.ts";
import { getUserSale } from "../_shared/getUserSale.ts";
import { supabaseAdmin } from "../_shared/supabaseAdmin.ts";
import { createErrorResponse } from "../_shared/utils.ts";
import {
  GOOGLE_SCOPES,
  deleteTaskEvent,
  exchangeCode,
  getAppUrls,
  getConnection,
  getRedirectUri,
  isGoogleConfigured,
  revokeToken,
  syncTask,
} from "../_shared/googleCalendar.ts";

// An OAuth round trip must finish within this time
const STATE_TTL_MINUTES = 15;

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders },
  });

/** Only CRM addresses listed in APP_URLS can receive the user back. */
const safeReturnTo = (returnTo: unknown): string | null => {
  const urls = getAppUrls();
  if (typeof returnTo === "string") {
    const match = urls.find((url) => returnTo.startsWith(url));
    if (match) return returnTo;
  }
  return urls[0] ?? null;
};

const backToApp = (returnTo: string, result: "connected" | "error") =>
  new Response(null, {
    status: 302,
    headers: {
      Location: `${returnTo.split("#")[0]}#/profile?google_calendar=${result}`,
    },
  });

/** Google sends the browser back here with the code (no CRM session). */
const handleCallback = async (url: URL) => {
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  if (!state) return createErrorResponse(400, "Missing state");

  const { data: pending } = await supabaseAdmin
    .from("google_oauth_states")
    .delete()
    .eq("state", state)
    .select("sales_id, return_to, created_at")
    .maybeSingle();
  if (!pending) return createErrorResponse(400, "Unknown or used state");

  const returnTo = safeReturnTo(pending.return_to);
  if (!returnTo) return createErrorResponse(500, "APP_URLS is not set");
  const ageMinutes =
    (Date.now() - new Date(pending.created_at).getTime()) / 60000;
  if (!code || ageMinutes > STATE_TTL_MINUTES) {
    return backToApp(returnTo, "error");
  }

  try {
    const tokens = await exchangeCode(code);
    if (!tokens.refresh_token) {
      console.error("Google returned no refresh token");
      return backToApp(returnTo, "error");
    }
    const { error } = await supabaseAdmin
      .from("google_calendar_connections")
      .upsert({
        sales_id: pending.sales_id,
        refresh_token: tokens.refresh_token,
        google_email: tokens.email,
        calendar_id: "primary",
        connected_at: new Date().toISOString(),
      });
    if (error) throw error;
  } catch (error) {
    console.error("Google Calendar connection failed", error);
    return backToApp(returnTo, "error");
  }

  // Existing tasks with a date go to the calendar right away
  const { data: tasks } = await supabaseAdmin
    .from("tasks")
    .select("id")
    .eq("sales_id", pending.sales_id)
    .is("done_date", null)
    .not("due_date", "is", null)
    .gte("due_date", new Date(Date.now() - 7 * 86400000).toISOString());
  for (const task of tasks ?? []) {
    await syncTask(task.id).catch((error) =>
      console.error("Initial task sync failed", task.id, error),
    );
  }

  return backToApp(returnTo, "connected");
};

const handleAction = async (req: Request, salesId: number) => {
  const body = await req.json().catch(() => ({}));
  const action = body?.action;

  if (action === "connect") {
    if (!isGoogleConfigured()) {
      return createErrorResponse(503, "Google Calendar is not configured");
    }
    const returnTo = safeReturnTo(body.return_to);
    if (!returnTo) return createErrorResponse(500, "APP_URLS is not set");
    const { data, error } = await supabaseAdmin
      .from("google_oauth_states")
      .insert({ sales_id: salesId, return_to: returnTo })
      .select("state")
      .single();
    if (error) throw error;
    const params = new URLSearchParams({
      client_id: Deno.env.get("GOOGLE_CLIENT_ID") ?? "",
      redirect_uri: getRedirectUri(),
      response_type: "code",
      scope: GOOGLE_SCOPES.join(" "),
      access_type: "offline",
      prompt: "consent",
      include_granted_scopes: "true",
      state: data.state,
    });
    return json({
      url: `https://accounts.google.com/o/oauth2/v2/auth?${params}`,
    });
  }

  if (action === "disconnect") {
    const connection = await getConnection(salesId);
    if (connection) {
      await revokeToken(connection.refresh_token);
      await supabaseAdmin
        .from("google_calendar_connections")
        .delete()
        .eq("sales_id", salesId);
    }
    return json({ connected: false });
  }

  const taskId = Number(body?.task_id);
  if (action === "sync" && Number.isInteger(taskId)) {
    return json({ result: await syncTask(taskId) });
  }
  if (action === "delete" && Number.isInteger(taskId)) {
    return json({ result: await deleteTaskEvent(taskId) });
  }

  return createErrorResponse(400, "Unknown action");
};

Deno.serve(async (req: Request) => {
  if (req.method === "GET") {
    try {
      return await handleCallback(new URL(req.url));
    } catch (error) {
      console.error("Google Calendar callback failed", error);
      return createErrorResponse(500, "Internal Server Error");
    }
  }

  return OptionsMiddleware(req, async (req) =>
    AuthMiddleware(req, async (req) =>
      UserMiddleware(req, async (req, user) => {
        const sale = await getUserSale(user!);
        if (!sale) return createErrorResponse(401, "Unauthorized");
        if (req.method !== "POST") {
          return createErrorResponse(405, "Method Not Allowed");
        }
        try {
          return await handleAction(req, sale.id);
        } catch (error) {
          console.error("Google Calendar action failed", error);
          return createErrorResponse(500, "Internal Server Error");
        }
      }),
    ),
  );
});
