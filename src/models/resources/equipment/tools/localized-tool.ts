import { useMemo } from "react";
import z from "zod";
import { translate } from "~/i18n/i18n-string";
import { useTranslateCreatureAbility } from "../../../types/creature-ability";
import { useTranslateToolType } from "../../../types/tool-type";
import { equipmentReferenceStore } from "../equipment-reference-store";
import {
  type EquipmentLocalizationContext,
  localizeEquipment,
  localizedEquipmentSchema,
  useEquipmentLocalizationContext,
} from "../localized-equipment";
import { type Tool, toolSchema } from "./tool";

const useLocalizedEquipmentNames = equipmentReferenceStore.useLocalizedEquipmentNames;

//------------------------------------------------------------------------------
// Localized Tool
//------------------------------------------------------------------------------

export const localizedToolSchema = localizedEquipmentSchema(toolSchema, z.literal("tool")).extend({
  ability: z.string(),
  type: z.string(),
});

export type LocalizedTool = z.infer<typeof localizedToolSchema>;

//------------------------------------------------------------------------------
// Tool Localization Context
//------------------------------------------------------------------------------

type ToolLocalizationContext = EquipmentLocalizationContext & {
  localizedEquipmentNames: Record<string, string>;
  translateCreatureAbility: ReturnType<typeof useTranslateCreatureAbility>;
  translateToolType: ReturnType<typeof useTranslateToolType>;
};

//------------------------------------------------------------------------------
// Use Tool Localization Context
//------------------------------------------------------------------------------

export function useToolLocalizationContext(tool: Tool): ToolLocalizationContext {
  const context = useEquipmentLocalizationContext(tool, i18nContext);
  const translateCreatureAbility = useTranslateCreatureAbility(context.lang);
  const translateToolType = useTranslateToolType(context.lang);
  const localizedEquipmentNames = useLocalizedEquipmentNames(context.lang);

  return useMemo(
    () => ({
      ...context,
      localizedEquipmentNames,
      translateCreatureAbility,
      translateToolType,
    }),
    [context, localizedEquipmentNames, translateCreatureAbility, translateToolType],
  );
}

//------------------------------------------------------------------------------
// Localize Tool
//------------------------------------------------------------------------------

export function localizeTool(tool: Tool, context: ToolLocalizationContext): LocalizedTool {
  const equipment = localizeEquipment(tool, context);
  const type = context.translateToolType(tool.type);
  const craft =
    tool.craft_ids
      .map((id) => context.localizedEquipmentNames[id] ?? "")
      .sort()
      .join(", ") + ".";
  const utilize = translate(tool.utilize, context.lang);
  const utilizeCount = utilize ? (utilize.includes(",") ? 2 : 1) : 0;

  return {
    ...equipment,
    descriptor: tool.magic ? context.ti("subtitle.magic", type, equipment.rarity) : type,
    details: [
      context.tpi("utilize", utilizeCount, utilize),
      context.tpi("craft", tool.craft_ids.length, craft),
      equipment.details,
    ]
      .filter((text) => text)
      .join("\n\n"),
    ability: context.translateCreatureAbility(tool.ability),
    type,
  };
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
