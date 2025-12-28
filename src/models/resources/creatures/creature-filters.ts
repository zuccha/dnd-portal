import { z } from "zod";
import { creatureAlignmentSchema } from "../../types/creature-alignment";
import { creatureHabitatSchema } from "../../types/creature-habitat";
import { creatureSizeSchema } from "../../types/creature-size";
import { creatureTreasureSchema } from "../../types/creature-treasure";
import { creatureTypeSchema } from "../../types/creature-type";
import { resourceFiltersSchema } from "../resource-filters";

//------------------------------------------------------------------------------
// Creature Filters
//------------------------------------------------------------------------------

export const creatureFiltersSchema = resourceFiltersSchema.extend({
  alignment: z
    .partialRecord(creatureAlignmentSchema, z.boolean().optional())
    .optional(),
  habitats: z
    .partialRecord(creatureHabitatSchema, z.boolean().optional())
    .optional(),
  size: z.partialRecord(creatureSizeSchema, z.boolean().optional()).optional(),
  treasures: z
    .partialRecord(creatureTreasureSchema, z.boolean().optional())
    .optional(),
  types: z.partialRecord(creatureTypeSchema, z.boolean().optional()).optional(),

  cr_max: z.number(),
  cr_min: z.number(),
});

export type CreatureFilters = z.infer<typeof creatureFiltersSchema>;

//------------------------------------------------------------------------------
// Default Creature Filters
//------------------------------------------------------------------------------

export const defaultCreatureFilters: CreatureFilters = {
  name: "",
  order_by: "name",
  order_dir: "asc",

  alignment: {},
  habitats: {},
  size: {},
  treasures: {},
  types: {},

  cr_max: 30,
  cr_min: 0,
};
