import { z } from "zod";
import { distanceImpSchema, distanceMetSchema } from "../i18n/i18n-distance";
import { i18nStringSchema } from "../i18n/i18n-string";
import { timeSchema } from "../i18n/i18n-time";
import { characterClassSchema } from "./character-class";
import { createResourceStore } from "./resource";
import { spellCastingTimeSchema } from "./spell-casting-time";
import { spellDurationSchema } from "./spell-duration";
import { spellLevelSchema, spellLevelStringSchema } from "./spell-level";
import { spellRangeSchema } from "./spell-range";
import { spellSchoolSchema } from "./spell-school";

//------------------------------------------------------------------------------
// Spell
//------------------------------------------------------------------------------

export const spellSchema = z.object({
  id: z.uuid(),

  campaign_id: z.string(),
  campaign_name: z.string(),

  name: i18nStringSchema,
  page: i18nStringSchema.nullish(),

  level: spellLevelSchema,

  character_classes: z.array(characterClassSchema),
  school: spellSchoolSchema,

  casting_time: spellCastingTimeSchema,
  casting_time_value: timeSchema.nullish(),

  duration: spellDurationSchema,
  duration_value: timeSchema.nullish(),

  range: spellRangeSchema,
  range_value_imp: distanceImpSchema.nullish(),
  range_value_met: distanceMetSchema.nullish(),

  concentration: z.boolean(),
  ritual: z.boolean(),

  material: z.boolean(),
  somatic: z.boolean(),
  verbal: z.boolean(),

  materials: i18nStringSchema.nullish(),

  description: i18nStringSchema,
  upgrade: i18nStringSchema.nullish(),
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
// Default Spell
//------------------------------------------------------------------------------

export const defaultSpell: Spell = {
  id: "",

  campaign_id: "",
  campaign_name: "",

  name: {},
  page: {},

  level: 0,

  character_classes: [],
  school: "abjuration",

  casting_time: "action",
  casting_time_value: undefined,

  duration: "instantaneous",
  duration_value: undefined,

  range: "self",
  range_value_imp: undefined,
  range_value_met: undefined,

  concentration: false,
  ritual: false,

  material: false,
  somatic: false,
  verbal: false,

  materials: undefined,

  description: {},
  upgrade: {},
};

//------------------------------------------------------------------------------
// Spells Store
//------------------------------------------------------------------------------

export const spellsStore = createResourceStore(
  { p: "spells", s: "spell" },
  spellSchema,
  spellFiltersSchema
);

export const {
  useFromCampaign: useSpellsFromCampaign,
  useFilters: useSpellFilters,
  useNameFilter: useSpellNameFilter,
  useIsSelected: useIsSpellSelected,
  useSelectionCount: useSpellsSelectionCount,
  create: createSpell,
  update: updateSpell,
} = spellsStore;
