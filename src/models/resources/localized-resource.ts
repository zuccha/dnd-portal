import { useMemo } from "react";
import z, { ZodType } from "zod";
import type { I18nLang, I18nLangContext } from "~/i18n/i18n-lang";
import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import { translateNumber } from "~/i18n/i18n-number";
import { translate } from "~/i18n/i18n-string";
import { resourceVisibilitySchema } from "../types/resource-visibility";
import { type SourceVersion, useTranslateSourceVersion } from "../types/source-version";
import type { ResourceKind } from "../types/resource-kind";
import type { Resource } from "./resource";

//------------------------------------------------------------------------------
// Localized Field
//------------------------------------------------------------------------------

export const localizedFieldSchema = z.object({
  label: z.string(),
  value: z.string(),
});

export type LocalizedField = z.infer<typeof localizedFieldSchema>;

//------------------------------------------------------------------------------
// Localized Resource Link
//------------------------------------------------------------------------------

export function localizedResourceLinkSchema<K extends ResourceKind>(kindSchema: ZodType<K>) {
  return z.object({
    id: z.uuid(),
    kind: kindSchema,
    name: z.string(),
  });
}

export type LocalizedResourceLink<K extends ResourceKind> = {
  id: string;
  kind: K;
  name: string;
};

//------------------------------------------------------------------------------
// Localized Resource
//------------------------------------------------------------------------------

export const localizedResourceSchema = <R extends Resource>(
  _resourceSchema: ZodType<R>,
  kindSchema: ZodType<R["kind"]>,
) =>
  z.object({
    descriptor: z.string(),
    description: z.string(),
    id: z.uuid(),
    image_url: z.string().nullish(),
    is_virtual: z.boolean(),
    kind: kindSchema,
    name: z.string(),
    page: z.string(),
    source_code: z.string(),
    source_id: z.string(),
    source_version: z.string(),
    visibility: resourceVisibilitySchema,
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
  tp: (key: string, count: number) => string;
  tpi: (key: string, count: number, ...args: string[]) => string;
  translateSourceVersion: (version: SourceVersion) => string;
};

//------------------------------------------------------------------------------
// Use Resource Localization Context
//------------------------------------------------------------------------------

export function useResourceLocalizationContext(
  context: I18nLangContext = emptyI18nContext,
): ResourceLocalizationContext {
  const mergedI18nContext = useMemo(() => ({ ...i18nContext, ...context }), [context]);
  const { lang, t, ti, tp, tpi } = useI18nLangContext(mergedI18nContext);
  const translateSourceVersion = useTranslateSourceVersion(lang);

  return useMemo(
    () => ({ lang, t, ti, tp, tpi, translateSourceVersion }),
    [lang, t, ti, tp, tpi, translateSourceVersion],
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
    descriptor: "",
    description: "",
    id: resource.id,
    image_url: resource.image_url,
    is_virtual: resource.is_virtual ?? false,
    kind: resource.kind,
    name: translate(resource.name, context.lang) || context.t("name.missing"),
    page: page ? context.ti("page", `${page}`) : "",
    source_code: resource.source_code,
    source_id: resource.source_id,
    source_version: context.translateSourceVersion(resource.source_version),
    visibility: resource.visibility,
  };
}

//------------------------------------------------------------------------------
// Format Details
//------------------------------------------------------------------------------

export function formatDescription(...details: string[]): string {
  return details.filter(Boolean).join("\n\n");
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

//------------------------------------------------------------------------------
// Empty I18n Context
//------------------------------------------------------------------------------

const emptyI18nContext: I18nLangContext = {};
