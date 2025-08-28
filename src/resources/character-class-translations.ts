import { useQuery } from "@tanstack/react-query";
import { useCallback, useMemo } from "react";
import { z } from "zod/v4";
import { type I18nLang, useI18nLang } from "../i18n/i18n-lang";
import supabase from "../supabase";
import {
  type CharacterClass,
  characterClassSchema,
  characterClasses,
} from "./character-class";

//------------------------------------------------------------------------------
// Character Class Translation
//------------------------------------------------------------------------------

export const characterClassTranslationSchema = z.object({
  character_class: characterClassSchema,
  label: z.string(),
  label_short: z.string(),
  lang: z.string(),
});

export type CharacterClassTranslation = z.infer<
  typeof characterClassTranslationSchema
>;

const defaultCharacterClassTranslation = (character_class: CharacterClass) => ({
  character_class,
  label: "",
  label_short: "",
  lang: "en",
});

//------------------------------------------------------------------------------
// Character Class Translation Map
//------------------------------------------------------------------------------

type CharacterClassTranslationMap = Record<
  CharacterClass,
  Record<string, CharacterClassTranslation>
>;

//------------------------------------------------------------------------------
// Fetch Character Class Translations Map
//------------------------------------------------------------------------------

export async function fetchCharacterClassTranslationsMap(): Promise<CharacterClassTranslationMap> {
  const { data } = await supabase.from("character_class_translations").select();
  const translations = z.array(characterClassTranslationSchema).parse(data);
  const translationsMap = Object.fromEntries(
    characterClasses.map((character_class) => [character_class, {}])
  ) as CharacterClassTranslationMap;
  translations.forEach((translation) => {
    translationsMap[translation.character_class][translation.lang] =
      translation;
  });
  return translationsMap;
}

//------------------------------------------------------------------------------
// Use Character Class Translation Map
//------------------------------------------------------------------------------

export function useCharacterClassTranslationMap() {
  return useQuery<CharacterClassTranslationMap>({
    queryFn: fetchCharacterClassTranslationsMap,
    queryKey: ["character_class_translations_map"],
  });
}

//------------------------------------------------------------------------------
// Use Translate Character Class
//------------------------------------------------------------------------------

export function useTranslateCharacterClass(
  lang: I18nLang
): (characterClass: CharacterClass) => CharacterClassTranslation {
  const { data: translationMap } = useCharacterClassTranslationMap();

  const translate = useCallback(
    (characterClass: CharacterClass): CharacterClassTranslation => {
      if (!translationMap)
        return defaultCharacterClassTranslation(characterClass);

      const base = translationMap[characterClass];
      return (
        base[lang] ??
        base.en ??
        defaultCharacterClassTranslation(characterClass)
      );
    },
    [lang, translationMap]
  );

  return translate;
}

//------------------------------------------------------------------------------
// Use Character Class Translations
//------------------------------------------------------------------------------

export function useCharacterClassesTranslations() {
  const [lang] = useI18nLang();
  const translate = useTranslateCharacterClass(lang);

  return useMemo(
    () => characterClasses.map((characterClass) => translate(characterClass)),
    [translate]
  );
}
