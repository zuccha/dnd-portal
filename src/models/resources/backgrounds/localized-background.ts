import { useCallback } from "react";
import z from "zod";
import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import { useFormatCp } from "~/measures/cost";
import { joinWith } from "~/ui/array";
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

      const feat = background.feat_id ? localizeFeatName(background.feat_id) : "";

      const skill_proficiencies = background.skill_proficiencies
        .map(translateCreatureSkill)
        .map(({ label }) => label)
        .sort()
        .join(", ");

      const tool_proficiency =
        background.tool_proficiency_id ?
          localizeToolName(background.tool_proficiency_id)
        : "";

      const starting_equipment = background.starting_equipment
        .map((group) => {
          const groupText = joinWith(
            group.options.map((option, index) => {
              const optionText = [
                ...option.bundle.equipments.map(({ id, quantity }) =>
                  tpi(
                    "equipment",
                    quantity,
                    localizeEquipmentName(id),
                    `${quantity}`,
                  ),
                ),
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
        [tp("ability_scores", background.ability_scores.length), ability_scores],
        [tp("skill_proficiencies", background.skill_proficiencies.length), skill_proficiencies],
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

