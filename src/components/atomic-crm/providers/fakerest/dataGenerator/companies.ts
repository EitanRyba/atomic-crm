import {
  address,
  company,
  datatype,
  internet,
  lorem,
  phone,
  random,
} from "faker/locale/en_US";

import { randomDate } from "./utils";
import { PLACEHOLDER_COMPANY_NAME } from "../../../companies/placeholderCompany";
import { defaultCompanySectors } from "../../../root/defaultConfiguration";
import type { Company, RAFile } from "../../../types";
import type { Db } from "./types";

const sizes = [1, 10, 50, 250, 500];

const regex = /\W+/;

export const generateCompanies = (db: Db, size = 55): Required<Company>[] => {
  const companies: Required<Company>[] = Array.from(Array(size).keys()).map(
    (id) => {
      const name = company.companyName();
      // Every 6th company only introduces clients; the first one does both
      const is_referral = id % 6 === 1 || id === 0;
      const is_client = id === 0 || id % 6 !== 1;
      return {
        id,
        name: name,
        logo: {
          title: lorem.text(1),
          src: `https://marmelab.com/react-admin-crm/logos/${id}.png`,
        } as RAFile,
        sector: random.arrayElement(defaultCompanySectors).value,
        size: random.arrayElement(sizes) as 1 | 10 | 50 | 250 | 500,
        linkedin_url: `https://www.linkedin.com/company/${name
          .toLowerCase()
          .replace(regex, "_")}`,
        website: internet.url(),
        phone_number: phone.phoneNumber(),
        address: address.streetAddress(),
        zipcode: address.zipCode(),
        city: address.city(),
        state_abbr: address.stateAbbr(),
        nb_contacts: 0,
        nb_deals: 0,
        // at least 1/3rd of companies for Jane Doe
        sales_id:
          datatype.number(2) === 0 ? 0 : random.arrayElement(db.sales).id,
        created_at: randomDate().toISOString(),
        description: lorem.paragraph(),
        revenue: random.arrayElement(["$1M", "$10M", "$100M", "$1B"]),
        tax_identifier: random.alphaNumeric(10),
        country: random.arrayElement(["USA", "France", "UK"]),
        context_links: [],
        continent: null,
        network: null,
        headcount: null,
        headcount_source: null,
        current_competitor: null,
        is_client,
        is_referral,
        is_placeholder: false,
        referred_by_company_id: null,
        referred_by_name: null,
        nb_referred_clients: 0,
      };
    },
  );

  // A quarter of the clients were introduced by a referral company
  const referrals = companies.filter((company) => company.is_referral);
  companies
    .filter((company) => company.is_client && datatype.number(3) === 0)
    .forEach((client) => {
      const referrer = random.arrayElement(
        referrals.filter((referral) => referral.id !== client.id),
      );
      client.referred_by_company_id = referrer.id;
      client.referred_by_name = referrer.name;
      referrer.nb_referred_clients += 1;
    });

  companies.push(generatePlaceholderCompany(size));
  return companies;
};

/** The "Por definir" system company, holding the contacts of unknown company */
const generatePlaceholderCompany = (id: number): Required<Company> => ({
  id,
  name: PLACEHOLDER_COMPANY_NAME,
  logo: { title: PLACEHOLDER_COMPANY_NAME, src: "" } as RAFile,
  sector: "",
  size: 1,
  linkedin_url: "",
  website: "",
  phone_number: "",
  address: "",
  zipcode: "",
  city: "",
  state_abbr: "",
  nb_contacts: 0,
  nb_deals: 0,
  sales_id: null as unknown as Required<Company>["sales_id"],
  created_at: new Date("2020-01-01").toISOString(),
  description: "",
  revenue: "",
  tax_identifier: "",
  country: "",
  context_links: [],
  continent: null,
  network: null,
  headcount: null,
  headcount_source: null,
  current_competitor: null,
  is_client: false,
  is_referral: false,
  is_placeholder: true,
  referred_by_company_id: null,
  referred_by_name: null,
  nb_referred_clients: 0,
});
