import { z } from "zod";
import { campaignRoleSchema } from "~/models/types/campaign-role";
import { damageTypeSchema } from "~/models/types/damage-type";
import { equipmentRaritySchema } from "~/models/types/equipment-rarity";
import { weaponMasterySchema } from "~/models/types/weapon-mastery";
import { weaponPropertySchema } from "~/models/types/weapon-property";
import { weaponTypeSchema } from "~/models/types/weapon-type";
import { createForm } from "~/utils/form";

//------------------------------------------------------------------------------
// Weapon Editor Form Fields
//------------------------------------------------------------------------------

export const weaponEditorFormFieldsSchema = z.object({
  ammunition: z.string(),
  cost: z.number(),
  damage: z.string(),
  damage_type: damageTypeSchema,
  damage_versatile: z.string(),
  magic: z.boolean(),
  mastery: weaponMasterySchema,
  melee: z.boolean(),
  name: z.string(),
  notes: z.string(),
  page: z.number(),
  properties: z.array(weaponPropertySchema),
  range_long: z.number(),
  range_short: z.number(),
  ranged: z.boolean(),
  rarity: equipmentRaritySchema,
  type: weaponTypeSchema,
  visibility: campaignRoleSchema,
  weight: z.number(),
});

export type WeaponEditorFormFields = z.infer<
  typeof weaponEditorFormFieldsSchema
>;

//------------------------------------------------------------------------------
// Weapon Editor Form
//------------------------------------------------------------------------------

export const weaponEditorForm = createForm(
  "weapon_editor",
  weaponEditorFormFieldsSchema.parse,
);

export const { useField: useWeaponEditorFormField } = weaponEditorForm;

export default weaponEditorForm;

//------------------------------------------------------------------------------
// Ammunition
//------------------------------------------------------------------------------

function validateAmmunition(name: string) {
  return name ? undefined : "ammunition.error.empty";
}

export const useWeaponEditorFormAmmunition = (
  defaultAmmunition: WeaponEditorFormFields["ammunition"],
) =>
  useWeaponEditorFormField("ammunition", defaultAmmunition, validateAmmunition);

//------------------------------------------------------------------------------
// Cost
//------------------------------------------------------------------------------

export const useWeaponEditorFormCost = (
  defaultCost: WeaponEditorFormFields["cost"],
) => useWeaponEditorFormField("cost", defaultCost);

//------------------------------------------------------------------------------
// Damage
//------------------------------------------------------------------------------

export const useWeaponEditorFormDamage = (
  defaultDamage: WeaponEditorFormFields["damage"],
) => useWeaponEditorFormField("damage", defaultDamage);

//------------------------------------------------------------------------------
// Damage Type
//------------------------------------------------------------------------------

export const useWeaponEditorFormDamageType = (
  defaultDamageType: WeaponEditorFormFields["damage_type"],
) => useWeaponEditorFormField("damage_type", defaultDamageType);

//------------------------------------------------------------------------------
// Damage Versatile
//------------------------------------------------------------------------------

export const useWeaponEditorFormDamageVersatile = (
  defaultDamageVersatile: WeaponEditorFormFields["damage_versatile"],
) => useWeaponEditorFormField("damage_versatile", defaultDamageVersatile);

//------------------------------------------------------------------------------
// Magic
//------------------------------------------------------------------------------

export const useWeaponEditorFormMagic = (
  defaultMagic: WeaponEditorFormFields["magic"],
) => useWeaponEditorFormField("magic", defaultMagic);

//------------------------------------------------------------------------------
// Mastery
//------------------------------------------------------------------------------

export const useWeaponEditorFormMastery = (
  defaultMastery: WeaponEditorFormFields["mastery"],
) => useWeaponEditorFormField("mastery", defaultMastery);

//------------------------------------------------------------------------------
// Melee
//------------------------------------------------------------------------------

export const useWeaponEditorFormMelee = (
  defaultMelee: WeaponEditorFormFields["melee"],
) => useWeaponEditorFormField("melee", defaultMelee);

//------------------------------------------------------------------------------
// Name
//------------------------------------------------------------------------------

function validateName(name: string) {
  return name ? undefined : "name.error.empty";
}

export const useWeaponEditorFormName = (
  defaultName: WeaponEditorFormFields["name"],
) => useWeaponEditorFormField("name", defaultName, validateName);

//------------------------------------------------------------------------------
// Notes
//------------------------------------------------------------------------------

export const useWeaponEditorFormNotes = (
  defaultNotes: WeaponEditorFormFields["notes"],
) => useWeaponEditorFormField("notes", defaultNotes);

//------------------------------------------------------------------------------
// Page
//------------------------------------------------------------------------------

export const useWeaponEditorFormPage = (
  defaultPage: WeaponEditorFormFields["page"],
) => useWeaponEditorFormField("page", defaultPage);

//------------------------------------------------------------------------------
// Properties
//------------------------------------------------------------------------------

export const useWeaponEditorFormProperties = (
  defaultProperties: WeaponEditorFormFields["properties"],
) => useWeaponEditorFormField("properties", defaultProperties);

//------------------------------------------------------------------------------
// Range Long
//------------------------------------------------------------------------------

export const useWeaponEditorFormRangeLong = (
  defaultRangeLong: WeaponEditorFormFields["range_long"],
) => useWeaponEditorFormField("range_long", defaultRangeLong);

//------------------------------------------------------------------------------
// Range Short
//------------------------------------------------------------------------------

export const useWeaponEditorFormRangeShort = (
  defaultRangeShort: WeaponEditorFormFields["range_short"],
) => useWeaponEditorFormField("range_short", defaultRangeShort);

//------------------------------------------------------------------------------
// Ranged
//------------------------------------------------------------------------------

export const useWeaponEditorFormRanged = (
  defaultRanged: WeaponEditorFormFields["ranged"],
) => useWeaponEditorFormField("ranged", defaultRanged);

//------------------------------------------------------------------------------
// Rarity
//------------------------------------------------------------------------------

export const useWeaponEditorFormRarity = (
  defaultRarity: WeaponEditorFormFields["rarity"],
) => useWeaponEditorFormField("rarity", defaultRarity);

//------------------------------------------------------------------------------
// Type
//------------------------------------------------------------------------------

export const useWeaponEditorFormType = (
  defaultType: WeaponEditorFormFields["type"],
) => useWeaponEditorFormField("type", defaultType);

//------------------------------------------------------------------------------
// Visibility
//------------------------------------------------------------------------------

export const useWeaponEditorFormVisibility = (
  defaultVisibility: WeaponEditorFormFields["visibility"],
) => useWeaponEditorFormField("visibility", defaultVisibility);

//------------------------------------------------------------------------------
// Weight
//------------------------------------------------------------------------------

export const useWeaponEditorFormWeight = (
  defaultWeight: WeaponEditorFormFields["weight"],
) => useWeaponEditorFormField("weight", defaultWeight);
