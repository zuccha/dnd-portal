import { z } from "zod";
import { createTypeTranslationHooks } from "../type";

//------------------------------------------------------------------------------
// Creature Skill
//------------------------------------------------------------------------------

export const creatureSkillSchema = z.enum([
  "acrobatics",
  "animal_handling",
  "arcana",
  "athletics",
  "deception",
  "history",
  "insight",
  "intimidation",
  "investigation",
  "medicine",
  "nature",
  "perception",
  "performance",
  "persuasion",
  "religion",
  "sleigh_of_hand",
  "stealth",
  "survival",
]);

export const creatureSkills = creatureSkillSchema.options;

export type CreatureSkill = z.infer<typeof creatureSkillSchema>;

//------------------------------------------------------------------------------
// Creature Skill Hooks
//------------------------------------------------------------------------------

export const {
  useTranslate: useTranslateCreatureSkill,
  useTranslations: useCreatureSkillTranslations,
} = createTypeTranslationHooks(creatureSkills, {
  acrobatics: { en: "Acrobatics", it: "Acrobazia" },
  animal_handling: { en: "Animal Handling", it: "Addestrare Animali" },
  arcana: { en: "Arcana", it: "Arcano" },
  athletics: { en: "Athletics", it: "Atletica" },
  deception: { en: "Deception", it: "Inganno" },
  history: { en: "History", it: "Storia" },
  insight: { en: "Insight", it: "Intuizione" },
  intimidation: { en: "Intimidation", it: "Intimidire" },
  investigation: { en: "Investigation", it: "Indagare" },
  medicine: { en: "Medicine", it: "Medicina" },
  nature: { en: "Nature", it: "Natura" },
  perception: { en: "Perception", it: "Percezione" },
  performance: { en: "Performance", it: "Intrattenere" },
  persuasion: { en: "Persuasion", it: "Persuasione" },
  religion: { en: "Religion", it: "Religione" },
  sleigh_of_hand: { en: "Sleigh of Hand", it: "Rapidità di Mano" },
  stealth: { en: "Stealth", it: "Furtività" },
  survival: { en: "Survival", it: "Sopravvivenza" },
});
