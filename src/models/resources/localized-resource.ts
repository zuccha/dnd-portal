import { useCallback, useMemo } from "react";
import z, { ZodType } from "zod";
import type { I18nLang } from "~/i18n/i18n-lang";
import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import { translateNumber } from "~/i18n/i18n-number";
import { translate } from "~/i18n/i18n-string";
import { type SourceVersion, useTranslateSourceVersion } from "../types/source-version";
import type { Resource } from "./resource";

//------------------------------------------------------------------------------
// Localized Resource
//------------------------------------------------------------------------------

export const localizedResourceSchema = <R extends Resource>(
  resourceSchema: ZodType<R>,
  kindSchema: ZodType<R["kind"]>,
) =>
  z.object({
    _raw: resourceSchema,
    descriptor: z.string(),
    details: z.string(),
    id: z.uuid(),
    kind: kindSchema,
    name: z.string(),
    page: z.string(),
    source: z.string(),
    sourceVersion: z.string(),
  });

export type LocalizedResource<R extends Resource> = z.infer<
  ReturnType<typeof localizedResourceSchema<R>>
>;

//------------------------------------------------------------------------------
// Resource Localization Context
//------------------------------------------------------------------------------

export type ResourceLocalizationContext = {
  lang: I18nLang;
  t: (key: string) => string;
  ti: (key: string, ...args: string[]) => string;
  translateSourceVersion: (version: SourceVersion) => string;
};

//------------------------------------------------------------------------------
// Use Resource Localization Context
//------------------------------------------------------------------------------

function useResourceLocalizationContext(): ResourceLocalizationContext {
  const { lang, t, ti } = useI18nLangContext(i18nContext);
  const translateSourceVersionLabels = useTranslateSourceVersion(lang);
  const translateSourceVersion = useCallback(
    (version: SourceVersion) => translateSourceVersionLabels(version).label,
    [translateSourceVersionLabels],
  );

  return useMemo(
    () => ({ lang, t, ti, translateSourceVersion }),
    [lang, t, ti, translateSourceVersion],
  );
}

//------------------------------------------------------------------------------
// Localize Resource
//------------------------------------------------------------------------------

export function localizeResource<R extends Resource>(
  resource: R,
  context: ResourceLocalizationContext,
): LocalizedResource<R> {
  const page = translateNumber(resource.page ?? {}, context.lang);
  return {
    _raw: resource,
    descriptor: "",
    details: "",
    id: resource.id,
    kind: resource.kind,
    name: translate(resource.name, context.lang) || context.t("name.missing"),
    page: page ? context.ti("page", `${page}`) : "",
    source: resource.source_code,
    sourceVersion: context.translateSourceVersion(resource.source_version),
  };
}

//------------------------------------------------------------------------------
// Use Localize Resource
//------------------------------------------------------------------------------

export function useLocalizeResource<R extends Resource>(): (resource: R) => LocalizedResource<R> {
  const context = useResourceLocalizationContext();

  return useCallback((resource) => localizeResource(resource, context), [context]);
}

//------------------------------------------------------------------------------
// Format Details
//------------------------------------------------------------------------------

export function formatDetails(...details: string[]): string {
  return details.filter(Boolean).join("\n\n");
}

//------------------------------------------------------------------------------
// Format Info
//------------------------------------------------------------------------------

export function formatInfo(entries: [string, string][]): string {
  return entries
    .filter(([_label, text]) => text)
    .map(([label, text]) => `**${label}**\u2007${text}`)
    .join("\n");
}

//------------------------------------------------------------------------------
// I18n Context
//------------------------------------------------------------------------------

const i18nContext = {
  "name.missing": {
    en: "<Untitled>",
    it: "<Senza nome>",
  },
  "page": {
    en: "<1>", // 1 = page
    it: "<1>", // 1 = page
  },
};
