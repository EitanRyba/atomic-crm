import {
  buildAttendeeCandidates,
  cleanupTaskAttendees,
  findNextMeeting,
} from "./meetingTasks";

const contact = (first_name: string, email?: string) => ({
  first_name,
  last_name: "Doe",
  email_jsonb: email ? [{ email, type: "Work" as const }] : [],
});

describe("buildAttendeeCandidates", () => {
  it("lists the company contacts, the referrer contacts, then the other users", () => {
    const candidates = buildAttendeeCandidates({
      companyContacts: [contact("Ana", "ana@client.example")],
      referrerContacts: [contact("Rita", "rita@referrer.example")],
      sales: [
        {
          id: 1,
          first_name: "Me",
          last_name: "Myself",
          email: "me@humand.example",
        },
        {
          id: 2,
          first_name: "Teo",
          last_name: "Team",
          email: "teo@humand.example",
        },
      ],
      currentSaleId: 1,
    });

    expect(candidates).toEqual([
      { email: "ana@client.example", name: "Ana Doe", group: "company" },
      { email: "rita@referrer.example", name: "Rita Doe", group: "referrer" },
      { email: "teo@humand.example", name: "Teo Team", group: "team" },
    ]);
  });

  it("skips people without an email, disabled users, and repeated emails", () => {
    const candidates = buildAttendeeCandidates({
      companyContacts: [
        contact("NoMail"),
        contact("Ana", "ana@client.example"),
        contact("Ana again", "ANA@client.example"),
      ],
      sales: [
        {
          id: 3,
          first_name: "Gone",
          last_name: "User",
          email: "gone@humand.example",
          disabled: true,
        },
      ],
    });

    expect(candidates.map((candidate) => candidate.email)).toEqual([
      "ana@client.example",
    ]);
  });
});

describe("cleanupTaskAttendees", () => {
  const attendees = [{ email: "ana@client.example", name: "Ana" }];

  it("keeps the guests of a demo or a meeting", () => {
    expect(cleanupTaskAttendees({ type: "demo", attendees }).attendees).toEqual(
      attendees,
    );
  });

  it("drops the guests of the other task types", () => {
    expect(cleanupTaskAttendees({ type: "call", attendees }).attendees).toEqual(
      [],
    );
  });
});

describe("findNextMeeting", () => {
  const now = new Date("2026-11-01T12:00:00Z");

  it("finds the earliest pending demo or meeting from now on", () => {
    const next = findNextMeeting(
      [
        { type: "meeting", due_date: "2026-11-10T15:00:00Z", done_date: null },
        { type: "demo", due_date: "2026-11-05T15:00:00Z", done_date: null },
        { type: "call", due_date: "2026-11-02T15:00:00Z", done_date: null },
        { type: "meeting", due_date: "2026-10-30T15:00:00Z", done_date: null },
        {
          type: "meeting",
          due_date: "2026-11-03T15:00:00Z",
          done_date: "2026-11-01T10:00:00Z",
        },
      ],
      now,
    );

    expect(next?.due_date).toBe("2026-11-05T15:00:00Z");
  });

  it("finds nothing when no meeting is scheduled", () => {
    expect(
      findNextMeeting(
        [{ type: "call", due_date: "2026-11-02T15:00:00Z", done_date: null }],
        now,
      ),
    ).toBeUndefined();
  });
});
