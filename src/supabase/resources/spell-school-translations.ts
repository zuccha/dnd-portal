import { useQuery } from "@tanstack/react-query";
import { useCallback } from "react";
import { z } from "zod/v4";
import type { I18nString } from "../../i18n/i18n-string";
import supabase from "../supabase";

//------------------------------------------------------------------------------
// Spell School Translation
//------------------------------------------------------------------------------

export const spellSchoolTranslationsSchema = z.object({
  label: z.string(),
  lang: z.string(),
  spell_school: z.string(),
});

export type SpellSchoolTranslations = z.infer<
  typeof spellSchoolTranslationsSchema
>;

//------------------------------------------------------------------------------
// Fetch Spell School Translations Map
//------------------------------------------------------------------------------

export async function fetchSpellSchoolTranslationsMap(): Promise<
  Record<string, I18nString>
> {
  const { data } = await supabase.from("spell_school_translations").select();
  const translations = z.array(spellSchoolTranslationsSchema).parse(data);
  const translationsMap: Record<string, I18nString> = {};
  translations.forEach(({ lang, label, spell_school }) => {
    if (!translationsMap[spell_school]) translationsMap[spell_school] = {};
    translationsMap[spell_school][lang] = label;
  });
  return translationsMap;
}

//------------------------------------------------------------------------------
// Use Translate Spell School
//------------------------------------------------------------------------------

export function useTranslateSpellSchool() {
  const { data: translationMap } = useQuery<Record<string, I18nString>>({
    queryFn: fetchSpellSchoolTranslationsMap,
    queryKey: ["spell_school_translations_map"],

    gcTime: 30 * 24 * 60 * 60 * 1000,
    staleTime: Infinity,
  });

  const translate = useCallback(
    (spellSchool: string, lang: string) => {
      if (!translationMap) return spellSchool;
      const base = translationMap[spellSchool];
      return base[lang] ?? base.en ?? spellSchool;
    },
    [translationMap]
  );

  return translate;
}
