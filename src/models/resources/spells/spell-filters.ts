import { z } from "zod";
import { characterClassSchema } from "../../types/character-class";
import { spellLevelStringSchema } from "../../types/spell-level";
import { spellSchoolSchema } from "../../types/spell-school";
import { resourceFiltersSchema } from "../resource-filters";

//------------------------------------------------------------------------------
// Spell Filters
//------------------------------------------------------------------------------

export const spellFiltersSchema = resourceFiltersSchema.extend({
  character_classes: z
    .partialRecord(characterClassSchema, z.boolean().optional())
    .optional(),
  levels: z
    .partialRecord(spellLevelStringSchema, z.boolean().optional())
    .optional(),
  schools: z
    .partialRecord(spellSchoolSchema, z.boolean().optional())
    .optional(),

  concentration: z.boolean().optional(),
  ritual: z.boolean().optional(),

  material: z.boolean().optional(),
  somatic: z.boolean().optional(),
  verbal: z.boolean().optional(),
});

export type SpellFilters = z.infer<typeof spellFiltersSchema>;

//------------------------------------------------------------------------------
// Default Spell Filters
//------------------------------------------------------------------------------

export const defaultSpellFilters: SpellFilters = {
  name: "",
  order_by: "name",
  order_dir: "asc",
};
