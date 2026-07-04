import z from "zod";
import { i18nStringSchema } from "~/i18n/i18n-string";
import { creatureAbilitySchema } from "../../types/creature-ability";
import { creatureSkillSchema } from "../../types/creature-skill";
import {
  startingEquipmentEntrySchema,
  startingEquipmentFromEntries,
} from "../character-classes/starting-equipment";
import {
  type TranslationFields,
  defaultResource,
  resourceSchema,
  resourceTranslationFields,
} from "../resource";

//------------------------------------------------------------------------------
// Background
//------------------------------------------------------------------------------

export const backgroundSchema = resourceSchema
  .extend({
    ability_scores: z.array(creatureAbilitySchema),
    feat_id: z.uuid().nullable(),
    feat_notes: i18nStringSchema,
    kind: z.literal("background"),
    skill_proficiencies: z.array(creatureSkillSchema),
    starting_equipment_entries: z.array(startingEquipmentEntrySchema),
    tool_notes: i18nStringSchema,
    tool_proficiency_id: z.uuid().nullable(),
  })
  .transform(({ starting_equipment_entries, ...rest }) => ({
    ...rest,
    starting_equipment: startingEquipmentFromEntries(
      starting_equipment_entries,
    ),
  }));

export type Background = z.infer<typeof backgroundSchema>;

//------------------------------------------------------------------------------
// Default Background
//------------------------------------------------------------------------------

export const defaultBackground: Background = {
  ...defaultResource,
  ability_scores: [],
  feat_id: null,
  feat_notes: {},
  kind: "background",
  skill_proficiencies: [],
  starting_equipment: [],
  tool_notes: {},
  tool_proficiency_id: null,
};

//------------------------------------------------------------------------------
// Background Translation Fields
//------------------------------------------------------------------------------

export const backgroundTranslationFields: TranslationFields<Background>[] = [
  ...resourceTranslationFields,
  "feat_notes",
  "tool_notes",
];
