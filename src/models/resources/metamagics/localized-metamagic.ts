import z from "zod";
import { translate } from "~/i18n/i18n-string";
import {
  type ResourceLocalizationContext,
  localizeResource,
  localizedFieldSchema,
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
  prerequisite: localizedFieldSchema,
  sorcery_points: localizedFieldSchema.extend({ value_with_label: z.string() }),
});

export type LocalizedMetamagic = z.infer<typeof localizedMetamagicSchema>;

//------------------------------------------------------------------------------
// Metamagic Localization Context
//------------------------------------------------------------------------------

type MetamagicLocalizationContext = ResourceLocalizationContext;

//------------------------------------------------------------------------------
// Use Metamagic Localization Context
//------------------------------------------------------------------------------

export function useMetamagicLocalizationContext(
  _metamagic: Metamagic,
): MetamagicLocalizationContext {
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
    descriptor: context.t("descriptor"),
    details: translate(metamagic.description, context.lang),

    prerequisite: {
      label: context.tp("prerequisites", prerequisite?.includes(",") ? 2 : 1),
      value: prerequisite ?? "",
    },
    sorcery_points: {
      label: context.tp("sorcery_points", metamagic.sorcery_points),
      value: `${metamagic.sorcery_points}`,
      value_with_label: context.tpi(
        "sorcery_points_with_value",
        metamagic.sorcery_points,
        `${metamagic.sorcery_points}`,
      ),
    },
  };
}

//------------------------------------------------------------------------------
// I18n Context
//------------------------------------------------------------------------------

const i18nContext = {
  "descriptor": {
    en: "Metamagic Option",
    it: "Opzione di Metamagia",
  },
  "prerequisites/*": {
    en: "Prerequisites",
    it: "Prerequisiti",
  },
  "prerequisites/1": {
    en: "Prerequisite",
    it: "Prerequisito",
  },
  "sorcery_points/*": {
    en: "Sorcery Points",
    it: "Punti Stregoneria",
  },
  "sorcery_points/1": {
    en: "Sorcery Point",
    it: "Punto Stregoneria",
  },
  "sorcery_points_with_value/*": {
    en: "<1> Sorcery Points",
    it: "<1> Punti Stregoneria",
  },
  "sorcery_points_with_value/1": {
    en: "<1> Sorcery Point",
    it: "<1> Punto Stregoneria",
  },
};
