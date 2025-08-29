import { useQuery } from "@tanstack/react-query";
import { useCallback } from "react";
import { z } from "zod";
import { useI18nLang } from "../i18n/i18n-lang";
import { i18nStringSchema } from "../i18n/i18n-string";
import { createLocalStore } from "../store/local-store";
import { createMemoryStore } from "../store/memory-store";
import supabase from "../supabase";
import { characterClassSchema } from "./character-class";
import { spellLevelSchema } from "./spell-level";
import { spellSchoolSchema } from "./spell-school";

//------------------------------------------------------------------------------
// Spell
//------------------------------------------------------------------------------

export const spellSchema = z.object({
  id: z.uuid(),

  campaign_id: z.string(),

  level: spellLevelSchema,

  character_classes: z.array(characterClassSchema),
  school: spellSchoolSchema,

  casting_time: z.string(),
  duration: z.string(),
  range_imp: z.string(),
  range_met: z.string(),

  concentration: z.boolean(),
  ritual: z.boolean(),

  material: z.boolean(),
  somatic: z.boolean(),
  verbal: z.boolean(),

  description: i18nStringSchema,
  materials: i18nStringSchema.optional(),
  name: i18nStringSchema,
  page: i18nStringSchema.optional(),
  upgrade: i18nStringSchema.optional(),
});

export type Spell = z.infer<typeof spellSchema>;

//------------------------------------------------------------------------------
// Spell Filters
//------------------------------------------------------------------------------

export const spellFiltersSchema = z.object({
  order_by: z.enum(["level", "name"]).default("name"),
  order_dir: z.enum(["asc", "desc"]).default("asc"),

  character_classes: z
    .partialRecord(characterClassSchema, z.boolean().optional())
    .optional(),
  levels: z.partialRecord(z.number(), z.boolean().optional()).optional(),
  schools: z.partialRecord(z.string(), z.boolean().optional()).optional(),

  concentration: z.boolean().optional(),
  ritual: z.boolean().optional(),

  material: z.boolean().optional(),
  somatic: z.boolean().optional(),
  verbal: z.boolean().optional(),
});

export type SpellFilters = z.infer<typeof spellFiltersSchema>;

//------------------------------------------------------------------------------
// Use Spell Filters
//------------------------------------------------------------------------------

const spellFiltersStore = createLocalStore(
  "resources.spells.filters",
  spellFiltersSchema.parse({}),
  spellFiltersSchema.parse
);

export function useSpellFilters(): [
  SpellFilters,
  (partial: Partial<SpellFilters>) => void
] {
  const [filters, setFilters] = spellFiltersStore.use();

  const updateFilter = useCallback(
    (partial: Partial<SpellFilters>) =>
      setFilters((prev) => ({ ...prev, ...partial })),
    [setFilters]
  );

  return [filters, updateFilter];
}

//------------------------------------------------------------------------------
// Use Spell Name Filter
//------------------------------------------------------------------------------

const spellNameFilterStore = createLocalStore(
  "resources.spells.filters.name",
  "",
  z.string().parse
);

export const useSpellNameFilter = spellNameFilterStore.use;

//------------------------------------------------------------------------------
// Fetch Campaign Spells
//------------------------------------------------------------------------------

export async function fetchCampaignSpells(
  campaignId: string,
  { order_by, order_dir, ...filters }: SpellFilters,
  lang: string
): Promise<Spell[]> {
  const { data } = await supabase.rpc("fetch_spells", {
    p_campaign_id: campaignId,
    p_filters: filters,
    p_langs: [lang],
    p_order_by: order_by,
    p_order_dir: order_dir,
  });
  try {
    return z.array(spellSchema).parse(data);
  } catch (e) {
    console.error(e);
    return [];
  }
}

//------------------------------------------------------------------------------
// Use Campaign Spells
//------------------------------------------------------------------------------

export function useCampaignSpells(campaignId: string) {
  const [lang] = useI18nLang();
  const [filters] = useSpellFilters();

  const fetchCampaignsSpells = useCallback(
    () => fetchCampaignSpells(campaignId, filters, lang),
    [campaignId, filters, lang]
  );

  return useQuery<Spell[]>({
    queryFn: fetchCampaignsSpells,
    queryKey: ["spells", campaignId, filters, lang],
  });
}

//------------------------------------------------------------------------------
// Use Selected Campaign Spell
//------------------------------------------------------------------------------

export const { use: useSelectedCampaignSpellId } = createMemoryStore<
  string | undefined
>(undefined);
