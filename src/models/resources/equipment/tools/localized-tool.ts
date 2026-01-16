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
  const { lang, ti } = useI18nLangContext(i18nContext);

  const translateCreatureAbility = useTranslateCreatureAbility(lang);
  const translateToolType = useTranslateToolType(lang);

  return useCallback(
    (tool: Tool): LocalizedTool => {
      const equipment = localizeEquipment(tool);
      const type = translateToolType(tool.type).label;

      return {
        ...equipment,
        descriptor:
          tool.magic ? ti("subtitle.magic", type, equipment.rarity) : type,

        ability: translateCreatureAbility(tool.ability).label,
        craft: translate(tool.craft, lang),
        type,
        utilize: translate(tool.utilize, lang),
      };
    },
    [lang, localizeEquipment, ti, translateCreatureAbility, translateToolType],
  );
}

//------------------------------------------------------------------------------
// I18n Context
//------------------------------------------------------------------------------

const i18nContext = {
  "craft": {
    en: "**Craft:** <1>",
    it: "**Creazione:** <1>",
  },
  "subtitle.magic": {
    en: "<1>, Magic, <2>", // 1 = type, 2 = rarity
    it: "<1> Magico, <2>", // 1 = type, 2 = rarity
  },
  "utilize": {
    en: "**Utilize:** <1>",
    it: "**Utilizzo:** <1>",
  },
};
