import { describe, expect, it } from "vitest";

import { parseCompanyCategories } from "./companyCategories";

const client = { is_client: true, is_referral: false };
const referral = { is_client: false, is_referral: true };
const both = { is_client: true, is_referral: true };

describe("parseCompanyCategories", () => {
  it.each([
    ["cliente", client],
    ["referido", referral],
    ["cliente, referido", both],
    ["Referido,Cliente", both],
    ["CLIENT", client],
    ["referral", referral],
    ["client, referral", both],
    ["  Cliente  ", client],
  ])("reads %j", (category, expected) => {
    expect(parseCompanyCategories(category, null)).toEqual(expected);
  });

  it("makes a company with no category a client company", () => {
    expect(parseCompanyCategories(null, "A retail chain")).toEqual(client);
    expect(parseCompanyCategories("", null)).toEqual(client);
  });

  it("makes a MULTIPLICADORA company with no category a referral company", () => {
    expect(
      parseCompanyCategories(null, "MULTIPLICADORA - network of accountants"),
    ).toEqual(referral);
    expect(parseCompanyCategories("", "  Multiplicadora regional")).toEqual(
      referral,
    );
  });

  it("only applies the MULTIPLICADORA rule when the category is missing", () => {
    expect(parseCompanyCategories("cliente", "MULTIPLICADORA")).toEqual(client);
  });

  it("falls back to the description rule for an unknown category", () => {
    expect(parseCompanyCategories("partner", "MULTIPLICADORA")).toEqual(
      referral,
    );
    expect(parseCompanyCategories("partner", null)).toEqual(client);
  });
});
