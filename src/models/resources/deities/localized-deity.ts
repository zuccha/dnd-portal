import { useMemo } from "react";
import z from "zod";
import { translate } from "~/i18n/i18n-string";
import catalogue from "~/models/catalogue/catalogue";
import type { RelatedResourceEntries } from "~/models/catalogue/resource-relations";
import { useTranslateCreatureAlignment } from "../../types/creature-alignment";
import { useTranslateDeityDomain } from "../../types/deity-domain";
import { type ChronicleEntry } from "../chronicle-entries/chronicle-entry";
import { appendChronicleEntriesToDescription } from "../chronicle-entries/chronicle-entry-description";
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
  chronicleEntries: ChronicleEntry[];
  translateCreatureAlignment: (value: Deity["alignment"]) => string;
  translateDeityDomain: (value: Deity["domain"]) => string;
};

//------------------------------------------------------------------------------
// Chronicle Entry Resources
//------------------------------------------------------------------------------

const chronicleEntryResources = catalogue.createResourceStore("chronicle_entry");
const useChronicleEntries = chronicleEntryResources.useResources as (
  resourceIds: string[],
) => ChronicleEntry[];

//------------------------------------------------------------------------------
// Use Deity Localization Context
//------------------------------------------------------------------------------

export function useDeityLocalizationContext(
  _deity: Deity,
  related: RelatedResourceEntries<"deity">,
): DeityLocalizationContext {
  const context = useResourceLocalizationContext(i18nContext);
  const chronicleEntries = useChronicleEntries(related.chronicle_entries.map(({ id }) => id));
  const translateCreatureAlignment = useTranslateCreatureAlignment(context.lang);
  const translateDeityDomain = useTranslateDeityDomain(context.lang);

  return useMemo(
    () => ({ ...context, chronicleEntries, translateCreatureAlignment, translateDeityDomain }),
    [chronicleEntries, context, translateCreatureAlignment, translateDeityDomain],
  );
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
    description: appendChronicleEntriesToDescription(
      translate(deity.description, context.lang),
      context.chronicleEntries,
      context.lang,
    ),

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
