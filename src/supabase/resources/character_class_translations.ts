import { useQuery } from "@tanstack/react-query";
import { useCallback } from "react";
import { z } from "zod/v4";
import type { I18nString } from "../../i18n/i18n-string";
import supabase from "../supabase";

//------------------------------------------------------------------------------
// Character Class Translation
//------------------------------------------------------------------------------

export const characterClassTranslationsSchema = z.object({
  character_class: z.string(),
  label: z.string(),
  label_short: z.string(),
  lang: z.string(),
});

export type CharacterClassTranslations = z.infer<
  typeof characterClassTranslationsSchema
>;

//------------------------------------------------------------------------------
// Fetch Character Class Translations Map
//------------------------------------------------------------------------------

export async function fetchCharacterClassTranslationsMap(): Promise<
  Record<string, I18nString>
> {
  const { data } = await supabase.from("character_class_translations").select();
  const translations = z.array(characterClassTranslationsSchema).parse(data);
  const translationsMap: Record<string, I18nString> = {};
  translations.forEach(({ lang, label_short, character_class }) => {
    if (!translationsMap[character_class])
      translationsMap[character_class] = {};
    translationsMap[character_class][lang] = label_short;
  });
  return translationsMap;
}

//------------------------------------------------------------------------------
// Use Translate Character Class
//------------------------------------------------------------------------------

export function useTranslateCharacterClass() {
  const { data: translationMap } = useQuery<Record<string, I18nString>>({
    queryFn: fetchCharacterClassTranslationsMap,
    queryKey: ["character_class_translations_map"],
  });

  const translate = useCallback(
    (characterClass: string, lang: string) => {
      if (!translationMap) return characterClass;
      const base = translationMap[characterClass];
      return base[lang] ?? base.en ?? characterClass;
    },
    [translationMap]
  );

  return translate;
}
