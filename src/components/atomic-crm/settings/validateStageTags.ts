import { toSlug } from "@/lib/toSlug";

export type StageTagItem = {
  stage?: string;
  value?: string;
  label?: string;
  color?: string;
};

/**
 * Rejects a tag without stage or name, and two tags with the same name in the
 * same stage. Returns the translation key of the error, or undefined.
 */
export const validateStageTags = (
  tags: StageTagItem[] | undefined,
): string | undefined => {
  if (!tags) return undefined;
  const seen = new Set<string>();
  for (const tag of tags) {
    if (!tag.stage || !tag.label?.trim()) {
      return "crm.settings.deals.stage_tags_incomplete";
    }
    const key = `${tag.stage}/${tag.value || toSlug(tag.label)}`;
    if (seen.has(key)) return "crm.settings.deals.stage_tags_duplicate";
    seen.add(key);
  }
  return undefined;
};
