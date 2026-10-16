import { useMemo } from "react";
import z from "zod";
import { translate } from "~/i18n/i18n-string";
import { useFormatCp } from "~/measures/cost";
import { formatEquipmentNameWithNotes } from "~/models/other/equipment-bundle";
import { joinWith } from "~/utils/array";
import { numberToLetter } from "~/utils/number";
import { nilUuid } from "~/utils/uuid";
import { useTranslateCreatureAbility } from "../../types/creature-ability";
import { useTranslateCreatureSkill } from "../../types/creature-skill";
import { equipmentReferenceStore } from "../equipment/equipment-reference-store";
import { toolStore } from "../equipment/tools/tool-store";
import { featStore } from "../feats/feat-store";
import {
  type ResourceLocalizationContext,
  formatDetails,
  localizeResource,
  localizedFieldSchema,
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
  abilityScores: localizedFieldSchema,
  feat: localizedFieldSchema.extend({
    id: z.uuid().nullable(),
    linkText: z.string(),
    notes: z.string(),
  }),
  skillProficiencies: localizedFieldSchema,
  startingEquipment: z.string(),
  toolProficiency: localizedFieldSchema.extend({
    id: z.uuid().nullable(),
    linkText: z.string(),
    notes: z.string(),
  }),
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
  const localizedFeatName = useLocalizedFeatName(background.feat_id ?? nilUuid);
  const localizedToolName = useLocalizedToolName(background.tool_proficiency_id ?? nilUuid);
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

  const abilityScores = background.ability_scores.map(context.translateCreatureAbility).join(", ");

  const feat_name = background.feat_id ? context.localizedFeatName : "";
  const feat_notes = translate(background.feat_notes, context.lang);
  const featValue = formatNamedNote(feat_name, feat_notes);

  const skillProficiencies = background.skill_proficiencies
    .map(context.translateCreatureSkill)
    .sort()
    .join(", ");

  const tool_name = background.tool_proficiency_id ? context.localizedToolName : "";
  const tool_notes = translate(background.tool_notes, context.lang);
  const toolProficiencyValue = formatNamedNote(tool_name, tool_notes);

  const startingEquipment = background.starting_equipment
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

  return {
    ...localizeResource(background, context),
    descriptor: context.t("descriptor"),
    details: formatDetails(
      startingEquipment ? context.ti("starting_equipment", startingEquipment) : "",
    ),

    abilityScores: {
      label: context.tp("ability_scores", background.ability_scores.length),
      value: abilityScores,
    },
    feat: {
      id: background.feat_id,
      label: context.t("feat"),
      linkText: feat_name,
      notes: feat_notes,
      value: featValue,
    },
    skillProficiencies: {
      label: context.tp("skill_proficiencies", background.skill_proficiencies.length),
      value: skillProficiencies,
    },
    startingEquipment,
    toolProficiency: {
      id: background.tool_proficiency_id,
      label: context.t("tool_proficiency"),
      linkText: tool_name,
      notes: tool_notes,
      value: toolProficiencyValue,
    },
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
