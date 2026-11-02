import type { Meta } from "@storybook/react-vite";
import type { ReactNode } from "react";
import { useState } from "react";
import { TaskCreateSheet } from "./TaskCreateSheet";
import { StoryWrapper, buildCompany, buildDeal } from "@/test/StoryWrapper";
const meta = {
  title: "Atomic CRM/Tasks/TaskCreateSheet",
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta;

export default meta;

const defaultData = {
  companies: [
    buildCompany({ id: 1, name: "Acme" }),
    buildCompany({ id: 2, name: "Globex" }),
  ],
  deals: [
    buildDeal({ id: 1, name: "Acme rollout", company_id: 1 }),
    buildDeal({ id: 2, name: "Globex pilot", company_id: 2 }),
  ],
};
export const Mobile = ({
  children,
  data = defaultData,
}: {
  children?: ReactNode;
  data?: any;
}) => {
  const [open, setOpen] = useState(true);
  return (
    <StoryWrapper data={data}>
      <TaskCreateSheet open={open} onOpenChange={setOpen} />
      {children}
    </StoryWrapper>
  );
};
Mobile.globals = {
  viewport: { value: "mobile1", isRotated: false },
};
