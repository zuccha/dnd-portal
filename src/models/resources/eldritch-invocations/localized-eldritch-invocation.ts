import { useCallback } from "react";
import z from "zod";
import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import { translate } from "~/i18n/i18n-string";
import {
  localizedResourceSchema,
  useLocalizeResource,
} from "../localized-resource";
import {
  type EldritchInvocation,
  eldritchInvocationSchema,
} from "./eldritch-invocation";

//------------------------------------------------------------------------------
// Localized Eldritch Invocation
//------------------------------------------------------------------------------

export const localizedEldritchInvocationSchema = localizedResourceSchema(
  eldritchInvocationSchema,
).extend({
  description: z.string(),
  prerequisite: z.string(),

  min_warlock_level: z.string(),
  other_prerequisite: z.string(),
});

export type LocalizedEldritchInvocation = z.infer<
  typeof localizedEldritchInvocationSchema
>;

//------------------------------------------------------------------------------
// Use Localized Eldritch Invocation
//------------------------------------------------------------------------------

export function useLocalizeEldritchInvocation(): (
  eldritchInvocation: EldritchInvocation,
) => LocalizedEldritchInvocation {
  const localizeResource = useLocalizeResource<EldritchInvocation>();
  const { lang, t, ti } = useI18nLangContext(i18nContext);

  return useCallback(
    (eldritchInvocation: EldritchInvocation): LocalizedEldritchInvocation => {
      const minWarlockLevel = eldritchInvocation.min_warlock_level;
      const otherPrerequisite =
        eldritchInvocation.prerequisite ?
          translate(eldritchInvocation.prerequisite, lang)
        : undefined;

      return {
        ...localizeResource(eldritchInvocation),
        description: translate(eldritchInvocation.description, lang),
        prerequisite:
          minWarlockLevel > 0 && otherPrerequisite ?
            ti("prerequisite.full", `${minWarlockLevel}`, otherPrerequisite)
          : minWarlockLevel > 0 ? ti("prerequisite.level", `${minWarlockLevel}`)
          : otherPrerequisite ? ti("prerequisite.other", otherPrerequisite)
          : t("prerequisite.none"),

        min_warlock_level: `${minWarlockLevel}`,
        other_prerequisite: otherPrerequisite || t("prerequisite.none"),
      };
    },
    [lang, localizeResource, t, ti],
  );
}

//------------------------------------------------------------------------------
// I18n Context
//------------------------------------------------------------------------------

const i18nContext = {
  "prerequisite.full": {
    en: "Prerequisite: Level <1>+ Warlock, <2>", // 1 = level, 2 = other
    it: "Prerequisito: warlock di <1>˚ livello o superiore, <2>", // 1 = level, 2 = other
  },

  "prerequisite.level": {
    en: "Prerequisite: Level <1>+ Warlock", // 1 = level
    it: "Prerequisito: warlock di <1>˚ livello o superiore", // 1 = level
  },

  "prerequisite.other": {
    en: "Prerequisite: <1>", // 1 = other
    it: "Prerequisito: <1>", // 1 = other
  },

  "prerequisite.none": {
    en: "no prerequisite",
    it: "nessun prerequisito",
  },
};
