import { useQuery } from "@tanstack/react-query";
import { useCallback } from "react";
import { z } from "zod/v4";
import { i18nStringSchema } from "../../i18n/i18n-string";
import { createMemoryStore } from "../../store/memory-store";
import supabase from "../supabase";

//------------------------------------------------------------------------------
// Spell
//------------------------------------------------------------------------------

export const spellSchema = z.object({
  id: z.string(),

  campaign_id: z.string(),

  level: z.number(),

  character_classes: z.array(z.string()),
  school: z.string(),

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
  update: i18nStringSchema.optional(),
});

export type Spell = z.infer<typeof spellSchema>;

//------------------------------------------------------------------------------
// Spell Filters
//------------------------------------------------------------------------------

export type SpellFilters = {
  character_classes?: Record<string, boolean>;
  levels?: Record<number, boolean>;
  schools?: Record<string, boolean>;

  concentration?: boolean;
  ritual?: boolean;

  material?: boolean;
  somatic?: boolean;
  verbal?: boolean;
};

//------------------------------------------------------------------------------
// Fetch Campaign Spells
//------------------------------------------------------------------------------

export async function fetchCampaignSpells(
  campaignId: string,
  filters: SpellFilters,
  langs: string[]
): Promise<Spell[]> {
  const { data } = await supabase.rpc("fetch_spells", {
    p_campaign_id: campaignId,
    p_filters: filters,
    p_langs: langs,
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

export function useCampaignSpells(
  campaignId: string,
  filters: SpellFilters,
  langs: string[]
) {
  const fetchCampaignsSpells = useCallback(
    () => fetchCampaignSpells(campaignId, filters, langs),
    [campaignId, filters, langs]
  );

  return useQuery<Spell[]>({
    queryFn: fetchCampaignsSpells,
    queryKey: ["spells", campaignId, filters, langs],

    refetchOnWindowFocus: false,

    gcTime: 30 * 24 * 60 * 60 * 1000,
    staleTime: Infinity,
  });
}

//------------------------------------------------------------------------------
// Use Selected Campaign Spell
//------------------------------------------------------------------------------

export const { use: useSelectedCampaignSpellId } = createMemoryStore<
  string | undefined
>(undefined);
