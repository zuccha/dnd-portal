import { useQuery } from "@tanstack/react-query";
import { useCallback, useMemo } from "react";
import z, { ZodType } from "zod";
import { type I18nLang, useI18nLang } from "../i18n/i18n-lang";
import supabase from "../supabase";

//------------------------------------------------------------------------------
// Create Type Translation
//------------------------------------------------------------------------------

export function createTypeTranslation<
  Id extends string,
  Type extends string,
  TypeTranslation extends { lang: string } & Record<Id, Type>
>(id: Id, types: Type[], typeTranslationSchema: ZodType<TypeTranslation>) {
  //----------------------------------------------------------------------------
  // Translation Map
  //----------------------------------------------------------------------------

  type TranslationMap = Map<Type, Map<string, TypeTranslation>>;

  //----------------------------------------------------------------------------
  // Fetch Translation Map
  //----------------------------------------------------------------------------

  async function fetchTranslationMap(): Promise<TranslationMap> {
    const { data } = await supabase.from(`${id}_translations`).select();
    const translations = z.array(typeTranslationSchema).parse(data);
    const translationsMap = new Map<Type, Map<string, TypeTranslation>>();
    types.forEach((t) => translationsMap.set(t, new Map()));
    translations.forEach((translation) => {
      const key = translation[id] as Type;
      translationsMap.get(key)!.set(translation.lang, translation);
    });
    return translationsMap;
  }

  //----------------------------------------------------------------------------
  // Use Translation Map
  //----------------------------------------------------------------------------

  function useTranslationMap() {
    return useQuery<TranslationMap>({
      queryFn: fetchTranslationMap,
      queryKey: [`types[${id}].translation_map`],
    });
  }

  //----------------------------------------------------------------------------
  // Use Translate
  //----------------------------------------------------------------------------

  function useTranslate(
    lang: I18nLang
  ): (characterClass: Type) => TypeTranslation {
    const { data: translationMap } = useTranslationMap();

    const translate = useCallback(
      (type: Type): TypeTranslation => {
        if (!translationMap) return typeTranslationSchema.parse({ [id]: type });
        const base = translationMap.get(type)!;
        return (
          base.get(lang) ??
          base.get("en") ??
          typeTranslationSchema.parse({ [id]: type })
        );
      },
      [lang, translationMap]
    );

    return translate;
  }

  //----------------------------------------------------------------------------
  // Use Translations
  //----------------------------------------------------------------------------

  function useTranslations() {
    const [lang] = useI18nLang();
    const translate = useTranslate(lang);
    return useMemo(() => types.map((type) => translate(type)), [translate]);
  }

  //----------------------------------------------------------------------------
  // Return
  //----------------------------------------------------------------------------

  return {
    useTranslate,
    useTranslations,
  };
}
