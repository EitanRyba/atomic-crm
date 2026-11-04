import { parseCompanySites } from "../dataImport/companySites";
import {
  cleanupCompanySites,
  formatSiteLocation,
  getCompanySites,
  sitesFromAddress,
} from "./companySites";

describe("sitesFromAddress", () => {
  it("turns the old address into a single main site", () => {
    expect(
      sitesFromAddress({
        country: " Argentina ",
        address: "Av. Corrientes 1234",
        city: "Buenos Aires",
        state_abbr: "CABA",
      }),
    ).toEqual([
      {
        name: "Sede principal",
        country: "Argentina",
        address: "Av. Corrientes 1234",
        city: "Buenos Aires",
        state: "CABA",
      },
    ]);
  });

  it("keeps only the filled parts of the address", () => {
    expect(sitesFromAddress({ city: "Rosario", address: "  " })).toEqual([
      { name: "Sede principal", city: "Rosario" },
    ]);
  });

  it("gives no site to a company without an address", () => {
    expect(sitesFromAddress({ country: "", address: undefined })).toEqual([]);
  });
});

describe("getCompanySites", () => {
  it("prefers the saved sites over the old address", () => {
    const sites = [{ name: "Casa central", city: "Córdoba" }];
    expect(getCompanySites({ sites, city: "Rosario" })).toEqual(sites);
  });

  it("falls back on the old address when no site is saved", () => {
    expect(getCompanySites({ sites: [], city: "Rosario" })).toEqual([
      { name: "Sede principal", city: "Rosario" },
    ]);
  });
});

describe("cleanupCompanySites", () => {
  it("drops the sites left empty and trims the others", () => {
    expect(
      cleanupCompanySites({
        sites: [
          { name: " Planta ", city: "Pilar " },
          { name: "", country: " ", address: null },
        ],
      }).sites,
    ).toEqual([{ name: "Planta", city: "Pilar" }]);
  });
});

describe("formatSiteLocation", () => {
  it("joins the address, city and state that are filled", () => {
    expect(
      formatSiteLocation({ address: "Calle 1", city: "", state: "Mendoza" }),
    ).toBe("Calle 1, Mendoza");
  });
});

describe("parseCompanySites (CSV import)", () => {
  it("reads back the sites column of a company export", () => {
    expect(
      parseCompanySites({
        sites: JSON.stringify([
          { name: "Casa central", country: "Chile", city: "Santiago" },
        ]),
        city: "ignored",
      }),
    ).toEqual([{ name: "Casa central", country: "Chile", city: "Santiago" }]);
  });

  it("builds the main site from the address columns otherwise", () => {
    expect(
      parseCompanySites({ sites: "not json", city: "Lima", country: "Perú" }),
    ).toEqual([{ name: "Sede principal", country: "Perú", city: "Lima" }]);
  });
});
