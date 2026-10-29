import type { Meta } from "@storybook/react-vite";

import { DEFAULT_USER } from "../providers/fakerest/authProvider";
import { NotificationsBell } from "./NotificationsBell";

import { StoryWrapper } from "@/test/StoryWrapper";

const meta = {
  title: "Atomic CRM/Layout/Notifications Bell",
} satisfies Meta;

export default meta;

export const WithNotifications = () => (
  <StoryWrapper
    data={{
      notifications: [
        {
          id: 1,
          sales_id: DEFAULT_USER.id,
          kind: "deal_resumed",
          title: '"Intranet" is back in Discovery',
          body: "It was postponed until 28/10/2026.",
          link: "/deals/1/show",
          created_at: "2026-10-29T11:31:00.000Z",
          read_at: null,
        },
        {
          id: 2,
          sales_id: DEFAULT_USER.id,
          kind: "digest_daily",
          title: "2 things to review",
          body: "Today's tasks\n• 10:00 · Call Acme",
          link: "/",
          created_at: "2026-10-29T11:31:00.000Z",
          read_at: null,
        },
        {
          id: 3,
          sales_id: DEFAULT_USER.id + 1,
          kind: "digest_daily",
          title: "Someone else's digest",
          created_at: "2026-10-29T11:31:00.000Z",
          read_at: null,
        },
      ],
    }}
  >
    <NotificationsBell />
  </StoryWrapper>
);
