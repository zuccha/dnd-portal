import { useQuery } from "@tanstack/react-query";
import { useCallback } from "react";
import { z } from "zod/v4";
import type { I18nLang } from "../i18n/i18n-lang";
import type { I18nString } from "../i18n/i18n-string";
import supabase from "../supabase";
import {
  type CharacterClass,
  characterClassSchema,
  characterClasses,
} from "./character-class";

//------------------------------------------------------------------------------
// Character Class Translation
//------------------------------------------------------------------------------

export const characterClassTranslationsSchema = z.object({
  character_class: characterClassSchema,
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
  Record<CharacterClass, I18nString>
> {
  const { data } = await supabase.from("character_class_translations").select();
  const translations = z.array(characterClassTranslationsSchema).parse(data);
  const translationsMap = Object.fromEntries(
    characterClasses.map((characterClass) => [characterClass, {}])
  ) as Record<CharacterClass, I18nString>;
  translations.forEach(({ lang, label_short, character_class }) => {
    translationsMap[character_class][lang] = label_short;
  });
  return translationsMap;
}

//------------------------------------------------------------------------------
// Use Character Class Translation Map
//------------------------------------------------------------------------------

export function useCharacterClassTranslationMap() {
  return useQuery<Record<CharacterClass, I18nString>>({
    queryFn: fetchCharacterClassTranslationsMap,
    queryKey: ["character_class_translations_map"],
  });
}

//------------------------------------------------------------------------------
// Use Translate Character Class
//------------------------------------------------------------------------------

export function useTranslateCharacterClass(lang: I18nLang) {
  const { data: translationMap } = useCharacterClassTranslationMap();

  const translate = useCallback(
    (characterClass: CharacterClass) => {
      if (!translationMap) return characterClass;
      const base = translationMap[characterClass];
      return base[lang] ?? base.en ?? characterClass;
    },
    [lang, translationMap]
  );

  return translate;
}
