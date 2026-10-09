import { ClipboardList } from "lucide-react";
import { useGetList, useTranslate } from "ra-core";
import { Link } from "react-router";
import { Card } from "@/components/ui/card";

import { usePlaceholderCompany } from "../companies/placeholderCompany";
import type { Company, Contact } from "../types";

const MAX_ITEMS = 5;

const companiesWithoutContactsFilter = {
  nb_contacts: 0,
  "is_placeholder@neq": true,
};
const contactsWithoutCompanyFilter = { company_is_placeholder: true };

const listUrl = (resource: string, filter: object) =>
  `/${resource}?filter=${encodeURIComponent(JSON.stringify(filter))}`;

/**
 * What the team still has to complete: companies with no contact yet, and
 * contacts waiting in "Por definir" for their real company. Hidden when there
 * is nothing pending.
 */
export const PendingItems = () => {
  const translate = useTranslate();
  const { placeholderCompany } = usePlaceholderCompany();
  const { data: companies = [], total: companiesTotal = 0 } =
    useGetList<Company>("companies", {
      filter: companiesWithoutContactsFilter,
      pagination: { page: 1, perPage: MAX_ITEMS },
      sort: { field: "name", order: "ASC" },
    });
  const { data: contacts = [], total: contactsTotal = 0 } = useGetList<Contact>(
    "contacts",
    {
      filter: contactsWithoutCompanyFilter,
      pagination: { page: 1, perPage: MAX_ITEMS },
      sort: { field: "last_seen", order: "DESC" },
    },
  );

  if (!companiesTotal && !contactsTotal) return null;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center">
        <div className="mr-3 flex">
          <ClipboardList className="text-muted-foreground w-6 h-6" />
        </div>
        <h2 className="text-xl font-semibold text-muted-foreground">
          {translate("crm.dashboard.pending.title")}
        </h2>
      </div>
      <Card className="gap-4 p-4">
        {companiesTotal ? (
          <PendingGroup
            title={translate(
              "crm.dashboard.pending.companies_without_contacts",
            )}
            total={companiesTotal}
            seeAllUrl={listUrl("companies", companiesWithoutContactsFilter)}
            items={companies.map((company) => ({
              id: company.id,
              label: company.name,
              url: `/companies/${company.id}/show`,
            }))}
          />
        ) : null}
        {contactsTotal ? (
          <PendingGroup
            title={translate("crm.dashboard.pending.contacts_without_company")}
            total={contactsTotal}
            titleUrl={
              placeholderCompany
                ? `/companies/${placeholderCompany.id}/show`
                : undefined
            }
            seeAllUrl={listUrl("contacts", contactsWithoutCompanyFilter)}
            items={contacts.map((contact) => ({
              id: contact.id,
              label: `${contact.first_name ?? ""} ${contact.last_name ?? ""}`,
              url: `/contacts/${contact.id}/show`,
            }))}
          />
        ) : null}
      </Card>
    </div>
  );
};

const PendingGroup = ({
  title,
  titleUrl,
  total,
  seeAllUrl,
  items,
}: {
  title: string;
  titleUrl?: string;
  total: number;
  seeAllUrl: string;
  items: { id: string | number; label: string; url: string }[];
}) => {
  const translate = useTranslate();
  return (
    <div className="flex flex-col gap-1 text-sm">
      <div className="flex items-center justify-between gap-2">
        {titleUrl ? (
          <Link to={titleUrl} className="font-medium hover:underline">
            {title}
          </Link>
        ) : (
          <span className="font-medium">{title}</span>
        )}
        <span className="rounded-md bg-amber-100 px-2 text-xs font-semibold text-amber-800 dark:bg-amber-950 dark:text-amber-200">
          {total}
        </span>
      </div>
      <ul className="flex flex-col">
        {items.map((item) => (
          <li key={item.id}>
            <Link
              to={item.url}
              className="block truncate rounded px-1 py-0.5 hover:bg-muted"
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
      {total > items.length ? (
        <Link
          to={seeAllUrl}
          className="text-xs text-muted-foreground underline hover:no-underline"
        >
          {translate("crm.dashboard.pending.see_all")}
        </Link>
      ) : null}
    </div>
  );
};
