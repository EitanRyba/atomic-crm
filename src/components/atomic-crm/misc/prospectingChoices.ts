import type { TranslateFunction } from "ra-core";

export interface ChoiceDefinition {
  id: string;
  name: string;
  /** Translation key; when set, it takes precedence over `name`. */
  translationKey?: string;
}

export const continentChoices: ChoiceDefinition[] = [
  {
    id: "america",
    name: "Americas",
    translationKey: "resources.companies.continents.america",
  },
  {
    id: "europe",
    name: "Europe",
    translationKey: "resources.companies.continents.europe",
  },
  {
    id: "asia",
    name: "Asia",
    translationKey: "resources.companies.continents.asia",
  },
  {
    id: "africa",
    name: "Africa",
    translationKey: "resources.companies.continents.africa",
  },
  {
    id: "oceania",
    name: "Oceania",
    translationKey: "resources.companies.continents.oceania",
  },
];

// Vendor names are proper nouns and are not translated.
export const competitorChoices: ChoiceDefinition[] = [
  { id: "buk", name: "Buk" },
  { id: "rankmi", name: "Rankmi" },
  { id: "runa", name: "Runa" },
  { id: "worky", name: "Worky" },
  { id: "workvivo", name: "Workvivo" },
  { id: "lumapps-beekeeper", name: "LumApps / Beekeeper" },
  { id: "staffbase", name: "Staffbase" },
  { id: "microsoft-viva", name: "Microsoft Viva" },
  { id: "factorial", name: "Factorial" },
  {
    id: "whatsapp-excel",
    name: "WhatsApp + bulletin board + Excel",
    translationKey: "resources.companies.competitors.whatsapp_excel",
  },
  {
    id: "none",
    name: "None",
    translationKey: "resources.companies.competitors.none",
  },
  {
    id: "other",
    name: "Other",
    translationKey: "resources.companies.competitors.other",
  },
];

export const buyerRoleChoices: ChoiceDefinition[] = [
  {
    id: "partner",
    name: "Partner",
    translationKey: "resources.contacts.inputs.buyer_roles.partner",
  },
  {
    id: "hr",
    name: "HR / People",
    translationKey: "resources.contacts.inputs.buyer_roles.hr",
  },
  {
    id: "internal-comms",
    name: "Internal communications",
    translationKey: "resources.contacts.inputs.buyer_roles.internal_comms",
  },
  {
    id: "it",
    name: "IT",
    translationKey: "resources.contacts.inputs.buyer_roles.it",
  },
  {
    id: "management",
    name: "Management",
    translationKey: "resources.contacts.inputs.buyer_roles.management",
  },
  {
    id: "other",
    name: "Other",
    translationKey: "resources.contacts.inputs.buyer_roles.other",
  },
];

export const translateChoices = (
  choices: ChoiceDefinition[],
  translate: TranslateFunction,
): { id: string; name: string }[] =>
  choices.map(({ id, name, translationKey }) => ({
    id,
    name: translationKey ? translate(translationKey, { _: name }) : name,
  }));

/** Label of a stored value, or the raw value when it is not a known choice. */
export const getChoiceLabel = (
  choices: ChoiceDefinition[],
  value: string | null | undefined,
  translate: TranslateFunction,
): string | null => {
  if (!value) return null;
  const choice = choices.find((c) => c.id === value);
  if (!choice) return value;
  return choice.translationKey
    ? translate(choice.translationKey, { _: choice.name })
    : choice.name;
};
