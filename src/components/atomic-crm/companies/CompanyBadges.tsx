import { useTranslate } from "ra-core";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

import type { Company } from "../types";

export const warningBadgeClassName =
  "border-amber-300 bg-amber-50 text-amber-800 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-200";

/**
 * The categories of a company ("Cliente", "Referido"), and a warning when it
 * has no contact yet. The "Por definir" system company has neither.
 */
export const CompanyBadges = ({
  record,
  className,
}: {
  record: Company;
  className?: string;
}) => {
  const translate = useTranslate();

  if (record.is_placeholder) {
    return (
      <div className={cn("flex flex-wrap gap-1", className)}>
        <Badge variant="outline">
          {translate("resources.companies.placeholder.name")}
        </Badge>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-wrap gap-1", className)}>
      {record.is_client ? (
        <Badge variant="secondary">
          {translate("resources.companies.categories.client")}
        </Badge>
      ) : null}
      {record.is_referral ? (
        <Badge variant="secondary">
          {translate("resources.companies.categories.referral")}
        </Badge>
      ) : null}
      {record.nb_contacts === 0 ? (
        <Badge variant="outline" className={warningBadgeClassName}>
          {translate("resources.companies.no_contact_defined")}
        </Badge>
      ) : null}
    </div>
  );
};
