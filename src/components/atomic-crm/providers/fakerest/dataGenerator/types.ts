import type {
  Company,
  Contact,
  ContactNote,
  Contract,
  Deal,
  DealNote,
  DealTagAssignment,
  Notification,
  Sale,
  SubcommissionPayment,
  Tag,
  Task,
} from "../../../types";
import type { ConfigurationContextValue } from "../../../root/ConfigurationContext";

export interface Db {
  companies: Company[];
  contacts: Contact[];
  contact_notes: ContactNote[];
  deals: Deal[];
  deal_notes: DealNote[];
  deal_tag_assignments: DealTagAssignment[];
  contracts: Contract[];
  subcommission_payments: SubcommissionPayment[];
  notifications: Notification[];
  sales: Sale[];
  tags: Tag[];
  tasks: Task[];
  configuration: Array<{ id: number; config: ConfigurationContextValue }>;
}
