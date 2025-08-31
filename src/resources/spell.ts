import { z } from "zod";
import { i18nStringSchema } from "../i18n/i18n-string";
import { characterClassSchema } from "./character-class";
import { createResourceStore } from "./resource";
import { spellLevelSchema, spellLevelStringSchema } from "./spell-level";
import { spellSchoolSchema } from "./spell-school";

//------------------------------------------------------------------------------
// Spell
//------------------------------------------------------------------------------

export const spellSchema = z.object({
  id: z.uuid(),

  campaign_id: z.string(),
  campaign_name: z.string(),

  level: spellLevelSchema,

  character_classes: z.array(characterClassSchema),
  school: spellSchoolSchema,

  casting_time: z.string(),
  duration: z.string(),
  range_imp: z.string(),
  range_met: z.string(),

  concentration: z.boolean(),
  ritual: z.boolean(),

  material: z.boolean(),
  somatic: z.boolean(),
  verbal: z.boolean(),

  description: i18nStringSchema,
  materials: i18nStringSchema.optional(),
  name: i18nStringSchema,
  page: i18nStringSchema.optional(),
  upgrade: i18nStringSchema.optional(),
});

export type Spell = z.infer<typeof spellSchema>;

//------------------------------------------------------------------------------
// Spell Filters
//------------------------------------------------------------------------------

export const spellFiltersSchema = z.object({
  order_by: z.enum(["level", "name"]).default("name"),
  order_dir: z.enum(["asc", "desc"]).default("asc"),

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
// Spells Store
//------------------------------------------------------------------------------

export const spellsStore = createResourceStore(
  "spells",
  spellSchema,
  spellFiltersSchema
);

export const {
  useFromCampaign: useSpellsFromCampaign,
  useFilters: useSpellFilters,
  useNameFilter: useSpellNameFilter,
  useIsSelected: useIsSpellSelected,
  useSelectionCount: useSpellsSelectionCount,
} = spellsStore;
