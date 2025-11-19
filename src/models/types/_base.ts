import { useCallback, useMemo } from "react";
import { type I18nLang, useI18nLang } from "~/i18n/i18n-lang";
import type { I18nString } from "~/i18n/i18n-string";
import { compareObjects } from "~/utils/object";

//------------------------------------------------------------------------------
// Type Translation
//------------------------------------------------------------------------------

export type TypeTranslation<Type extends string> = {
  label: string;
  label_short: string;
  lang: I18nLang;
  value: Type;
};

//------------------------------------------------------------------------------
// Create Type Translation Hooks
//------------------------------------------------------------------------------

export function createTypeTranslationHooks<Type extends string>(
  types: Type[],
  labels: Record<Type, I18nString>,
  shortLabels?: Record<Type, I18nString>,
) {
  //----------------------------------------------------------------------------
  // Use Translate
  //----------------------------------------------------------------------------

  function useTranslate(
    lang: I18nLang,
  ): (characterClass: Type) => TypeTranslation<Type> {
    const translate = useCallback(
      (type: Type): TypeTranslation<Type> => {
        const label = labels[type][lang] ?? labels[type]["en"] ?? type;
        const label_short =
          shortLabels ?
            (shortLabels[type][lang] ?? shortLabels[type]["en"] ?? type)
          : label;
        return { label, label_short, lang, value: type };
      },
      [lang],
    );

    return translate;
  }

  //----------------------------------------------------------------------------
  // Use Translations
  //----------------------------------------------------------------------------

  function useTranslations(): TypeTranslation<Type>[] {
    const [lang] = useI18nLang();
    const translate = useTranslate(lang);
    return useMemo(() => types.map(translate), [translate]);
  }

  //----------------------------------------------------------------------------
  // Use Options
  //----------------------------------------------------------------------------

  function useOptions(): { label: string; value: Type }[] {
    return useTranslations();
  }

  //----------------------------------------------------------------------------
  // Use Sorted Options
  //----------------------------------------------------------------------------

  function useSortedOptions(): { label: string; value: Type }[] {
    const translations = useTranslations();
    return useMemo(
      () => translations.sort(compareObjects("label")),
      [translations],
    );
  }

  //----------------------------------------------------------------------------
  // Return
  //----------------------------------------------------------------------------

  return {
    useOptions,
    useSortedOptions,
    useTranslate,
    useTranslations,
  };
}
