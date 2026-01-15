import { useCallback } from "react";
import z, { ZodType } from "zod";
import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import { translateNumber } from "~/i18n/i18n-number";
import { translate } from "~/i18n/i18n-string";
import type { Resource } from "./resource";

//------------------------------------------------------------------------------
// Localized Resource
//------------------------------------------------------------------------------

export const localizedResourceSchema = <R extends Resource>(
  rawSchema: ZodType<R>,
) =>
  z.object({
    _raw: rawSchema,
    campaign: z.string(),
    campaign_with_page: z.string(),
    id: z.uuid(),
    name: z.string(),
    page: z.string(),
    subtitle: z.string(),
  });

export type LocalizedResource<R extends Resource> = z.infer<
  ReturnType<typeof localizedResourceSchema<R>>
>;

//------------------------------------------------------------------------------
// Use Localize Resource
//------------------------------------------------------------------------------

export function useLocalizeResource<R extends Resource>(): (
  resource: R,
) => LocalizedResource<R> {
  const { lang, t, ti } = useI18nLangContext(i18nContext);

  return useCallback(
    (resource: R): LocalizedResource<R> => {
      const page = translateNumber(resource.page ?? {}, lang);
      return {
        _raw: resource,
        campaign: resource.campaign_name,
        campaign_with_page:
          page ?
            ti("campaign_with_page", resource.campaign_name, `${page}`)
          : resource.campaign_name,
        id: resource.id,
        name: translate(resource.name, lang) || t("name.missing"),
        page: page ? ti("page", `${page}`) : "",
        subtitle: "",
      };
    },
    [lang, t, ti],
  );
}

//------------------------------------------------------------------------------
// I18n Context
//------------------------------------------------------------------------------

const i18nContext = {
  "campaign_with_page": {
    en: "<1> (p. <2>)", // 1 = campaign, 2 = page
    it: "<1> (p. <2>)", // 1 = campaign, 2 = page
  },

  "name.missing": {
    en: "<Untitled>",
    it: "<Senza nome>",
  },

  "page": {
    en: "p. <1>", // 1 = page
    it: "p. <1>", // 1 = page
  },
};
