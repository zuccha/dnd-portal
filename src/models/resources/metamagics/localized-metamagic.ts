import { useCallback } from "react";
import z from "zod";
import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import { translate } from "~/i18n/i18n-string";
import {
  formatInfo,
  localizedResourceSchema,
  useLocalizeResource,
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
// Use Localized Metamagic
//------------------------------------------------------------------------------

export function useLocalizeMetamagic(): (
  metamagic: Metamagic,
) => LocalizedMetamagic {
  const localizeResource = useLocalizeResource<Metamagic>();
  const { lang, t, tp } = useI18nLangContext(i18nContext);

  return useCallback(
    (metamagic: Metamagic): LocalizedMetamagic => {
      const prerequisite =
        metamagic.prerequisite ?
          translate(metamagic.prerequisite, lang)
        : undefined;

      const info = formatInfo([
        [
          tp("prerequisites", prerequisite?.includes(",") ? 2 : 1),
          prerequisite ?? "",
        ],
      ]);

      return {
        ...localizeResource(metamagic),
        descriptor: t("subtitle"),
        details: translate(metamagic.description, lang),

        info,
        prerequisite: prerequisite || "",
        sorcery_points: `${metamagic.sorcery_points}`,
      };
    },
    [lang, localizeResource, t, tp],
  );
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
