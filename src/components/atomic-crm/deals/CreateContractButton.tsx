import { FileSignature } from "lucide-react";
import { CanAccess, useGetList, useTranslate } from "ra-core";
import { Link } from "react-router";
import { Button } from "@/components/ui/button";

import type { Contract, Deal } from "../types";
import { WON_STAGE } from "./dealOutcome";

/**
 * On a won deal, opens its contract, or offers to create it with the client
 * company and the deal already filled in. Admins only.
 */
export const CreateContractButton = ({ deal }: { deal: Deal }) =>
  deal.stage === WON_STAGE ? (
    <CanAccess resource="contracts" action="create">
      <ContractLink deal={deal} />
    </CanAccess>
  ) : null;

const ContractLink = ({ deal }: { deal: Deal }) => {
  const translate = useTranslate();
  const { data: contracts, isPending } = useGetList<Contract>("contracts", {
    filter: { deal_id: deal.id },
    pagination: { page: 1, perPage: 1 },
  });
  if (isPending) return null;

  const contract = contracts?.[0];
  const to = contract
    ? `/contracts/${contract.id}`
    : `/contracts/create?source=${encodeURIComponent(
        JSON.stringify({ company_id: deal.company_id, deal_id: deal.id }),
      )}`;

  return (
    <Button asChild size="sm" variant="outline" className="h-9 gap-2">
      <Link to={to}>
        <FileSignature className="size-4" />
        {translate(
          contract
            ? "resources.contracts.action.open"
            : "resources.contracts.action.create_from_deal",
        )}
      </Link>
    </Button>
  );
};
