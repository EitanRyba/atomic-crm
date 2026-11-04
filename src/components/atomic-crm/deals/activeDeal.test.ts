import type { DataProvider } from "ra-core";

import {
  companyHasOtherActiveDeal,
  isActiveDealConflictError,
} from "./activeDeal";

const dataProviderWithDeals = (deals: { id: number }[]) =>
  ({
    getList: async () => ({ data: deals, total: deals.length }),
  }) as unknown as DataProvider;

describe("companyHasOtherActiveDeal", () => {
  it("finds the active deal of the company", async () => {
    expect(
      await companyHasOtherActiveDeal(dataProviderWithDeals([{ id: 5 }]), 1),
    ).toBe(true);
  });

  it("ignores the deal being edited", async () => {
    expect(
      await companyHasOtherActiveDeal(dataProviderWithDeals([{ id: 5 }]), 1, 5),
    ).toBe(false);
  });

  it("accepts a company without an active deal", async () => {
    expect(await companyHasOtherActiveDeal(dataProviderWithDeals([]), 1)).toBe(
      false,
    );
  });
});

describe("isActiveDealConflictError", () => {
  it("recognizes the one-active-deal-per-company index", () => {
    expect(
      isActiveDealConflictError(
        new Error(
          'duplicate key value violates unique constraint "deals_company_id_active_unique_idx"',
        ),
      ),
    ).toBe(true);
  });

  it("does not mistake other errors for it", () => {
    expect(isActiveDealConflictError(new Error("network down"))).toBe(false);
    expect(isActiveDealConflictError(null)).toBe(false);
  });
});
