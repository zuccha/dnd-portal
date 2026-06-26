import { appendI18nString, composeI18nString } from "~/i18n/i18n-string";
import {
  type EquipmentRarity,
  equipmentRarities,
} from "~/models/types/equipment-rarity";
import type { EquipmentModifier } from "../modifiers/equipment/equipment-modifier";
import type { VirtualResourceRecipe } from "../resource-store";
import type { Equipment } from "./equipment";

//------------------------------------------------------------------------------
// Add Equipment Variant
//------------------------------------------------------------------------------

export function addEquipmentVariant<E extends Equipment>(
  addRecipe: (recipe: VirtualResourceRecipe<E>) => void,
  base: E,
  modifiers: EquipmentModifier[],
): void {
  if (base.virtual) return;
  if (modifiers.length === 0) return;

  const baseId = base.variant_base_id ?? base.id;
  const modifierIds = modifiers.map(({ id }) => id);

  addRecipe({
    base_id: baseId,
    derive: (currentBase, id) =>
      createEquipmentVariant(currentBase, modifiers, id),
    modifier_ids: modifierIds,
    source_id: base.source_id,
  });
}

//------------------------------------------------------------------------------
// Has Available Equipment Modifier
//------------------------------------------------------------------------------

export function hasAvailableEquipmentModifier(equipment: Equipment): boolean {
  if (equipment.virtual) return false;
  return !!getFirstAvailableModifierId(equipment);
}

//------------------------------------------------------------------------------
// Create Equipment Variant
//------------------------------------------------------------------------------

export function createEquipmentVariant<E extends Equipment>(
  base: E,
  modifiers: EquipmentModifier[],
  id: string,
): E {
  const modifierIds = modifiers.map(({ id }) => id);

  return {
    ...base,
    attunement_notes: modifiers.reduce(
      (notes, modifier) =>
        appendI18nString(notes, modifier.attunement_notes_delta, "; "),
      base.attunement_notes,
    ),
    cost:
      (base.cost ?? 0) +
      modifiers.reduce((total, modifier) => total + modifier.cost_delta, 0),
    id,
    magic: base.magic || modifiers.some(({ make_magic }) => make_magic),
    name: modifiers.reduce(
      (name, modifier) =>
        composeI18nString(modifier.composite_name, name, "{1}"),
      base.name,
    ),
    name_short: modifiers.reduce(
      (name, modifier) =>
        composeI18nString(modifier.composite_name, name, "{1}"),
      Object.keys(base.name_short).length ? base.name_short : base.name,
    ),
    notes: modifiers.reduce(
      (notes, modifier) =>
        appendI18nString(notes, modifier.notes_delta, "\n\n"),
      base.notes,
    ),
    rarity: modifiers.reduce(
      (rarity, modifier) =>
        getMaxEquipmentRarity(rarity, modifier.rarity_minimum),
      base.rarity,
    ),
    required_attunement_slots: Math.max(
      base.required_attunement_slots,
      ...modifiers.map(
        ({ required_attunement_slots_minimum }) =>
          required_attunement_slots_minimum,
      ),
    ),
    variant_base_id: base.variant_base_id ?? base.id,
    variant_modifier_ids: [
      ...(base.variant_modifier_ids ?? []),
      ...modifierIds,
    ],
    virtual: true,
    weight:
      (base.weight ?? 0) +
      modifiers.reduce((total, modifier) => total + modifier.weight_delta, 0),
  };
}

//------------------------------------------------------------------------------
// Get First Available Modifier Id
//------------------------------------------------------------------------------

function getFirstAvailableModifierId(equipment: Equipment): string | undefined {
  return equipment.modifier_ids.find(
    (id) => !(equipment.variant_modifier_ids ?? []).includes(id),
  );
}

//------------------------------------------------------------------------------
// Equipment Rarity Utils
//------------------------------------------------------------------------------

function getMaxEquipmentRarity(
  a: EquipmentRarity,
  b: EquipmentRarity,
): EquipmentRarity {
  return equipmentRarities.indexOf(a) >= equipmentRarities.indexOf(b) ? a : b;
}
