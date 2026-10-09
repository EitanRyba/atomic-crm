import generateData from ".";

describe("demo data company categories", () => {
  const db = generateData();
  const placeholders = db.companies.filter((company) => company.is_placeholder);
  const companiesById = new Map(
    db.companies.map((company) => [company.id, company]),
  );

  it("has exactly one «Por definir» company, with no category", () => {
    expect(placeholders).toHaveLength(1);
    expect(placeholders[0]).toMatchObject({
      name: "Por definir",
      is_client: false,
      is_referral: false,
    });
  });

  it("gives every other company at least one category", () => {
    const others = db.companies.filter((company) => !company.is_placeholder);
    expect(
      others.every((company) => company.is_client || company.is_referral),
    ).toBe(true);
    expect(others.some((company) => company.is_referral)).toBe(true);
    expect(
      others.some((company) => company.is_client && company.is_referral),
    ).toBe(true);
  });

  it("refers clients only by referral companies other than themselves", () => {
    const referred = db.companies.filter(
      (company) => company.referred_by_company_id != null,
    );
    expect(referred.length).toBeGreaterThan(0);
    for (const client of referred) {
      const referrer = companiesById.get(client.referred_by_company_id!);
      expect(client.is_client).toBe(true);
      expect(referrer?.is_referral).toBe(true);
      expect(referrer?.id).not.toBe(client.id);
      expect(client.referred_by_name).toBe(referrer?.name);
    }
  });

  it("puts every contact in a company, some in «Por definir»", () => {
    expect(db.contacts.every((contact) => contact.company_id != null)).toBe(
      true,
    );
    const inPlaceholder = db.contacts.filter(
      (contact) => contact.company_id === placeholders[0].id,
    );
    expect(inPlaceholder.length).toBeGreaterThan(0);
    expect(
      inPlaceholder.every((contact) => contact.company_is_placeholder),
    ).toBe(true);
    expect(placeholders[0].nb_contacts).toBe(inPlaceholder.length);
  });

  it("sells deals to client companies only", () => {
    expect(
      db.deals.every((deal) => {
        const company = companiesById.get(deal.company_id);
        return company?.is_client && !company.is_placeholder;
      }),
    ).toBe(true);
  });
});
