import { useQuery } from "@tanstack/react-query";
import { useCallback, useMemo } from "react";
import { z } from "zod";
import { type I18nLang, useI18nLang } from "../i18n/i18n-lang";
import supabase from "../supabase";
import {
  type SpellSchool,
  spellSchoolSchema,
  spellSchools,
} from "./spell-school";

//------------------------------------------------------------------------------
// Spell School Translation
//------------------------------------------------------------------------------

export const spellSchoolTranslationSchema = z.object({
  label: z.string(),
  lang: z.string(),
  spell_school: spellSchoolSchema,
});

export type SpellSchoolTranslation = z.infer<
  typeof spellSchoolTranslationSchema
>;

const defaultSpellSchoolTranslation = (spell_school: SpellSchool) => ({
  label: "",
  lang: "en",
  spell_school,
});

//------------------------------------------------------------------------------
// Spell School Translation Map
//------------------------------------------------------------------------------

type SpellSchoolTranslationMap = Record<
  SpellSchool,
  Record<string, SpellSchoolTranslation>
>;

//------------------------------------------------------------------------------
// Fetch Spell School Translations Map
//------------------------------------------------------------------------------

export async function fetchSpellSchoolTranslationsMap(): Promise<SpellSchoolTranslationMap> {
  const { data } = await supabase.from("spell_school_translations").select();
  const translations = z.array(spellSchoolTranslationSchema).parse(data);
  const translationsMap = Object.fromEntries(
    spellSchools.map((spellSchool) => [spellSchool, {}])
  ) as SpellSchoolTranslationMap;
  translations.forEach((translation) => {
    translationsMap[translation.spell_school][translation.lang] = translation;
  });
  return translationsMap;
}

//------------------------------------------------------------------------------
// Use Character Class Translation Map
//------------------------------------------------------------------------------

export function useCharacterClassTranslationMap() {
  return useQuery<SpellSchoolTranslationMap>({
    queryFn: fetchSpellSchoolTranslationsMap,
    queryKey: ["spell_school_translations_map"],
  });
}

//------------------------------------------------------------------------------
// Use Translate Spell School
//------------------------------------------------------------------------------

export function useTranslateSpellSchool(
  lang: I18nLang
): (characterClass: SpellSchool) => SpellSchoolTranslation {
  const { data: translationMap } = useCharacterClassTranslationMap();

  const translate = useCallback(
    (spellSchool: SpellSchool): SpellSchoolTranslation => {
      if (!translationMap) return defaultSpellSchoolTranslation(spellSchool);
      const base = translationMap[spellSchool];
      return (
        base[lang] ?? base.en ?? defaultSpellSchoolTranslation(spellSchool)
      );
    },
    [lang, translationMap]
  );

  return translate;
}

//------------------------------------------------------------------------------
// Use Spell School Translations
//------------------------------------------------------------------------------

export function useSpellSchoolTranslations() {
  const [lang] = useI18nLang();
  const translate = useTranslateSpellSchool(lang);

  return useMemo(
    () => spellSchools.map((spellSchool) => translate(spellSchool)),
    [translate]
  );
}
