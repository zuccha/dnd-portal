import { useCallback, useMemo } from "react";
import { type I18nLangContext, useI18nLang } from "./i18n-lang";

//------------------------------------------------------------------------------
// Interpolate
//------------------------------------------------------------------------------

function interpolate(text: string, ...args: string[]) {
  return text.replace(/<(\d+)>/g, (_, index) => args[+index - 1] ?? "");
}

//------------------------------------------------------------------------------
// Use I18n Lang Context
//------------------------------------------------------------------------------

export function useI18nLangContext(context: I18nLangContext) {
  const [lang] = useI18nLang();

  const t = useCallback(
    (key: string) => {
      const base = context[key] ?? {};
      return base[lang] ?? base["en"] ?? key;
    },
    [context, lang],
  );

  const tp = useCallback(
    (key: string, count: number) => {
      const base = context[`${key}/${count}`] ?? context[`${key}/*`] ?? {};
      return base[lang] ?? base["en"] ?? key;
    },
    [context, lang],
  );

  const ti = useCallback(
    (key: string, ...args: string[]) => {
      const base = context[key] ?? {};
      return interpolate(base[lang] ?? base["en"] ?? key, ...args);
    },
    [context, lang],
  );

  const tpi = useCallback(
    (key: string, count: number, ...args: string[]) => {
      const base = context[`${key}/${count}`] ?? context[`${key}/*`] ?? {};
      return interpolate(base[lang] ?? base["en"] ?? key, ...args);
    },
    [context, lang],
  );

  return useMemo(() => ({ lang, t, ti, tp, tpi }), [lang, t, tp, ti, tpi]);
}

export type I18nLangContextBag = ReturnType<typeof useI18nLangContext>;
