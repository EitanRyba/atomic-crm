import { Globe, Linkedin, Phone } from "lucide-react";
import { Link } from "react-router";
import {
  useGetIdentity,
  useLocaleState,
  useRecordContext,
  useTranslate,
} from "ra-core";
import { EditButton } from "@/components/admin/edit-button";
import { ShowButton } from "@/components/admin/show-button";
import { TextField } from "@/components/admin/text-field";
import { UrlField } from "@/components/admin/url-field";

import { formatLocalizedDate } from "../misc/RelativeDate";
import { AsideSection } from "../misc/AsideSection";
import { useConfigurationContext } from "../root/ConfigurationContext";
import type { Company } from "../types";
import { formatSiteLocation, getCompanySites } from "./companySites";
import { CompanyDeleteButton } from "./CompanyDeleteButton";
import { useGetSalesName } from "../sales/useGetSalesName";
import { competitorChoices, getChoiceLabel } from "../misc/prospectingChoices";

interface CompanyAsideProps {
  link?: string;
}

export const CompanyAside = ({ link = "edit" }: CompanyAsideProps) => {
  const record = useRecordContext<Company>();
  const translate = useTranslate();
  if (!record) return null;

  return (
    <div className="hidden sm:block w-92 min-w-92 space-y-4">
      <div className="flex flex-row space-x-1">
        {link === "edit" ? (
          // The "Por definir" system company cannot be edited
          record.is_placeholder ? null : (
            <EditButton label={translate("resources.companies.action.edit")} />
          )
        ) : (
          <ShowButton label={translate("resources.companies.action.show")} />
        )}
      </div>

      <CompanyInfo record={record} />

      <ProspectingInfo record={record} />

      <SitesInfo record={record} />

      <ContextInfo record={record} />

      <AdditionalInfo record={record} />

      {link !== "edit" && !record.is_placeholder && (
        <div className="mt-6 pt-6 border-t hidden sm:flex flex-col gap-2 items-start">
          <CompanyDeleteButton
            className="h-6 cursor-pointer hover:bg-destructive/10! text-destructive! border-destructive! focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40"
            size="sm"
          />
        </div>
      )}
    </div>
  );
};

export const CompanyInfo = ({ record }: { record: Company }) => {
  const translate = useTranslate();
  if (!record.website && !record.linkedin_url && !record.phone_number) {
    return null;
  }

  return (
    <AsideSection
      title={translate("resources.companies.field_categories.contact")}
    >
      {record.website && (
        <div className="flex flex-row items-center gap-1 min-h-[24px]">
          <Globe className="w-4 h-4" />
          <UrlField
            source="website"
            target="_blank"
            rel="noopener"
            content={record.website
              .replace("http://", "")
              .replace("https://", "")}
          />
        </div>
      )}
      {record.linkedin_url && (
        <div className="flex flex-row items-center gap-1 min-h-[24px]">
          <Linkedin className="w-4 h-4" />
          <a
            className="underline hover:no-underline"
            href={record.linkedin_url}
            target="_blank"
            rel="noopener noreferrer"
            title={record.linkedin_url}
          >
            LinkedIn
          </a>
        </div>
      )}
      {record.phone_number && (
        <div className="flex flex-row items-center gap-1 min-h-[24px]">
          <Phone className="w-4 h-4" />
          <TextField source="phone_number" />
        </div>
      )}
    </AsideSection>
  );
};

// Size, revenue and tax identifier are not edited anymore: only the sector
export const ContextInfo = ({ record }: { record: Company }) => {
  const { companySectors } = useConfigurationContext();
  const translate = useTranslate();
  const sector = companySectors.find((s) => s.value === record.sector);
  const sectorLabel = sector?.label;
  if (!sectorLabel) return null;

  return (
    <AsideSection
      title={translate("resources.companies.field_categories.context")}
    >
      <span>
        {translate("resources.companies.fields.sector")}: {sectorLabel}
      </span>
    </AsideSection>
  );
};

export const ProspectingInfo = ({ record }: { record: Company }) => {
  const translate = useTranslate();
  const [locale = "en"] = useLocaleState();
  const competitorLabel = getChoiceLabel(
    competitorChoices,
    record.current_competitor,
    translate,
  );
  const hasHeadcount =
    record.headcount !== null && record.headcount !== undefined;
  const categories = [
    record.is_client && translate("resources.companies.categories.client"),
    record.is_referral && translate("resources.companies.categories.referral"),
  ].filter(Boolean);
  const isReferredClient =
    record.is_client && record.referred_by_company_id != null;
  if (
    !categories.length &&
    !isReferredClient &&
    !record.network &&
    !hasHeadcount &&
    !competitorLabel
  ) {
    return null;
  }

  const field = (key: string) => translate(`resources.companies.fields.${key}`);

  return (
    <AsideSection
      title={translate("resources.companies.field_categories.prospecting")}
    >
      {categories.length > 0 && (
        <span>
          {translate("resources.companies.field_categories.categories")}:{" "}
          {categories.join(" · ")}
        </span>
      )}
      {isReferredClient && (
        <span>
          {field("referred_by_company_id")}:{" "}
          <Link
            to={`/companies/${record.referred_by_company_id}/show`}
            className="underline hover:no-underline"
          >
            {record.referred_by_name ?? `#${record.referred_by_company_id}`}
          </Link>
        </span>
      )}
      {record.network && (
        <span>
          {field("network")}: {record.network}
        </span>
      )}
      {hasHeadcount && (
        <span>
          {field("headcount")}:{" "}
          {new Intl.NumberFormat(locale).format(record.headcount as number)}
        </span>
      )}
      {competitorLabel && (
        <span>
          {field("current_competitor")}: {competitorLabel}
        </span>
      )}
    </AsideSection>
  );
};

/** The company sites, or its old address shown as a single site. */
export const SitesInfo = ({ record }: { record: Company }) => {
  const translate = useTranslate();
  const sites = getCompanySites(record);
  if (!sites.length) return null;

  return (
    <AsideSection
      title={translate("resources.companies.field_categories.sites")}
    >
      {sites.map((site, index) => {
        const location = formatSiteLocation(site);
        return (
          <div key={index} className="flex flex-col">
            {site.name ? (
              <span className="font-medium">{site.name}</span>
            ) : null}
            {site.country ? <span>{site.country}</span> : null}
            {location ? (
              <span className="text-muted-foreground">{location}</span>
            ) : null}
          </div>
        );
      })}
    </AsideSection>
  );
};

export const AdditionalInfo = ({ record }: { record: Company }) => {
  const translate = useTranslate();
  const [locale = "en"] = useLocaleState();
  const { identity } = useGetIdentity();
  const isCurrentUser = record.sales_id === identity?.id;
  const salesName = useGetSalesName(record.sales_id, {
    enabled: !isCurrentUser,
  });
  if (
    !record.created_at &&
    !record.sales_id &&
    !record.description &&
    !record.context_links
  ) {
    return null;
  }
  const getBaseURL = (url: string) => {
    const urlObject = new URL(url.startsWith("http") ? url : `https://${url}`);
    return urlObject.hostname;
  };

  return (
    <AsideSection
      title={translate("resources.companies.field_categories.additional_info")}
    >
      {record.description && (
        <p className="text-sm  mb-1">{record.description}</p>
      )}
      {record.context_links && (
        <div className="flex flex-col">
          {record.context_links.map((link, index) =>
            link ? (
              <a
                key={index}
                className="text-sm underline hover:no-underline mb-1"
                href={link.startsWith("http") ? link : `https://${link}`}
                target="_blank"
                rel="noopener noreferrer"
                title={link}
              >
                {getBaseURL(link)}
              </a>
            ) : null,
          )}
        </div>
      )}
      {record.sales_id !== null && (
        <div className="inline-flex text-sm text-muted-foreground mb-1">
          {translate(
            isCurrentUser
              ? "resources.companies.followed_by_you"
              : "resources.companies.followed_by",
            { name: salesName },
          )}
        </div>
      )}
      {record.created_at && (
        <p className="text-sm text-muted-foreground mb-1">
          {translate("resources.companies.added_on", {
            date: formatLocalizedDate(record.created_at, locale),
          })}{" "}
        </p>
      )}
    </AsideSection>
  );
};
