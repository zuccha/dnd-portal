import { useCallback } from "react";
import z from "zod";
import { translate } from "~/i18n/i18n-string";
import {
  type ResourceLocalizationContext,
  formatInfo,
  localizeResource,
  localizedResourceSchema,
  useResourceLocalizationContext,
} from "../localized-resource";
import { type Metamagic, metamagicSchema } from "./metamagic";

//------------------------------------------------------------------------------
// Localized Metamagic
//------------------------------------------------------------------------------

export const localizedMetamagicSchema = localizedResourceSchema(
  metamagicSchema,
  z.literal("metamagic"),
).extend({
  info: z.string(),
  prerequisite: z.string(),
  sorcery_points: z.string(),
});

export type LocalizedMetamagic = z.infer<typeof localizedMetamagicSchema>;

//------------------------------------------------------------------------------
// Metamagic Localization Context
//------------------------------------------------------------------------------

type MetamagicLocalizationContext = ResourceLocalizationContext;

//------------------------------------------------------------------------------
// Use Metamagic Localization Context
//------------------------------------------------------------------------------

function useMetamagicLocalizationContext(): MetamagicLocalizationContext {
  return useResourceLocalizationContext(i18nContext);
}

//------------------------------------------------------------------------------
// Localize Metamagic
//------------------------------------------------------------------------------

export function localizeMetamagic(
  metamagic: Metamagic,
  context: MetamagicLocalizationContext,
): LocalizedMetamagic {
  const prerequisite = metamagic.prerequisite
    ? translate(metamagic.prerequisite, context.lang)
    : undefined;

  return {
    ...localizeResource(metamagic, context),
    descriptor: context.t("subtitle"),
    details: translate(metamagic.description, context.lang),
    info: formatInfo([
      [context.tp("prerequisites", prerequisite?.includes(",") ? 2 : 1), prerequisite ?? ""],
    ]),
    prerequisite: prerequisite || "",
    sorcery_points: `${metamagic.sorcery_points}`,
  };
}

//------------------------------------------------------------------------------
// Use Localize Metamagic
//------------------------------------------------------------------------------

export function useLocalizeMetamagic(): (metamagic: Metamagic) => LocalizedMetamagic {
  const context = useMetamagicLocalizationContext();
  return useCallback((metamagic) => localizeMetamagic(metamagic, context), [context]);
}

//------------------------------------------------------------------------------
// I18n Context
//------------------------------------------------------------------------------

const i18nContext = {
  "prerequisites/*": {
    en: "Prerequisites",
    it: "Prerequisiti",
  },
  "prerequisites/1": {
    en: "Prerequisite",
    it: "Prerequisito",
  },
  "subtitle": {
    en: "Metamagic Option",
    it: "Opzione di Metamagia",
  },
};
