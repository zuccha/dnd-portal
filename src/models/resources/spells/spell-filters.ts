import { z } from "zod";
import type { I18nString } from "~/i18n/i18n-string";
import { spellLevelStringSchema } from "../../types/spell-level";
import { spellSchoolSchema } from "../../types/spell-school";
import {
  resourceFiltersSchema,
  resourceOrderOptions,
} from "../resource-filters";

//------------------------------------------------------------------------------
// Spell Order Options
//------------------------------------------------------------------------------

export const spellOrderOptions: { label: I18nString; value: string }[] = [
  ...resourceOrderOptions,
  {
    label: {
      en: "Sort by Level (0-9)",
      it: "Ordina per Livello (0-9)",
    },
    value: "level.asc",
  },
  {
    label: {
      en: "Sort by Level (9-0)",
      it: "Ordina per Livello (9-0)",
    },
    value: "level.desc",
  },
];

//------------------------------------------------------------------------------
// Spell Filters
//------------------------------------------------------------------------------

export const spellFiltersSchema = resourceFiltersSchema.extend({
  character_class_ids: z
    .partialRecord(z.uuid(), z.boolean().optional())
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
