import z from "zod";
import {
  type I18nString,
  i18nStringSchema,
  translate,
} from "~/i18n/i18n-string";

//------------------------------------------------------------------------------
// Equipment Bundle
//------------------------------------------------------------------------------

export const equipmentBundleSchema = z.object({
  currency: z.number(),
  equipments: z.array(
    z.object({
      id: z.uuid(),
      notes: i18nStringSchema.default({}),
      quantity: z.number(),
    }),
  ),
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
// Equipment Entry
//------------------------------------------------------------------------------

export const equipmentEntrySchema = z.object({
  equipment_id: z.uuid().nullable(),
  notes: i18nStringSchema.default({}),
  quantity: z.number(),
});

export type EquipmentEntry = z.infer<typeof equipmentEntrySchema>;

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

//------------------------------------------------------------------------------
// Equipment Bundle From Entries
//------------------------------------------------------------------------------

export function equipmentBundleFromEntries(
  entries: EquipmentEntry[],
): EquipmentBundle {
  const bundle: EquipmentBundle = { currency: 0, equipments: [] };

  for (const entry of entries) {
    const id = entry.equipment_id;
    if (id) {
      const index = bundle.equipments.findIndex((e) => e.id === id);
      if (index === -1) {
        bundle.equipments.push({
          id,
          notes: entry.notes,
          quantity: entry.quantity,
        });
      } else {
        const equipment = bundle.equipments[index]!;
        bundle.equipments[index] = {
          ...equipment,
          quantity: equipment.quantity + entry.quantity,
        };
      }
    } else {
      bundle.currency += entry.quantity;
    }
  }

  return bundle;
}

//------------------------------------------------------------------------------
// Equipment Bundle To Entries
//------------------------------------------------------------------------------

export function equipmentBundleToEntries(
  bundle: EquipmentBundle,
): EquipmentEntry[] {
  const entries: EquipmentEntry[] = [];

  const { currency, equipments } = bundle;
  if (currency)
    entries.push({ equipment_id: null, notes: {}, quantity: currency });
  for (const equipment of equipments)
    entries.push({
      equipment_id: equipment.id,
      notes: equipment.notes,
      quantity: equipment.quantity,
    });

  return entries;
}
