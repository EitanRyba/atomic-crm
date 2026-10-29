import type { Identifier, RaRecord } from "ra-core";
import type { ComponentType } from "react";

import type {
  COMPANY_CREATED,
  CONTACT_CREATED,
  CONTACT_NOTE_CREATED,
  DEAL_CREATED,
  DEAL_NOTE_CREATED,
} from "./consts";

export type SignUpData = {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
};

export type SalesFormData = {
  avatar?: string;
  email: string;
  secondary_emails?: string[];
  password?: string;
  first_name: string;
  last_name: string;
  administrator: boolean;
  disabled: boolean;
};

export type Sale = {
  first_name: string;
  last_name: string;
  administrator: boolean;
  avatar?: RAFile;
  disabled?: boolean;
  user_id: string;

  /**
   * This is a copy of the user's email, to make it easier to handle by react admin
   * DO NOT UPDATE this field directly, it should be updated by the backend
   */
  email: string;

  secondary_emails?: string[];

  /**
   * This is used by the fake rest provider to store the password
   * DO NOT USE this field in your code besides the fake rest provider
   * @deprecated
   */
  password?: string;
} & Pick<RaRecord, "id">;

export type Company = {
  name: string;
  logo: RAFile;
  sector: string;
  size: 1 | 10 | 50 | 250 | 500;
  linkedin_url: string;
  website: string;
  phone_number: string;
  address: string;
  zipcode: string;
  city: string;
  state_abbr: string;
  sales_id?: Identifier;
  created_at: string;
  description: string;
  revenue: string;
  tax_identifier: string;
  country: string;
  context_links?: string[];
  continent?: string | null;
  network?: string | null;
  headcount?: number | null;
  headcount_source?: string | null;
  current_competitor?: string | null;
  /** Client company: Humand is selling to it */
  is_client?: boolean;
  /** Referral company: it introduces client companies */
  is_referral?: boolean;
  /** The "Por definir" system company, holding contacts with no known company */
  is_placeholder?: boolean;
  /** Referral company that introduced this client company */
  referred_by_company_id?: Identifier | null;
  nb_contacts?: number;
  nb_deals?: number;
  /** Name of the referral company, from companies_summary */
  referred_by_name?: string | null;
  /** Number of client companies this referral company introduced */
  nb_referred_clients?: number;
} & Pick<RaRecord, "id">;

/**
 * What happens to the contacts of a deleted company: they move to the
 * "Por definir" company, or they are deleted with it.
 */
export type DeleteCompanyContactsMode = "move" | "delete";

export type EmailAndType = {
  email: string;
  type: "Work" | "Home" | "Other";
};

export type PhoneNumberAndType = {
  number: string;
  type: "Work" | "Home" | "Other";
};

export type Contact = {
  first_name: string;
  last_name: string;
  title: string;
  company_id?: Identifier | null;
  email_jsonb: EmailAndType[];
  avatar?: Partial<RAFile>;
  linkedin_url?: string | null;
  first_seen: string;
  last_seen: string;
  has_newsletter: boolean;
  tags: number[];
  gender: string;
  sales_id?: Identifier;
  status: string;
  background: string;
  phone_jsonb: PhoneNumberAndType[];
  buyer_role?: string | null;
  nb_tasks?: number;
  company_name?: string;
  /** Whether the contact is in the "Por definir" company, from contacts_summary */
  company_is_placeholder?: boolean;
  company_is_client?: boolean;
  company_is_referral?: boolean;
} & Pick<RaRecord, "id">;

export type ContactNote = {
  contact_id: Identifier;
  text: string;
  date: string;
  sales_id: Identifier;
  status: string;
  attachments?: AttachmentNote[];
} & Pick<RaRecord, "id">;

export type Deal = {
  name: string;
  company_id: Identifier;
  contact_ids: Identifier[];
  category: string;
  stage: string;
  description: string;
  amount: number;
  created_at: string;
  updated_at: string;
  archived_at?: string;
  expected_closing_date: string;
  sales_id: Identifier;
  index: number;
  lost_reason?: string | null;
  lost_reason_detail?: string | null;
  lost_at?: string | null;
  postponed_until?: string | null;
  postponed_reason?: string | null;
  postponed_at?: string | null;
} & Pick<RaRecord, "id">;

// A tag ("post-it") applied to a deal while it sits in a stage. Removed tags
// stay in the table (removed_at set) as the deal history.
export type DealTagAssignment = {
  deal_id: Identifier;
  stage: string;
  tag_value: string;
  description?: string | null;
  sales_id?: Identifier | null;
  created_at: string;
  updated_at?: string | null;
  updated_by?: Identifier | null;
  removed_at?: string | null;
  removed_reason?: "stage_change" | "manual" | null;
} & Pick<RaRecord, "id">;

// Humand contracts. Months are "YYYY-MM" in the rules; contract months are
// counted from the client's first payment (month 1).
export interface FeeChange {
  from_month: string;
  amount: number;
}

export interface CommissionRule {
  from_month: number;
  to_month?: number | null;
  percent: number;
}

export type SubcommissionKind = "percent" | "fixed";

export interface SubcommissionRule {
  kind: SubcommissionKind;
  // a % of the commission, or a fixed USD amount per month
  value: number;
  from_month: number;
  to_month?: number | null;
}

export type Contract = {
  company_id: Identifier;
  deal_id?: Identifier | null;
  referral_company_id?: Identifier | null;
  // "YYYY-MM-01": the month of the client's first payment
  first_payment_month?: string | null;
  // "YYYY-MM-01": the last month billed, once the contract ended
  end_month?: string | null;
  fee_history: FeeChange[];
  commission_rules: CommissionRule[];
  subcommission_rules: SubcommissionRule[];
  notes?: string | null;
  sales_id?: Identifier | null;
  created_at: string;
  updated_at: string;
} & Pick<RaRecord, "id">;

// In-app notification (the bell), written by the daily / weekly digest
export type Notification = {
  sales_id: Identifier;
  kind: string;
  title: string;
  body?: string | null;
  // in-app path, e.g. "/deals/12/show"
  link?: string | null;
  created_at: string;
  read_at?: string | null;
} & Pick<RaRecord, "id">;

export type SubcommissionPaymentStatus = "pending" | "paid";

export type SubcommissionPayment = {
  contract_id: Identifier;
  // "YYYY-MM-01"
  month: string;
  status: SubcommissionPaymentStatus;
  amount?: number | null;
  paid_at?: string | null;
} & Pick<RaRecord, "id">;

export type DealNote = {
  deal_id: Identifier;
  text: string;
  date: string;
  sales_id: Identifier;
  attachments?: AttachmentNote[];

  // This is defined for compatibility with `ContactNote`
  status?: undefined;
} & Pick<RaRecord, "id">;

export type Tag = {
  id: number;
  name: string;
  color: string;
};

export type Task = {
  contact_id: Identifier;
  type: string;
  text: string;
  due_date: string;
  done_date?: string | null;
  sales_id?: Identifier;
  // written by the Google Calendar sync only
  google_event_id?: string | null;
} & Pick<RaRecord, "id">;

export type ActivityCompanyCreated = {
  type: typeof COMPANY_CREATED;
  company_id: Identifier;
  company: Company;
  sales_id: Identifier;
  date: string;
} & Pick<RaRecord, "id">;

export type ActivityContactCreated = {
  type: typeof CONTACT_CREATED;
  company_id: Identifier;
  sales_id?: Identifier;
  contact: Contact;
  date: string;
} & Pick<RaRecord, "id">;

export type ActivityContactNoteCreated = {
  type: typeof CONTACT_NOTE_CREATED;
  sales_id?: Identifier;
  contactNote: ContactNote;
  date: string;
} & Pick<RaRecord, "id">;

export type ActivityDealCreated = {
  type: typeof DEAL_CREATED;
  company_id: Identifier;
  sales_id?: Identifier;
  deal: Deal;
  date: string;
};

export type ActivityDealNoteCreated = {
  type: typeof DEAL_NOTE_CREATED;
  sales_id?: Identifier;
  dealNote: DealNote;
  date: string;
};

export type Activity = RaRecord &
  (
    | ActivityCompanyCreated
    | ActivityContactCreated
    | ActivityContactNoteCreated
    | ActivityDealCreated
    | ActivityDealNoteCreated
  );

export interface RAFile {
  src: string;
  title: string;
  path?: string;
  rawFile: File;
  type?: string;
}

export type AttachmentNote = RAFile;

export interface LabeledValue {
  value: string;
  label: string;
}

export interface DealStage extends LabeledValue {
  // Definition shown in the Kanban column header
  description?: string;
  // Equivalent stage in Humand's own sales methodology
  humandStage?: string;
}

export interface DealStageTag extends LabeledValue {
  stage: string;
  color: string;
}

export interface NoteStatus extends LabeledValue {
  color: string;
}

export interface ContactGender {
  value: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
}
