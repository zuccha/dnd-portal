import z from "zod";
import { type I18nString, i18nStringSchema, translate } from "~/i18n/i18n-string";

//------------------------------------------------------------------------------
// Equipment Bundle
//------------------------------------------------------------------------------

export const equipmentBundleSchema = z.object({
  currency: z.number().default(0),
  equipments: z
    .array(
      z.object({
        id: z.uuid(),
        notes: i18nStringSchema.default({}),
        quantity: z.number(),
      }),
    )
    .default([]),
});

export type EquipmentBundle = z.infer<typeof equipmentBundleSchema>;

//------------------------------------------------------------------------------
// Default Equipment Bundle
//------------------------------------------------------------------------------

export const defaultEquipmentBundle = {
  currency: 0,
  equipments: [],
};

//------------------------------------------------------------------------------
// Format Equipment Name With Notes
//------------------------------------------------------------------------------

export function formatEquipmentNameWithNotes(
  name: string,
  notes: I18nString,
  lang: string,
): string {
  const text = translate(notes, lang);
  return name && text ? `${name} (${text})` : name || text;
}
