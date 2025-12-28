import { useCallback } from "react";
import z from "zod";
import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import { translate } from "~/i18n/i18n-string";
import { useTranslateCreatureAbility } from "../../../types/creature-ability";
import { useTranslateToolType } from "../../../types/tool-type";
import {
  localizedEquipmentSchema,
  useLocalizeEquipment,
} from "../localized-equipment";
import { type Tool, toolSchema } from "./tool";

//------------------------------------------------------------------------------
// Localized Tool
//------------------------------------------------------------------------------

export const localizedToolSchema = localizedEquipmentSchema(toolSchema).extend({
  ability: z.string(),
  craft: z.string(),
  type: z.string(),
  utilize: z.string(),
});

export type LocalizedTool = z.infer<typeof localizedToolSchema>;

//------------------------------------------------------------------------------
// Use Localized Tool
//------------------------------------------------------------------------------

export function useLocalizeTool(): (tool: Tool) => LocalizedTool {
  const localizeEquipment = useLocalizeEquipment<Tool>();
  const { lang } = useI18nLangContext(i18nContext);

  const translateCreatureAbility = useTranslateCreatureAbility(lang);
  const translateToolType = useTranslateToolType(lang);

  return useCallback(
    (tool: Tool): LocalizedTool => {
      const equipment = localizeEquipment(tool);

      return {
        ...equipment,
        ability: translateCreatureAbility(tool.ability).label,
        craft: translate(tool.craft, lang),
        type: translateToolType(tool.type).label,
        utilize: translate(tool.utilize, lang),
      };
    },
    [lang, localizeEquipment, translateCreatureAbility, translateToolType],
  );
}

//------------------------------------------------------------------------------
// I18n Context
//------------------------------------------------------------------------------

const i18nContext = {
  craft: {
    en: "**Craft:** <1>",
    it: "**Creazione:** <1>",
  },
  utilize: {
    en: "**Utilize:** <1>",
    it: "**Utilizzo:** <1>",
  },
};
