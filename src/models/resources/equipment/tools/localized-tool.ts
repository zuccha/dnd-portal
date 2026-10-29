import { useMemo } from "react";
import z from "zod";
import { translate } from "~/i18n/i18n-string";
import { heading } from "~/ui/rich-text-page";
import { useTranslateCreatureAbility } from "../../../types/creature-ability";
import { useTranslateToolType } from "../../../types/tool-type";
import { formatDescription, localizedFieldSchema } from "../../localized-resource";
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
  ability: localizedFieldSchema,
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

export function useToolLocalizationContext(
  tool: Tool,
  related: Parameters<typeof useEquipmentLocalizationContext>[1],
): ToolLocalizationContext {
  const context = useEquipmentLocalizationContext(tool, related, i18nContext);
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
    descriptor: tool.is_magic ? context.ti("subtitle.magic", type, equipment.rarity.value) : type,
    description: formatDescription(
      context.tpi("utilize", utilizeCount, utilize),
      context.tpi("craft", tool.craft_ids.length, craft),
      equipment.description && context.ti("description", equipment.description),
    ),

    ability: {
      label: context.t("ability"),
      value: context.translateCreatureAbility(tool.ability),
    },
    type,
  };
}

//------------------------------------------------------------------------------
// I18n Context
//------------------------------------------------------------------------------

const i18nContext = {
  "ability": {
    en: "Ability",
    it: "Abilità",
  },
  "craft/*": {
    en: heading("Craft\r<1>"),
    it: heading("Creazioni\r<1>"),
  },
  "craft/0": {
    en: "",
    it: "",
  },
  "craft/1": {
    en: heading("Craft\r<1>"),
    it: heading("Creazione\r<1>"),
  },
  "description": {
    en: heading("Description\r<1>"),
    it: heading("Descrizione\r<1>"),
  },
  "subtitle.magic": {
    en: "<1>, Magic, <2>", // 1 = type, 2 = rarity
    it: "<1> Magico, <2>", // 1 = type, 2 = rarity
  },
  "utilize/*": {
    en: heading("Utilize\r<1>"),
    it: heading("Utilizzi\r<1>"),
  },
  "utilize/0": {
    en: "",
    it: "",
  },
  "utilize/1": {
    en: heading("Utilize\r<1>"),
    it: heading("Utilizzo\r<1>"),
  },
};
