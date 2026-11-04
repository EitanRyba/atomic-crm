import {
  buildAttendeeCandidates,
  cleanupTaskMeetingFields,
  defaultMeetingTitle,
  findNextMeeting,
} from "./meetingTasks";

const contact = (first_name: string, ...emails: string[]) => ({
  first_name,
  last_name: "Doe",
  email_jsonb: emails.map((email) => ({ email, type: "Work" as const })),
});

describe("buildAttendeeCandidates", () => {
  it("lists the company, deal and referrer contacts, then the other users", () => {
    const candidates = buildAttendeeCandidates({
      companyContacts: [contact("Ana", "ana@client.example")],
      dealContacts: [contact("Dan", "dan@consultant.example")],
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
      { email: "dan@consultant.example", name: "Dan Doe", group: "deal" },
      { email: "rita@referrer.example", name: "Rita Doe", group: "referrer" },
      { email: "teo@humand.example", name: "Teo Team", group: "team" },
    ]);
  });

  it("offers every email of a contact, each once", () => {
    const candidates = buildAttendeeCandidates({
      companyContacts: [
        contact("Ana", "ana@client.example", "ana.personal@mail.example"),
      ],
      // a deal contact of the company is listed once
      dealContacts: [contact("Ana", "ANA@client.example")],
    });

    expect(candidates).toEqual([
      { email: "ana@client.example", name: "Ana Doe", group: "company" },
      { email: "ana.personal@mail.example", name: "Ana Doe", group: "company" },
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

describe("cleanupTaskMeetingFields", () => {
  const attendees = [{ email: "ana@client.example", name: "Ana" }];

  it("keeps the guests of a demo or a meeting", () => {
    expect(
      cleanupTaskMeetingFields({ type: "demo", attendees }).attendees,
    ).toEqual(attendees);
  });

  it("keeps the title of a meeting, trimmed", () => {
    expect(
      cleanupTaskMeetingFields({ type: "meeting", meeting_title: " Kickoff " })
        .meeting_title,
    ).toBe("Kickoff");
  });

  it("drops the title of the other task types", () => {
    expect(
      cleanupTaskMeetingFields({ type: "call", meeting_title: "Kickoff" })
        .meeting_title,
    ).toBeNull();
  });

  it("drops the guests of the other task types", () => {
    expect(
      cleanupTaskMeetingFields({ type: "call", attendees }).attendees,
    ).toEqual([]);
  });
});

describe("defaultMeetingTitle", () => {
  it("joins the task type and the company", () => {
    expect(defaultMeetingTitle("Demo", "McDonalds")).toBe("Demo - McDonalds");
  });

  it("uses the type alone when the company is unknown", () => {
    expect(defaultMeetingTitle("Reunión", undefined)).toBe("Reunión");
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
