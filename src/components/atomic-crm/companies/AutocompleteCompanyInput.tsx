import { useMemo, type ReactNode } from "react";
import {
  ChoicesContextProvider,
  type ChoicesContextValue,
  useChoicesContext,
  useCreate,
  useGetIdentity,
  useNotify,
} from "ra-core";
import { AutocompleteInput } from "@/components/admin/autocomplete-input";
import type { InputProps } from "ra-core";
import { useIsMobile } from "@/hooks/use-mobile";
import type { PopoverProps } from "@radix-ui/react-popover";

import type { Company } from "../types";
import {
  isPlaceholderCompanyName,
  normalizeCompanyName,
  usePlaceholderCompany,
} from "./placeholderCompany";

export const AutocompleteCompanyInput = ({
  validate,
  label,
  modal,
  placeholderFirst = false,
}: Pick<InputProps, "validate" | "label"> &
  Pick<PopoverProps, "modal"> & {
    /**
     * Offer the "Por definir" company first, for the contacts whose company
     * is not known yet.
     */
    placeholderFirst?: boolean;
  }) => {
  const [create] = useCreate();
  const { identity } = useGetIdentity();
  const notify = useNotify();
  const handleCreateCompany = async (name?: string) => {
    if (!name) return;
    if (isPlaceholderCompanyName(name)) {
      // The system company exists already and cannot be created twice
      notify("resources.companies.autocomplete.create_error", {
        type: "error",
        messageArgs: {
          _: "An error occurred while creating the company",
        },
      });
      return;
    }
    try {
      // Companies created on the fly are the clients Humand sells to
      const newCompany = await create(
        "companies",
        {
          data: {
            name,
            is_client: true,
            is_referral: false,
            sales_id: identity?.id,
            created_at: new Date().toISOString(),
          },
        },
        { returnPromise: true },
      );
      return newCompany;
    } catch {
      notify("resources.companies.autocomplete.create_error", {
        type: "error",
        messageArgs: {
          _: "An error occurred while creating the company",
        },
      });
    }
  };
  const isMobile = useIsMobile();

  const input = (
    <AutocompleteInput
      label={label}
      optionText="name"
      helperText={false}
      onCreate={handleCreateCompany}
      createItemLabel="resources.companies.autocomplete.create_item"
      createLabel="resources.companies.autocomplete.create_label"
      validate={validate}
      modal={modal ?? isMobile}
    />
  );

  return placeholderFirst ? (
    <PlaceholderFirstChoices>{input}</PlaceholderFirstChoices>
  ) : (
    input
  );
};

/**
 * Puts the "Por definir" company at the top of the choices of the enclosing
 * ReferenceInput, whatever the page of companies it fetched, unless the user
 * searches for another name.
 */
const PlaceholderFirstChoices = ({ children }: { children: ReactNode }) => {
  const choicesContext = useChoicesContext<Company>();
  const { placeholderCompany } = usePlaceholderCompany();
  const searchText = String(choicesContext.filterValues?.q ?? "");

  const value = useMemo((): ChoicesContextValue => {
    const { allChoices } = choicesContext;
    if (!placeholderCompany || !allChoices) return choicesContext;
    const others = allChoices.filter(
      (choice) => choice.id !== placeholderCompany.id,
    );
    const isListed = others.length < allChoices.length;
    const matchesSearch = normalizeCompanyName(
      placeholderCompany.name,
    ).includes(normalizeCompanyName(searchText));
    if (!isListed && !matchesSearch) return choicesContext;
    return {
      ...choicesContext,
      allChoices: [placeholderCompany, ...others],
    } as ChoicesContextValue;
  }, [choicesContext, placeholderCompany, searchText]);

  return (
    <ChoicesContextProvider value={value}>{children}</ChoicesContextProvider>
  );
};
