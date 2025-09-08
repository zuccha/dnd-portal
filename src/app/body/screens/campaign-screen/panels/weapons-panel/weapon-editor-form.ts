import type { DamageType } from "../../../../../../resources/damage-type";
import {
  updateWeapon,
  weaponSchema,
  weaponTranslationSchema,
} from "../../../../../../resources/weapon";
import type { WeaponMastery } from "../../../../../../resources/weapon-mastery";
import type { WeaponProperty } from "../../../../../../resources/weapon-property";
import type { WeaponType } from "../../../../../../resources/weapon-type";
import { createForm } from "../../../../../../utils/form";

//------------------------------------------------------------------------------
// Form
//------------------------------------------------------------------------------

export type WeaponEditorFormFields = {
  name: string;
  type: WeaponType;
  damage: string;
  damage_versatile: string;
  damage_type: DamageType;
  properties: WeaponProperty[];
  mastery: WeaponMastery;
  melee: boolean;
  ranged: boolean;
  magic: boolean;
  range_ft_short: number;
  range_ft_long: number;
  range_m_short: number;
  range_m_long: number;
  weight_kg: number;
  weight_lb: number;
  cost: number;
  ammunition: string;
  notes: string;
};

export const weaponEditorForm = createForm<
  WeaponEditorFormFields,
  { id: string; lang: string }
>(async (data, { lang, id }) => {
  const maybeWeapon = {
    cost: data.cost,
    damage: data.damage,
    damage_type: data.damage_type,
    damage_versatile: data.damage_versatile,
    magic: data.magic,
    mastery: data.mastery,
    melee: data.melee,
    properties: data.properties,
    range_ft_long: data.range_ft_long,
    range_ft_short: data.range_ft_short,
    range_m_long: data.range_m_long,
    range_m_short: data.range_m_short,
    ranged: data.ranged,
    type: data.type,
    weight_kg: data.weight_kg,
    weight_lb: data.weight_lb,
  };

  const maybeTranslation = {
    ammunition: data.ammunition,
    lang,
    name: data.name,
    notes: data.notes,
    weapon_id: id,
  };

  const report = (error: Error, message: string) => {
    console.error(error);
    return message;
  };

  const weapon = weaponSchema.partial().safeParse(maybeWeapon);
  if (!weapon.success) return report(weapon.error, "form.error.invalid_weapon");

  const translation = weaponTranslationSchema.safeParse(maybeTranslation);
  if (!translation.success)
    return report(translation.error, "form.error.invalid_translation");

  const response = await updateWeapon(id, weapon.data, translation.data);
  if (response.error)
    report(response.error, "form.error.update_weapon_failure");

  return undefined;
});

export const { useField: useWeaponEditorFormField } = weaponEditorForm;

export default weaponEditorForm;

//------------------------------------------------------------------------------
// Name
//------------------------------------------------------------------------------

function validateName(name: string) {
  return name ? undefined : "name.error.empty";
}

export const useWeaponEditorFormName = (defaultName: string) =>
  useWeaponEditorFormField("name", defaultName, validateName);

//------------------------------------------------------------------------------
// Type
//------------------------------------------------------------------------------

export const useWeaponEditorFormType = (defaultType: WeaponType) =>
  useWeaponEditorFormField("type", defaultType);

//------------------------------------------------------------------------------
// Damage
//------------------------------------------------------------------------------

export const useWeaponEditorFormDamage = (defaultDamage: string) =>
  useWeaponEditorFormField("damage", defaultDamage);

//------------------------------------------------------------------------------
// Damage Versatile
//------------------------------------------------------------------------------

export const useWeaponEditorFormDamageVersatile = (
  defaultDamageVersatile: string
) => useWeaponEditorFormField("damage_versatile", defaultDamageVersatile);

//------------------------------------------------------------------------------
// Damage Type
//------------------------------------------------------------------------------

export const useWeaponEditorFormDamageType = (defaultDamageType: DamageType) =>
  useWeaponEditorFormField("damage_type", defaultDamageType);

//------------------------------------------------------------------------------
// Properties
//------------------------------------------------------------------------------

export const useWeaponEditorFormProperties = (
  defaultProperties: WeaponProperty[]
) => useWeaponEditorFormField("properties", defaultProperties);

//------------------------------------------------------------------------------
// Mastery
//------------------------------------------------------------------------------

export const useWeaponEditorFormMastery = (defaultMastery: WeaponMastery) =>
  useWeaponEditorFormField("mastery", defaultMastery);

//------------------------------------------------------------------------------
// Melee
//------------------------------------------------------------------------------

export const useWeaponEditorFormMelee = (defaultMelee: boolean) =>
  useWeaponEditorFormField("melee", defaultMelee);

//------------------------------------------------------------------------------
// Ranged
//------------------------------------------------------------------------------

export const useWeaponEditorFormRanged = (defaultRanged: boolean) =>
  useWeaponEditorFormField("ranged", defaultRanged);

//------------------------------------------------------------------------------
// Magic
//------------------------------------------------------------------------------

export const useWeaponEditorFormMagic = (defaultMagic: boolean) =>
  useWeaponEditorFormField("magic", defaultMagic);

//------------------------------------------------------------------------------
// Range Ft Short
//------------------------------------------------------------------------------

export const useWeaponEditorFormRangeFtShort = (defaultRangeFtShort: number) =>
  useWeaponEditorFormField("range_ft_short", defaultRangeFtShort);

//------------------------------------------------------------------------------
// Range Ft Long
//------------------------------------------------------------------------------

export const useWeaponEditorFormRangeFtLong = (defaultRangeFtLong: number) =>
  useWeaponEditorFormField("range_ft_long", defaultRangeFtLong);

//------------------------------------------------------------------------------
// Range M Short
//------------------------------------------------------------------------------

export const useWeaponEditorFormRangeMShort = (defaultRangeMShort: number) =>
  useWeaponEditorFormField("range_m_short", defaultRangeMShort);

//------------------------------------------------------------------------------
// Range M Long
//------------------------------------------------------------------------------

export const useWeaponEditorFormRangeMLong = (defaultRangeMLong: number) =>
  useWeaponEditorFormField("range_m_long", defaultRangeMLong);

//------------------------------------------------------------------------------
// Weight Kg
//------------------------------------------------------------------------------

export const useWeaponEditorFormWeightKg = (defaultWeightKg: number) =>
  useWeaponEditorFormField("weight_kg", defaultWeightKg);

//------------------------------------------------------------------------------
// Weight Lb
//------------------------------------------------------------------------------

export const useWeaponEditorFormWeightLb = (defaultWeightLb: number) =>
  useWeaponEditorFormField("weight_lb", defaultWeightLb);

//------------------------------------------------------------------------------
// Cost
//------------------------------------------------------------------------------

export const useWeaponEditorFormCost = (defaultCost: number) =>
  useWeaponEditorFormField("cost", defaultCost);

//------------------------------------------------------------------------------
// Ammunition
//------------------------------------------------------------------------------

function validateAmmunition(name: string) {
  return name ? undefined : "ammunition.error.empty";
}

export const useWeaponEditorFormAmmunition = (defaultAmmunition: string) =>
  useWeaponEditorFormField("ammunition", defaultAmmunition, validateAmmunition);

//------------------------------------------------------------------------------
// Notes
//------------------------------------------------------------------------------

export const useWeaponEditorFormNotes = (defaultNotes: string) =>
  useWeaponEditorFormField("notes", defaultNotes);
