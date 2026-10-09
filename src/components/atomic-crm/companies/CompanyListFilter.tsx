import { Building, Handshake, Tags, Truck, UserX, Users } from "lucide-react";
import {
  FilterLiveForm,
  useGetIdentity,
  useGetList,
  useTranslate,
} from "ra-core";
import { ToggleFilterButton } from "@/components/admin/toggle-filter-button";
import { SearchInput } from "@/components/admin/search-input";

import { FilterCategory } from "../filters/FilterCategory";
import { useConfigurationContext } from "../root/ConfigurationContext";
import { AccountManagerFilter } from "../sales/AccountManagerInput";
import type { Company } from "../types";
import { getTranslatedCompanySizeLabel } from "./getTranslatedCompanySizeLabel";
import { sizes } from "./sizes";

export const CompanyListFilter = () => {
  const { identity } = useGetIdentity();
  const { companySectors } = useConfigurationContext();
  const translate = useTranslate();
  const translatedSizes = sizes.map((size) => ({
    ...size,
    name: getTranslatedCompanySizeLabel(size, translate),
  }));
  // Only the referral companies that did introduce clients are worth a filter
  const { data: referrals } = useGetList<Company>("companies", {
    filter: { is_referral: true, "nb_referred_clients@gt": 0 },
    pagination: { page: 1, perPage: 20 },
    sort: { field: "name", order: "ASC" },
  });
  return (
    <div className="w-52 min-w-52 flex flex-col gap-8">
      <FilterLiveForm>
        <SearchInput source="q" />
      </FilterLiveForm>

      <FilterCategory
        icon={<Tags className="h-4 w-4" />}
        label="resources.companies.filters.category"
      >
        <ToggleFilterButton
          className="w-full justify-between"
          label="resources.companies.categories.client"
          value={{ is_client: true }}
        />
        <ToggleFilterButton
          className="w-full justify-between"
          label="resources.companies.categories.referral"
          value={{ is_referral: true }}
        />
        <ToggleFilterButton
          className="w-full justify-between"
          label="resources.companies.placeholder.filter"
          value={{ is_placeholder: true }}
        />
      </FilterCategory>

      {referrals?.length ? (
        <FilterCategory
          icon={<Handshake className="h-4 w-4" />}
          label="resources.companies.filters.referred_by"
        >
          {referrals.map((referral) => (
            <ToggleFilterButton
              className="w-full justify-between"
              key={referral.id}
              label={referral.name}
              value={{ referred_by_company_id: referral.id }}
            />
          ))}
        </FilterCategory>
      ) : null}

      <FilterCategory
        icon={<UserX className="h-4 w-4" />}
        label="resources.companies.filters.contacts"
      >
        <ToggleFilterButton
          className="w-full justify-between"
          label="resources.companies.no_contact_defined"
          value={{ nb_contacts: 0 }}
        />
      </FilterCategory>

      <FilterCategory
        icon={<Building className="h-4 w-4" />}
        label="resources.companies.fields.size"
      >
        {translatedSizes.map((size) => (
          <ToggleFilterButton
            className="w-full justify-between"
            label={size.name}
            key={size.name}
            value={{ size: size.id }}
          />
        ))}
      </FilterCategory>

      <FilterCategory
        icon={<Truck className="h-4 w-4" />}
        label="resources.companies.fields.sector"
      >
        {companySectors.map((sector) => (
          <ToggleFilterButton
            className="w-full justify-between"
            label={sector.label}
            key={sector.value}
            value={{ sector: sector.value }}
          />
        ))}
      </FilterCategory>

      <FilterCategory
        icon={<Users className="h-4 w-4" />}
        label="resources.companies.fields.sales_id"
      >
        <ToggleFilterButton
          className="w-full justify-between"
          label={translate("crm.common.me")}
          value={{ sales_id: identity?.id }}
        />
        <AccountManagerFilter className="w-full justify-between" />
      </FilterCategory>
    </div>
  );
};
