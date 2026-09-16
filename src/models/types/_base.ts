import { useCallback, useMemo } from "react";
import { type I18nLang, useI18nLang } from "~/i18n/i18n-lang";
import type { I18nString } from "~/i18n/i18n-string";
import { compareObjects } from "~/utils/object";

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

  function useTranslate(lang: I18nLang): (value: Type) => string {
    return useCallback((type: Type) => labels[type][lang] ?? type, [lang]);
  }

  //----------------------------------------------------------------------------
  // Use Translate Short
  //----------------------------------------------------------------------------

  function useTranslateShort(lang: I18nLang): (value: Type) => string {
    const translate = useTranslate(lang);
    return useCallback(
      (type: Type) => (shortLabels ? (shortLabels[type][lang] ?? type) : translate(type)),
      [lang, translate],
    );
  }

  //----------------------------------------------------------------------------
  // Use Options
  //----------------------------------------------------------------------------

  function useOptions(): { label: string; value: Type }[] {
    const [lang] = useI18nLang();
    const translate = useTranslate(lang);
    return useMemo(() => types.map((value) => ({ label: translate(value), value })), [translate]);
  }

  //----------------------------------------------------------------------------
  // Use Short Options
  //----------------------------------------------------------------------------

  function useShortOptions(): { label: string; value: Type }[] {
    const [lang] = useI18nLang();
    const translateShort = useTranslateShort(lang);
    return useMemo(
      () => types.map((value) => ({ label: translateShort(value), value })),
      [translateShort],
    );
  }

  //----------------------------------------------------------------------------
  // Use Sorted Options
  //----------------------------------------------------------------------------

  function useSortedOptions(): { label: string; value: Type }[] {
    const options = useOptions();
    return useMemo(() => options.sort(compareObjects("label")), [options]);
  }

  //----------------------------------------------------------------------------
  // Use Sorted Short Options
  //----------------------------------------------------------------------------

  function useSortedShortOptions(): { label: string; value: Type }[] {
    const options = useShortOptions();
    return useMemo(() => options.sort(compareObjects("label")), [options]);
  }

  //----------------------------------------------------------------------------
  // Return
  //----------------------------------------------------------------------------

  return {
    useOptions,
    useShortOptions,
    useSortedOptions,
    useSortedShortOptions,
    useTranslate,
    useTranslateShort,
  };
}
