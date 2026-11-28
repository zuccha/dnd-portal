import z from "zod";
import { translate } from "~/i18n/i18n-string";
import { useTranslateCreatureAlignment } from "../../types/creature-alignment";
import { useTranslateDeityDomain } from "../../types/deity-domain";
import {
  type ResourceLocalizationContext,
  localizeResource,
  localizedFieldSchema,
  localizedResourceSchema,
  useResourceLocalizationContext,
} from "../localized-resource";
import { type Deity, deitySchema } from "./deity";

//------------------------------------------------------------------------------
// Localized Deity Schema
//------------------------------------------------------------------------------

export const localizedDeitySchema = localizedResourceSchema(deitySchema, z.literal("deity")).extend(
  { alignment: localizedFieldSchema, domain: localizedFieldSchema },
);

//------------------------------------------------------------------------------
// Localized Deity Type
//------------------------------------------------------------------------------

export type LocalizedDeity = z.infer<typeof localizedDeitySchema>;

//------------------------------------------------------------------------------
// Deity Localization Context
//------------------------------------------------------------------------------

type DeityLocalizationContext = ResourceLocalizationContext & {
  translateCreatureAlignment: (value: Deity["alignment"]) => string;
  translateDeityDomain: (value: Deity["domain"]) => string;
};

//------------------------------------------------------------------------------
// Use Deity Localization Context
//------------------------------------------------------------------------------

export function useDeityLocalizationContext(): DeityLocalizationContext {
  const context = useResourceLocalizationContext(i18nContext);
  const translateCreatureAlignment = useTranslateCreatureAlignment(context.lang);
  const translateDeityDomain = useTranslateDeityDomain(context.lang);

  return { ...context, translateCreatureAlignment, translateDeityDomain };
}

//------------------------------------------------------------------------------
// Localize Deity
//------------------------------------------------------------------------------

export function localizeDeity(deity: Deity, context: DeityLocalizationContext): LocalizedDeity {
  const alignment = context.translateCreatureAlignment(deity.alignment);
  const domain = context.translateDeityDomain(deity.domain);
  const epithet = translate(deity.epithet, context.lang);

  return {
    ...localizeResource(deity, context),
    description: translate(deity.description, context.lang),

    alignment: {
      label: context.t("alignment"),
      value: alignment,
    },
    descriptor: epithet,
    domain: {
      label: context.t("domain"),
      value: domain,
    },
  };
}

//------------------------------------------------------------------------------
// I18n Context
//------------------------------------------------------------------------------

const i18nContext = {
  alignment: { en: "Alignment", it: "Allineamento" },
  domain: { en: "Domain", it: "Dominio" },
};
