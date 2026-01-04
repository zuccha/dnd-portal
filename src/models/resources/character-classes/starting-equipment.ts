import z from "zod";
import { compareObjects } from "~/utils/object";
import {
  type EquipmentBundle,
  equipmentBundleSchema,
} from "../../other/equipment-bundle";

//------------------------------------------------------------------------------
// Starting Equipment Entry
//------------------------------------------------------------------------------

export const startingEquipmentEntrySchema = z.object({
  choice_group: z.number(),
  choice_option: z.number(),
  equipment_id: z.uuid().nullable(),
  quantity: z.number(),
});

export type StartingEquipmentEntry = z.infer<
  typeof startingEquipmentEntrySchema
>;

//------------------------------------------------------------------------------
// Starting Equipment Option
//------------------------------------------------------------------------------

export const startingEquipmentOptionSchema = z.object({
  bundle: equipmentBundleSchema,
  option: z.number(),
});

export type StartingEquipmentOption = z.infer<
  typeof startingEquipmentOptionSchema
>;

//------------------------------------------------------------------------------
// Starting Equipment Group
//------------------------------------------------------------------------------

export const startingEquipmentGroupSchema = z.object({
  group: z.number(),
  options: z.array(startingEquipmentOptionSchema),
});

export type StartingEquipmentGroup = z.infer<
  typeof startingEquipmentGroupSchema
>;

//------------------------------------------------------------------------------
// Starting Equipment From Entries
//------------------------------------------------------------------------------

export function startingEquipmentFromEntries(
  entries: StartingEquipmentEntry[],
): StartingEquipmentGroup[] {
  // group -> (option -> equipment bundle)
  const groups = new Map<number, Map<number, EquipmentBundle>>();
  const createBundle = () => ({ currency: 0, equipments: [] });

  for (const entry of entries) {
    const { choice_group, choice_option, equipment_id, quantity } = entry;

    if (!groups.has(choice_group)) groups.set(choice_group, new Map());
    const group = groups.get(choice_group)!;

    if (!group.has(choice_option)) group.set(choice_option, createBundle());
    const option = group.get(choice_option)!;

    if (equipment_id) {
      const index = option.equipments.findIndex((e) => e.id === equipment_id);
      if (index === -1) {
        option.equipments.push({ id: equipment_id, quantity });
      } else {
        const equipment = option.equipments[index]!;
        option.equipments[index] = {
          ...equipment,
          quantity: equipment.quantity + quantity,
        };
      }
    } else {
      option.currency += quantity;
    }
  }

  return [...groups.entries()]
    .map(([group, options]) => ({
      group,
      options: [...options.entries()]
        .map(([option, bundle]) => ({
          bundle,
          option,
        }))
        .sort(compareObjects("option")),
    }))
    .sort(compareObjects("group"));
}

//------------------------------------------------------------------------------
// Starting Equipment To Entries
//------------------------------------------------------------------------------

export function startingEquipmentToEntries(
  groups: StartingEquipmentGroup[],
): StartingEquipmentEntry[] {
  const entries: StartingEquipmentEntry[] = [];

  for (const group of groups) {
    for (const option of group.options) {
      const { currency, equipments } = option.bundle;

      if (currency) {
        entries.push({
          choice_group: group.group,
          choice_option: option.option,
          equipment_id: null,
          quantity: currency,
        });
      }

      for (const equipment of equipments) {
        entries.push({
          choice_group: group.group,
          choice_option: option.option,
          equipment_id: equipment.id,
          quantity: equipment.quantity,
        });
      }
    }
  }

  return entries;
}
