// @vitest-environment node
import { describe, expect, it } from "vitest";
import {
  buildEvent,
  eventAttendees,
  extractMeetUrl,
  sendUpdatesFor,
  type CalendarTask,
} from "./calendarEvent";

const task = (overrides: Partial<CalendarTask> = {}): CalendarTask => ({
  id: 1,
  text: "Demo de la plataforma",
  type: "demo",
  due_date: "2026-11-10T15:00:00.000Z",
  done_date: null,
  contact_id: null,
  deal_id: 12,
  attendees: [
    { email: "ana@client.example", name: "Ana" },
    { email: "teo@humand.example", name: "Teo" },
  ],
  meet_url: null,
  meeting_title: null,
  contacts: null,
  deals: { name: "Rollout", companies: { name: "Acme" } },
  ...overrides,
});

const options = { appUrl: "https://crm.example", requestId: "req-1" };

describe("buildEvent", () => {
  it("invites the guests of a demo and asks for a Meet link", () => {
    const event = buildEvent(task(), options);

    expect(event).toMatchObject({
      // what the guests see: "<type> - <company>" and the task text
      summary: "Demo - Acme",
      description: "Demo de la plataforma",
      start: { dateTime: "2026-11-10T15:00:00.000Z" },
      end: { dateTime: "2026-11-10T15:30:00.000Z" },
      attendees: [
        { email: "ana@client.example", displayName: "Ana" },
        { email: "teo@humand.example", displayName: "Teo" },
      ],
      conferenceData: {
        createRequest: {
          requestId: "req-1",
          conferenceSolutionKey: { type: "hangoutsMeet" },
        },
      },
    });
  });

  it("titles a meeting with its meeting title", () => {
    const event = buildEvent(
      task({ type: "meeting", meeting_title: "Kickoff Acme", text: null }),
      options,
    );
    expect(event.summary).toBe("Kickoff Acme");
    expect(event.description).toBe("");
  });

  it("titles a meeting without a meeting title after its type and company", () => {
    expect(buildEvent(task({ type: "meeting" }), options).summary).toBe(
      "Reunión - Acme",
    );
  });

  it("keeps the task title and CRM link of the other task types", () => {
    const event = buildEvent(task({ type: "call" }), options);
    expect(event.summary).toBe("Demo de la plataforma — Rollout (Acme)");
    expect(event.description).toBe("https://crm.example/#/deals/12/show");
  });

  it("does not ask again for a Meet link the meeting already has", () => {
    const event = buildEvent(
      task({ type: "meeting", meet_url: "https://meet.google.com/abc" }),
      options,
    );
    expect(event).not.toHaveProperty("conferenceData");
  });

  it("gives no guests to the other task types", () => {
    const event = buildEvent(task({ type: "call" }), options);
    expect(event.attendees).toEqual([]);
    expect(event).not.toHaveProperty("conferenceData");
  });

  it("removes the conference of a task that stopped being a meeting", () => {
    const event = buildEvent(
      task({ type: "call", meet_url: "https://meet.google.com/abc" }),
      options,
    );
    expect(event.conferenceData).toBeNull();
  });

  it("links older tasks to their contact", () => {
    const event = buildEvent(
      task({
        type: "call",
        deal_id: null,
        deals: null,
        contact_id: 4,
        contacts: {
          first_name: "Ada",
          last_name: "Lovelace",
          companies: { name: "Acme" },
        },
      }),
      options,
    );
    expect(event.summary).toBe("Demo de la plataforma — Ada Lovelace (Acme)");
    expect(event.description).toBe("https://crm.example/#/contacts/4/show");
  });
});

describe("eventAttendees", () => {
  it("keeps each valid email once", () => {
    expect(
      eventAttendees({
        attendees: [
          { email: "ana@client.example", name: "Ana" },
          { email: "ANA@client.example", name: "Ana bis" },
          { email: "not-an-email", name: "Nope" },
        ],
      }),
    ).toEqual([{ email: "ana@client.example", displayName: "Ana" }]);
  });
});

describe("sendUpdatesFor", () => {
  it("emails the guests of a pending meeting", () => {
    expect(sendUpdatesFor(task())).toBe("all");
  });

  it("changes done tasks and plain tasks silently", () => {
    expect(sendUpdatesFor(task({ done_date: "2026-11-10T16:00:00Z" }))).toBe(
      "none",
    );
    expect(sendUpdatesFor(task({ type: "call" }))).toBe("none");
  });

  it("tells the guests when a meeting becomes another kind of task", () => {
    expect(
      sendUpdatesFor(
        task({ type: "call", meet_url: "https://meet.google.com/abc" }),
      ),
    ).toBe("all");
  });
});

describe("extractMeetUrl", () => {
  it("reads the Meet link of the event", () => {
    expect(
      extractMeetUrl({ hangoutLink: "https://meet.google.com/abc-defg-hij" }),
    ).toBe("https://meet.google.com/abc-defg-hij");
    expect(
      extractMeetUrl({
        conferenceData: {
          entryPoints: [
            { entryPointType: "phone", uri: "tel:+1" },
            { entryPointType: "video", uri: "https://meet.google.com/xyz" },
          ],
        },
      }),
    ).toBe("https://meet.google.com/xyz");
  });

  it("finds nothing in an event without a conference", () => {
    expect(extractMeetUrl({ id: "evt" })).toBeNull();
    expect(extractMeetUrl(null)).toBeNull();
  });
});
