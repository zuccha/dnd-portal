import { useCallback } from "react";
import z from "zod";
import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import { translate } from "~/i18n/i18n-string";
import { useTranslateCreatureAbility } from "../../../types/creature-ability";
import { useTranslateToolType } from "../../../types/tool-type";
import { equipmentStore } from "../equipment-store";
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
  type: z.string(),
});

export type LocalizedTool = z.infer<typeof localizedToolSchema>;

//------------------------------------------------------------------------------
// Use Localized Tool
//------------------------------------------------------------------------------

export function useLocalizeTool(
  sourceId: string,
): (tool: Tool) => LocalizedTool {
  const localizeEquipment = useLocalizeEquipment<Tool>();
  const { lang, ti, tpi } = useI18nLangContext(i18nContext);

  const translateCreatureAbility = useTranslateCreatureAbility(lang);
  const translateToolType = useTranslateToolType(lang);
  const localizeEquipmentName = equipmentStore.useLocalizeResourceName(
    sourceId,
    lang,
  );

  return useCallback(
    (tool: Tool): LocalizedTool => {
      const equipment = localizeEquipment(tool);
      const type = translateToolType(tool.type).label;

      const craft =
        tool.craft_ids.map(localizeEquipmentName).sort().join(", ") + ".";

      const utilize = translate(tool.utilize, lang);
      const utilizeCount =
        utilize ?
          utilize.includes(",") ?
            2
          : 1
        : 0;

      return {
        ...equipment,
        descriptor:
          tool.magic ? ti("subtitle.magic", type, equipment.rarity) : type,
        details: [
          tpi("utilize", utilizeCount, utilize),
          tpi("craft", tool.craft_ids.length, craft),
          equipment.details,
        ]
          .filter((text) => text)
          .join("\n\n"),

        ability: translateCreatureAbility(tool.ability).label,
        type,
      };
    },
    [
      lang,
      localizeEquipment,
      localizeEquipmentName,
      ti,
      tpi,
      translateCreatureAbility,
      translateToolType,
    ],
  );
}

//------------------------------------------------------------------------------
// I18n Context
//------------------------------------------------------------------------------

const i18nContext = {
  "craft/*": {
    en: "##Craft##\r<1>",
    it: "##Creazioni##\r<1>",
  },
  "craft/0": {
    en: "",
    it: "",
  },
  "craft/1": {
    en: "##Craft##\r<1>",
    it: "##Creazione##\r<1>",
  },
  "subtitle.magic": {
    en: "<1>, Magic, <2>", // 1 = type, 2 = rarity
    it: "<1> Magico, <2>", // 1 = type, 2 = rarity
  },
  "utilize/*": {
    en: "##Utilize##\r<1>",
    it: "##Utilizzi##\r<1>",
  },
  "utilize/0": {
    en: "",
    it: "",
  },
  "utilize/1": {
    en: "##Utilize##\r<1>",
    it: "##Utilizzo##\r<1>",
  },
};
