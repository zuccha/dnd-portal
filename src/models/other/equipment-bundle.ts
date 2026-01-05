import z from "zod";

//------------------------------------------------------------------------------
// Equipment Bundle
//------------------------------------------------------------------------------

export const equipmentBundleSchema = z.object({
  currency: z.number(),
  equipments: z.array(z.object({ id: z.uuid(), quantity: z.number() })),
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
  quantity: z.number(),
});

export type EquipmentEntry = z.infer<typeof equipmentEntrySchema>;

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
        bundle.equipments.push({ id, quantity: entry.quantity });
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
  if (currency) entries.push({ equipment_id: null, quantity: currency });
  for (const equipment of equipments)
    entries.push({ equipment_id: equipment.id, quantity: equipment.quantity });

  return entries;
}
