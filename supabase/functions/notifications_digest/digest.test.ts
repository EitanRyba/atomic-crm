// @vitest-environment node
import { describe, expect, it } from "vitest";
import {
  addDays,
  dayBounds,
  digestHtml,
  digestText,
  endOfWeek,
  formatDay,
  localDate,
  unpaidSubcommissionMonths,
} from "./digest";

describe("Buenos Aires dates", () => {
  it("reads the local day of a moment, not the UTC one", () => {
    // 01:30 UTC on Oct 29 is still Oct 28 in Buenos Aires (UTC-3)
    expect(localDate(new Date("2026-10-29T01:30:00Z"))).toBe("2026-10-28");
  });

  it("bounds a local day in UTC", () => {
    expect(dayBounds("2026-10-28")).toEqual({
      start: "2026-10-28T03:00:00.000Z",
      end: "2026-10-29T02:59:59.999Z",
    });
  });

  it("ends the week on Sunday, and a Sunday ends its own week", () => {
    expect(endOfWeek("2026-10-26")).toBe("2026-11-01"); // Monday
    expect(endOfWeek("2026-11-01")).toBe("2026-11-01"); // Sunday
    expect(addDays("2026-12-31", 1)).toBe("2027-01-01");
    expect(formatDay("2026-10-28")).toBe("28/10/2026");
  });
});

describe("unpaidSubcommissionMonths", () => {
  const contract = {
    id: 1,
    company_id: 1,
    first_payment_month: "2026-06-01",
    end_month: null,
    subcommission_rules: [{ from_month: 1, to_month: 3 }],
  };

  it("lists the past months owing a sub-commission that are not paid", () => {
    expect(
      unpaidSubcommissionMonths(contract, new Set(["2026-07"]), "2026-10"),
    ).toEqual(["2026-06", "2026-08"]);
  });

  it("ignores the current month and the months the rules do not cover", () => {
    expect(
      unpaidSubcommissionMonths(
        {
          ...contract,
          subcommission_rules: [{ from_month: 5, to_month: null }],
        },
        new Set(),
        "2026-10",
      ),
    ).toEqual([]);
  });

  it("owes nothing without rules or before the first payment", () => {
    expect(
      unpaidSubcommissionMonths(
        { ...contract, subcommission_rules: [] },
        new Set(),
        "2026-10",
      ),
    ).toEqual([]);
    expect(
      unpaidSubcommissionMonths(
        { ...contract, first_payment_month: null },
        new Set(),
        "2026-10",
      ),
    ).toEqual([]);
  });
});

describe("digest rendering", () => {
  const sections = [
    { title: "Tareas de hoy", lines: ["10:00 · Llamar <Acme>"] },
  ];

  it("lists each section as bullets in the text version", () => {
    expect(digestText(sections)).toBe("Tareas de hoy\n• 10:00 · Llamar <Acme>");
  });

  it("escapes what users typed in the email", () => {
    const html = digestHtml({
      greeting: "Hola Eitan,",
      sections,
      appUrl: "https://crm.example/",
      openLabel: "Abrir",
      footer: "Pie",
    });
    expect(html).toContain("Llamar &lt;Acme&gt;");
    expect(html).not.toContain("<Acme>");
  });
});
