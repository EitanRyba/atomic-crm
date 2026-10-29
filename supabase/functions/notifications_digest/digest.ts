// Pure helpers of the notifications digest (no I/O), shared with the tests.

// Argentina has no daylight saving time
export const TIME_ZONE = "America/Argentina/Buenos_Aires";
const UTC_OFFSET = "-03:00";

// Tags meaning "the next meeting is not scheduled yet"
export const PENDING_MEETING_TAGS = [
  "second-meeting-pending",
  "third-meeting-pending",
];
export const STALE_TAG_DAYS = 7;
// Past months checked for unpaid sub-commissions
export const SUBCOMMISSION_LOOKBACK_MONTHS = 12;

/** "YYYY-MM-DD" of a moment, in Buenos Aires. */
export const localDate = (moment: Date): string =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone: TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(moment);

/** First and last instants of a local day, as ISO timestamps. */
export const dayBounds = (date: string) => ({
  start: new Date(`${date}T00:00:00${UTC_OFFSET}`).toISOString(),
  end: new Date(`${date}T23:59:59.999${UTC_OFFSET}`).toISOString(),
});

/** The local date `days` after another one. */
export const addDays = (date: string, days: number): string => {
  const moment = new Date(`${date}T12:00:00${UTC_OFFSET}`);
  moment.setUTCDate(moment.getUTCDate() + days);
  return localDate(moment);
};

/** Sunday closing the week (Monday to Sunday) of a local date. */
export const endOfWeek = (date: string): string => {
  const weekday = new Date(`${date}T12:00:00${UTC_OFFSET}`).getUTCDay();
  return addDays(date, weekday === 0 ? 0 : 7 - weekday);
};

/** "28/10/2026" from "2026-10-28". */
export const formatDay = (date: string): string =>
  `${date.slice(8, 10)}/${date.slice(5, 7)}/${date.slice(0, 4)}`;

/** "28/10 15:30" of a timestamp, in Buenos Aires. */
export const formatDueDate = (timestamp: string): string => {
  const parts = new Intl.DateTimeFormat("es-AR", {
    timeZone: TIME_ZONE,
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(new Date(timestamp));
  const part = (type: string) =>
    parts.find((item) => item.type === type)?.value ?? "";
  return `${part("day")}/${part("month")} ${part("hour")}:${part("minute")}`;
};

type MonthRule = { from_month: number; to_month?: number | null };

export type ContractForDigest = {
  id: number;
  company_id: number;
  first_payment_month: string | null;
  end_month: string | null;
  subcommission_rules: MonthRule[] | null;
};

const monthNumber = (month: string) =>
  Number(month.slice(0, 4)) * 12 + Number(month.slice(5, 7)) - 1;

const fromMonthNumber = (value: number) =>
  `${Math.floor(value / 12)}-${String((value % 12) + 1).padStart(2, "0")}`;

/**
 * Past months ("YYYY-MM") of a contract that owe a sub-commission and are not
 * marked paid, within the lookback window before the current month.
 */
export const unpaidSubcommissionMonths = (
  contract: ContractForDigest,
  paidMonths: Set<string>,
  currentMonth: string,
): string[] => {
  const firstPayment = contract.first_payment_month?.slice(0, 7);
  const rules = contract.subcommission_rules ?? [];
  if (!firstPayment || !rules.length) return [];
  const end = contract.end_month?.slice(0, 7);
  const last = Math.min(
    monthNumber(currentMonth) - 1,
    end ? monthNumber(end) : Infinity,
  );
  const first = Math.max(
    monthNumber(firstPayment),
    monthNumber(currentMonth) - SUBCOMMISSION_LOOKBACK_MONTHS,
  );
  const months: string[] = [];
  for (let value = first; value <= last; value++) {
    const contractMonth = value - monthNumber(firstPayment) + 1;
    const owes = rules.some(
      (rule) =>
        contractMonth >= Number(rule.from_month) &&
        (rule.to_month == null || contractMonth <= Number(rule.to_month)),
    );
    const month = fromMonthNumber(value);
    if (owes && !paidMonths.has(month)) months.push(month);
  }
  return months;
};

export type DigestSection = { title: string; lines: string[] };

const escapeHtml = (text: string) =>
  text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

/** Plain text version of a digest (also the notification body). */
export const digestText = (sections: DigestSection[]): string =>
  sections
    .map(
      (section) =>
        `${section.title}\n${section.lines.map((line) => `• ${line}`).join("\n")}`,
    )
    .join("\n\n");

/** HTML email of a digest; every dynamic value is escaped. */
export const digestHtml = (options: {
  greeting: string;
  sections: DigestSection[];
  appUrl?: string;
  openLabel: string;
  footer: string;
}): string => {
  const sections = options.sections
    .map(
      (section) =>
        `<h3 style="margin:20px 0 6px;font-size:15px">${escapeHtml(section.title)}</h3><ul style="margin:0;padding-left:20px">${section.lines
          .map((line) => `<li style="margin:3px 0">${escapeHtml(line)}</li>`)
          .join("")}</ul>`,
    )
    .join("");
  const button = options.appUrl
    ? `<p style="margin:24px 0"><a href="${escapeHtml(options.appUrl)}" style="background:#111;color:#fff;padding:10px 16px;border-radius:6px;text-decoration:none">${escapeHtml(options.openLabel)}</a></p>`
    : "";
  return `<div style="font-family:Arial,sans-serif;font-size:14px;color:#222;max-width:560px"><p>${escapeHtml(options.greeting)}</p>${sections}${button}<p style="color:#888;font-size:12px">${escapeHtml(options.footer)}</p></div>`;
};
