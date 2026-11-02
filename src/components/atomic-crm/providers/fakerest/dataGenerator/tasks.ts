import { datatype, lorem, random } from "faker/locale/en_US";

import { defaultTaskTypes } from "../../../root/defaultConfiguration";
import type { Task } from "../../../types";
import type { Db } from "./types";
import { randomDate } from "./utils";

export const type: string[] = [
  "email",
  "email",
  "email",
  "email",
  "email",
  "email",
  "call",
  "call",
  "call",
  "call",
  "call",
  "call",
  "call",
  "call",
  "call",
  "call",
  "call",
  "demo",
  "meeting",
  "follow-up",
  "follow-up",
  "thank-you",
  "ship",
  "none",
];

export const generateTasks = (db: Db) => {
  if (!db.deals.length) return [];
  // Tasks belong to deals
  return Array.from(Array(400).keys()).map<Task>((id) => {
    const deal = random.arrayElement(db.deals);
    return {
      id,
      deal_id: deal.id,
      contact_id: null,
      type: random.arrayElement(defaultTaskTypes).value,
      text: lorem.sentence(),
      due_date: randomDate(
        datatype.boolean() ? new Date() : new Date(deal.created_at),
        new Date(Date.now() + 100 * 24 * 60 * 60 * 1000),
      ).toISOString(),
      done_date: undefined,
      sales_id: 0,
      attendees: [],
      meet_url: null,
      meeting_title: null,
    };
  });
};
