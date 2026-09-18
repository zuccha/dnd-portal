import { useMemo } from "react";
import z from "zod";
import { translate } from "~/i18n/i18n-string";
import { useFormatCp } from "~/measures/cost";
import { formatEquipmentNameWithNotes } from "~/models/other/equipment-bundle";
import { joinWith } from "~/utils/array";
import { numberToLetter } from "~/utils/number";
import { useTranslateCreatureAbility } from "../../types/creature-ability";
import { useTranslateCreatureSkill } from "../../types/creature-skill";
import { equipmentReferenceStore } from "../equipment/equipment-reference-store";
import { toolStore } from "../equipment/tools/tool-store";
import { featStore } from "../feats/feat-store";
import {
  type ResourceLocalizationContext,
  formatDetails,
  formatInfo,
  localizeResource,
  localizedResourceSchema,
  useResourceLocalizationContext,
} from "../localized-resource";
import { type Background, backgroundSchema } from "./background";

const useLocalizedEquipmentNames = equipmentReferenceStore.useLocalizedEquipmentNames;
const useLocalizedFeatName = featStore.useLocalizedResourceName;
const useLocalizedToolName = toolStore.useLocalizedResourceName;

//------------------------------------------------------------------------------
// Localized Background
//------------------------------------------------------------------------------

export const localizedBackgroundSchema = localizedResourceSchema(
  backgroundSchema,
  z.literal("background"),
).extend({
  ability_scores: z.string(),
  feat: z.string(),
  info: z.string(),
  skill_proficiencies: z.string(),
  starting_equipment: z.string(),
  tool_proficiency: z.string(),
});

export type LocalizedBackground = z.infer<typeof localizedBackgroundSchema>;

//------------------------------------------------------------------------------
// Background Localization Context
//------------------------------------------------------------------------------

type BackgroundLocalizationContext = ResourceLocalizationContext & {
  formatCp: ReturnType<typeof useFormatCp>;
  localizedEquipmentNames: Record<string, string>;
  localizedFeatName: string;
  localizedToolName: string;
  translateCreatureAbility: ReturnType<typeof useTranslateCreatureAbility>;
  translateCreatureSkill: ReturnType<typeof useTranslateCreatureSkill>;
};

//------------------------------------------------------------------------------
// Use Background Localization Context
//------------------------------------------------------------------------------

export function useBackgroundLocalizationContext(
  background: Background,
): BackgroundLocalizationContext {
  const context = useResourceLocalizationContext(i18nContext);
  const formatCp = useFormatCp();
  const localizedEquipmentNames = useLocalizedEquipmentNames(context.lang);
  const localizedFeatName = useLocalizedFeatName(background.feat_id ?? "");
  const localizedToolName = useLocalizedToolName(background.tool_proficiency_id ?? "");
  const translateCreatureAbility = useTranslateCreatureAbility(context.lang);
  const translateCreatureSkill = useTranslateCreatureSkill(context.lang);

  return useMemo(
    () => ({
      ...context,
      formatCp,
      localizedEquipmentNames,
      localizedFeatName,
      localizedToolName,
      translateCreatureAbility,
      translateCreatureSkill,
    }),
    [
      context,
      formatCp,
      localizedEquipmentNames,
      localizedFeatName,
      localizedToolName,
      translateCreatureAbility,
      translateCreatureSkill,
    ],
  );
}

//------------------------------------------------------------------------------
// Localize Background
//------------------------------------------------------------------------------

export function localizeBackground(
  background: Background,
  context: BackgroundLocalizationContext,
): LocalizedBackground {
  const equipmentOptionOr = context.t("equipment.option.or");

  const ability_scores = background.ability_scores.map(context.translateCreatureAbility).join(", ");

  const feat_name = background.feat_id ? context.localizedFeatName : "";
  const feat_notes = translate(background.feat_notes, context.lang);
  const feat = formatNamedNote(feat_name, feat_notes);

  const skill_proficiencies = background.skill_proficiencies
    .map(context.translateCreatureSkill)
    .sort()
    .join(", ");

  const tool_name = background.tool_proficiency_id ? context.localizedToolName : "";
  const tool_notes = translate(background.tool_notes, context.lang);
  const tool_proficiency = formatNamedNote(tool_name, tool_notes);

  const starting_equipment = background.starting_equipment
    .map((group) => {
      const groupText = joinWith(
        group.map((option, index) => {
          const optionText = [
            ...option.equipments.map(({ id, notes, quantity }) => {
              const name = context.localizedEquipmentNames[id] ?? "";
              const name2 = formatEquipmentNameWithNotes(name, notes, context.lang);
              return context.tpi("equipment", quantity, name2, `${quantity}`);
            }),
            option.currency ? context.formatCp(option.currency) : "",
          ]
            .filter((entry) => entry)
            .join(", ");
          return group.length > 1 ? `(${numberToLetter(index)}) ${optionText}` : optionText;
        }),
        "; ",
        equipmentOptionOr,
      );

      return context.tpi("starting_equipment.group", group.length, groupText);
    })
    .filter((text) => text)
    .join("\n");

  const info = formatInfo([
    [context.tp("ability_scores", background.ability_scores.length), ability_scores],
    [context.tp("skill_proficiencies", background.skill_proficiencies.length), skill_proficiencies],
    [context.t("feat"), feat],
    [context.t("tool_proficiency"), tool_proficiency],
  ]);

  return {
    ...localizeResource(background, context),
    descriptor: context.t("descriptor"),
    details: formatDetails(
      starting_equipment ? context.ti("starting_equipment", starting_equipment) : "",
    ),

    ability_scores,
    feat,
    info,
    skill_proficiencies,
    starting_equipment,
    tool_proficiency,
  };
}

//------------------------------------------------------------------------------
// Format Named Note
//------------------------------------------------------------------------------

function formatNamedNote(name: string, note: string): string {
  if (name && note) return `${name} (${note})`;
  return name || note;
}

//------------------------------------------------------------------------------
// I18n Context
//------------------------------------------------------------------------------

const i18nContext = {
  "ability_scores/*": {
    en: "Ability Scores",
    it: "Punteggi di Caratteristica",
  },
  "ability_scores/1": {
    en: "Ability Score",
    it: "Punteggio di Caratteristica",
  },
  "descriptor": {
    en: "Background",
    it: "Background",
  },
  "equipment.option.or": {
    en: "; or ",
    it: "; o ",
  },
  "equipment/*": {
    en: "<1> (<2>)",
    it: "<1> (<2>)",
  },
  "equipment/1": {
    en: "<1>",
    it: "<1>",
  },
  "feat": {
    en: "Feat",
    it: "Talento",
  },
  "skill_proficiencies/*": {
    en: "Skills",
    it: "Abilità",
  },
  "skill_proficiencies/1": {
    en: "Skill",
    it: "Abilità",
  },
  "starting_equipment": {
    en: "##Equipment##\r<1>",
    it: "##Equipaggiamento##\r<1>",
  },
  "starting_equipment.group/*": {
    en: "<1>",
    it: "<1>",
  },
  "starting_equipment.group/0": {
    en: "",
    it: "",
  },
  "starting_equipment.group/1": {
    en: "<1>",
    it: "<1>",
  },
  "tool_proficiency": {
    en: "Tool",
    it: "Strumento",
  },
};
