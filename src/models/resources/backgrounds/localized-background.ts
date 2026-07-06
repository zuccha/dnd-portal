import { useCallback } from "react";
import z from "zod";
import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import { translate } from "~/i18n/i18n-string";
import { useFormatCp } from "~/measures/cost";
import { formatEquipmentNameWithNotes } from "~/models/other/equipment-bundle";
import { joinWith } from "~/utils/array";
import { numberToLetter } from "~/utils/number";
import { useTranslateCreatureAbility } from "../../types/creature-ability";
import { useTranslateCreatureSkill } from "../../types/creature-skill";
import { equipmentStore } from "../equipment/equipment-store";
import { toolStore } from "../equipment/tools/tool-store";
import { featStore } from "../feats/feat-store";
import {
  formatDetails,
  formatInfo,
  localizedResourceSchema,
  useLocalizeResource,
} from "../localized-resource";
import { type Background, backgroundSchema } from "./background";

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
// Use Localized Background
//------------------------------------------------------------------------------

export function useLocalizeBackground(
  sourceId: string,
): (background: Background) => LocalizedBackground {
  const { lang, t, ti, tp, tpi } = useI18nLangContext(i18nContext);
  const localizeResource = useLocalizeResource<Background>();
  const translateCreatureAbility = useTranslateCreatureAbility(lang);
  const translateCreatureSkill = useTranslateCreatureSkill(lang);
  const localizeEquipmentName = equipmentStore.useLocalizeResourceName(
    sourceId,
    lang,
  );
  const localizeFeatName = featStore.useLocalizeResourceName(sourceId, lang);
  const localizeToolName = toolStore.useLocalizeResourceName(sourceId, lang);
  const formatCp = useFormatCp();

  return useCallback(
    (background: Background): LocalizedBackground => {
      const equipmentOptionOr = t("equipment.option.or");

      const ability_scores = background.ability_scores
        .map(translateCreatureAbility)
        .map(({ label }) => label)
        .join(", ");

      const feat_name =
        background.feat_id ? localizeFeatName(background.feat_id) : "";
      const feat_notes = translate(background.feat_notes, lang);
      const feat = formatNamedNote(feat_name, feat_notes);

      const skill_proficiencies = background.skill_proficiencies
        .map(translateCreatureSkill)
        .map(({ label }) => label)
        .sort()
        .join(", ");

      const tool_name =
        background.tool_proficiency_id ?
          localizeToolName(background.tool_proficiency_id)
        : "";
      const tool_notes = translate(background.tool_notes, lang);
      const tool_proficiency = formatNamedNote(tool_name, tool_notes);

      const starting_equipment = background.starting_equipment
        .map((group) => {
          const groupText = joinWith(
            group.options.map((option, index) => {
              const optionText = [
                ...option.bundle.equipments.map(({ id, notes, quantity }) => {
                  const name = localizeEquipmentName(id);
                  const name2 = formatEquipmentNameWithNotes(name, notes, lang);
                  return tpi("equipment", quantity, name2, `${quantity}`);
                }),
                option.bundle.currency ? formatCp(option.bundle.currency) : "",
              ]
                .filter((entry) => entry)
                .join(", ");
              return group.options.length > 1 ?
                  `(${numberToLetter(index)}) ${optionText}`
                : optionText;
            }),
            "; ",
            equipmentOptionOr,
          );

          return tpi(
            "starting_equipment.group",
            group.options.length,
            groupText,
          );
        })
        .filter((text) => text)
        .join("\n");

      const info = formatInfo([
        [
          tp("ability_scores", background.ability_scores.length),
          ability_scores,
        ],
        [
          tp("skill_proficiencies", background.skill_proficiencies.length),
          skill_proficiencies,
        ],
        [t("feat"), feat],
        [t("tool_proficiency"), tool_proficiency],
      ]);

      return {
        ...localizeResource(background),
        descriptor: t("descriptor"),
        details: formatDetails(
          starting_equipment ?
            ti("starting_equipment", starting_equipment)
          : "",
        ),

        ability_scores,
        feat,
        info,
        skill_proficiencies,
        starting_equipment,
        tool_proficiency,
      };
    },
    [
      formatCp,
      lang,
      localizeEquipmentName,
      localizeFeatName,
      localizeResource,
      localizeToolName,
      t,
      ti,
      tp,
      tpi,
      translateCreatureAbility,
      translateCreatureSkill,
    ],
  );
}

//------------------------------------------------------------------------------
// Format Named NOte
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
