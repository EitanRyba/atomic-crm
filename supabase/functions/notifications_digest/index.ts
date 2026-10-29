import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { supabaseAdmin } from "../_shared/supabaseAdmin.ts";
import { createErrorResponse } from "../_shared/utils.ts";
import { getAppUrls, syncTask } from "../_shared/googleCalendar.ts";
import {
  PENDING_MEETING_TAGS,
  STALE_TAG_DAYS,
  addDays,
  dayBounds,
  digestHtml,
  digestText,
  endOfWeek,
  formatDay,
  formatDueDate,
  localDate,
  unpaidSubcommissionMonths,
  type ContractForDigest,
  type DigestSection,
} from "./digest.ts";
import { getMessages } from "./messages.ts";

// Called once a day by the scheduled GitHub workflow, with the CRON_SECRET
// secret in the x-cron-secret header. Body: {"kind": "daily" | "weekly"}.
// Every day it moves the postponed deals whose date has come back to
// Discovery; then each user gets their digest in the bell and by email
// (RESEND_API_KEY and, optionally, RESEND_FROM).

const DISCOVERY = "discovery";
const POSTPONED = "postponed";

type Sale = {
  id: number;
  first_name: string | null;
  email: string | null;
  administrator: boolean;
};

type Notification = {
  sales_id: number;
  kind: string;
  title: string;
  body?: string;
  link?: string;
};

const m = getMessages();

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });

/** Postponed deals whose date has come go back to Discovery. */
const resumePostponedDeals = async (today: string) => {
  const { data: deals, error } = await supabaseAdmin
    .from("deals")
    .select("id, name, sales_id, postponed_until")
    .eq("stage", POSTPONED)
    .lte("postponed_until", today)
    .is("archived_at", null);
  if (error) throw error;

  const notifications: Notification[] = [];
  for (const deal of deals ?? []) {
    // At the bottom of the Discovery column
    const { data: last } = await supabaseAdmin
      .from("deals")
      .select("index")
      .eq("stage", DISCOVERY)
      .order("index", { ascending: false, nullsFirst: false })
      .limit(1)
      .maybeSingle();
    const { error: updateError } = await supabaseAdmin
      .from("deals")
      .update({ stage: DISCOVERY, index: (last?.index ?? -1) + 1 })
      .eq("id", deal.id);
    if (updateError) {
      console.error("Could not resume deal", deal.id, updateError);
      continue;
    }
    if (deal.sales_id != null) {
      notifications.push({
        sales_id: deal.sales_id,
        kind: "deal_resumed",
        title: m.resumedTitle(deal.name),
        body: m.resumedBody(formatDay(deal.postponed_until)),
        link: `/deals/${deal.id}/show`,
      });
    }
  }
  return { resumed: deals ?? [], notifications };
};

type TaskRow = {
  id: number;
  text: string | null;
  due_date: string;
  sales_id: number | null;
  contacts: { first_name: string | null; last_name: string | null } | null;
};

const getOpenTasks = async (until: string): Promise<TaskRow[]> => {
  const { data, error } = await supabaseAdmin
    .from("tasks")
    .select("id, text, due_date, sales_id, contacts(first_name, last_name)")
    .is("done_date", null)
    .not("due_date", "is", null)
    .lte("due_date", until)
    .order("due_date", { ascending: true });
  if (error) throw error;
  // many-to-one embeds come back as objects
  return (data ?? []) as unknown as TaskRow[];
};

const taskLine = (task: TaskRow) => {
  const who = [task.contacts?.first_name, task.contacts?.last_name]
    .filter(Boolean)
    .join(" ");
  return `${formatDueDate(task.due_date)} · ${task.text ?? ""}${who ? ` (${who})` : ""}`;
};

/** Deals still waiting for a meeting to be scheduled after a week. */
const getStaleMeetingTags = async () => {
  const since = new Date(Date.now() - STALE_TAG_DAYS * 86400000).toISOString();
  const { data, error } = await supabaseAdmin
    .from("deal_tag_assignments")
    .select("deal_id, created_at, deals(name, sales_id, archived_at)")
    .is("removed_at", null)
    .in("tag_value", PENDING_MEETING_TAGS)
    .lte("created_at", since);
  if (error) throw error;
  return (data ?? []) as unknown as {
    deal_id: number;
    created_at: string;
    deals: {
      name: string;
      sales_id: number | null;
      archived_at: string | null;
    } | null;
  }[];
};

/** Unpaid sub-commission lines, for the administrators. */
const getUnpaidSubcommissions = async (currentMonth: string) => {
  const [{ data: contracts, error }, { data: paid, error: paidError }] =
    await Promise.all([
      supabaseAdmin
        .from("contracts")
        .select(
          "id, company_id, first_payment_month, end_month, subcommission_rules, companies!contracts_company_id_fkey(name)",
        ),
      supabaseAdmin
        .from("subcommission_payments")
        .select("contract_id, month")
        .eq("status", "paid"),
    ]);
  if (error) throw error;
  if (paidError) throw paidError;

  return (contracts ?? []).flatMap((contract) => {
    const paidMonths = new Set(
      (paid ?? [])
        .filter((payment) => payment.contract_id === contract.id)
        .map((payment) => String(payment.month).slice(0, 7)),
    );
    const months = unpaidSubcommissionMonths(
      contract as unknown as ContractForDigest,
      paidMonths,
      currentMonth,
    );
    if (!months.length) return [];
    const name =
      (contract as unknown as { companies: { name: string } | null }).companies
        ?.name ?? `#${contract.id}`;
    return [`${name}: ${m.months(months.length)} (${months.join(", ")})`];
  });
};

/** Tasks that never reached Google Calendar get another chance. */
const retryCalendarSync = async (since: string) => {
  const { data: connections } = await supabaseAdmin
    .from("google_calendar_connections")
    .select("sales_id");
  const salesIds = (connections ?? []).map((c) => c.sales_id);
  if (!salesIds.length) return 0;
  const { data: tasks } = await supabaseAdmin
    .from("tasks")
    .select("id")
    .in("sales_id", salesIds)
    .is("google_event_id", null)
    .is("done_date", null)
    .gte("due_date", since);
  let synced = 0;
  for (const task of tasks ?? []) {
    try {
      await syncTask(task.id);
      synced++;
    } catch (error) {
      console.error("Calendar retry failed", task.id, error);
    }
  }
  return synced;
};

const sendEmail = async (
  to: string,
  subject: string,
  html: string,
  text: string,
) => {
  const apiKey = Deno.env.get("RESEND_API_KEY");
  if (!apiKey) return false;
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: Deno.env.get("RESEND_FROM") ?? "Humand CRM <onboarding@resend.dev>",
      to: [to],
      subject,
      html,
      text,
    }),
  });
  if (!response.ok) {
    console.error("Resend error", response.status, await response.text());
    return false;
  }
  return true;
};

const runDigest = async (kind: "daily" | "weekly") => {
  const today = localDate(new Date());
  const { start: todayStart, end: todayEnd } = dayBounds(today);
  const until = kind === "weekly" ? dayBounds(endOfWeek(today)).end : todayEnd;
  const currentMonth = today.slice(0, 7);

  const { resumed, notifications } = await resumePostponedDeals(today);
  const [tasks, staleTags, unpaid, { data: sales, error: salesError }] =
    await Promise.all([
      getOpenTasks(until),
      kind === "weekly" ? getStaleMeetingTags() : Promise.resolve([]),
      kind === "weekly"
        ? getUnpaidSubcommissions(currentMonth)
        : Promise.resolve([]),
      supabaseAdmin
        .from("sales")
        .select("id, first_name, email, administrator")
        .eq("disabled", false),
    ]);
  if (salesError) throw salesError;

  const appUrl = getAppUrls()[0];
  let emails = 0;
  for (const sale of (sales ?? []) as Sale[]) {
    const own = tasks.filter((task) => task.sales_id === sale.id);
    const sections: DigestSection[] = [];
    const overdue = own.filter((task) => task.due_date < todayStart);
    const upcoming = own.filter((task) => task.due_date >= todayStart);
    if (overdue.length) {
      sections.push({ title: m.overdueTasks, lines: overdue.map(taskLine) });
    }
    if (upcoming.length) {
      sections.push({
        title: kind === "weekly" ? m.weekTasks : m.todayTasks,
        lines: upcoming.map(taskLine),
      });
    }
    const ownResumed = resumed.filter((deal) => deal.sales_id === sale.id);
    if (ownResumed.length) {
      sections.push({
        title: m.resumedDeals,
        lines: ownResumed.map((deal) => deal.name),
      });
    }
    const ownStale = staleTags.filter(
      (tag) => tag.deals?.sales_id === sale.id && !tag.deals?.archived_at,
    );
    if (ownStale.length) {
      sections.push({
        title: m.staleTags,
        lines: ownStale.map((tag) => tag.deals?.name ?? `#${tag.deal_id}`),
      });
    }
    if (sale.administrator && unpaid.length) {
      sections.push({ title: m.pendingSubcommissions, lines: unpaid });
    }
    if (!sections.length) continue;

    const count = sections.reduce((total, s) => total + s.lines.length, 0);
    const text = digestText(sections);
    notifications.push({
      sales_id: sale.id,
      kind: `digest_${kind}`,
      title: m.digestTitle(count),
      body: text,
      link: "/",
    });

    if (sale.email) {
      const sent = await sendEmail(
        sale.email,
        kind === "weekly" ? m.weeklySubject : m.dailySubject,
        digestHtml({
          greeting: m.greeting(sale.first_name ?? ""),
          sections,
          appUrl,
          openLabel: m.openCrm,
          footer: m.footer,
        }),
        `${m.greeting(sale.first_name ?? "")}\n\n${text}`,
      );
      if (sent) emails++;
    }
  }

  if (notifications.length) {
    const { error } = await supabaseAdmin
      .from("notifications")
      .insert(notifications);
    if (error) throw error;
  }

  const calendarRetried = await retryCalendarSync(
    dayBounds(addDays(today, -1)).start,
  );

  return {
    kind,
    today,
    resumed: resumed.length,
    notifications: notifications.length,
    emails,
    calendarRetried,
  };
};

Deno.serve(async (req: Request) => {
  const secret = Deno.env.get("CRON_SECRET");
  if (!secret || req.headers.get("x-cron-secret") !== secret) {
    return createErrorResponse(401, "Unauthorized");
  }
  if (req.method !== "POST")
    return createErrorResponse(405, "Method Not Allowed");

  const body = await req.json().catch(() => ({}));
  const kind = body?.kind === "weekly" ? "weekly" : "daily";
  try {
    return json(await runDigest(kind));
  } catch (error) {
    console.error("Digest failed", error);
    return createErrorResponse(500, "Internal Server Error");
  }
});
