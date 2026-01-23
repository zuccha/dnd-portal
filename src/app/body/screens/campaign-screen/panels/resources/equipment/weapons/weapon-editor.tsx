import { HStack } from "@chakra-ui/react";
import { equipmentStore } from "~/models/resources/equipment/equipment-store";
import type { Weapon } from "~/models/resources/equipment/weapons/weapon";
import type { WeaponFormData } from "~/models/resources/equipment/weapons/weapon-form";
import { useDamageTypeOptions } from "~/models/types/damage-type";
import { useWeaponMasteryOptions } from "~/models/types/weapon-mastery";
import { useWeaponPropertyOptions } from "~/models/types/weapon-property";
import { useWeaponTypeOptions } from "~/models/types/weapon-type";
import type { Form } from "~/utils/form";
import {
  createDistanceInputField,
  createInputField,
  createMultipleSelectEnumField,
  createResourceSearchField,
  createSelectEnumField,
  createSwitchField,
} from "../../resource-editor-form";
import { createEquipmentEditor } from "../equipment-editor";

//------------------------------------------------------------------------------
// Weapon Editor
//------------------------------------------------------------------------------

export type WeaponEditorProps = {
  campaignId: string;
  resource: Weapon;
};

export function createWeaponEditor(form: Form<WeaponFormData>) {
  //----------------------------------------------------------------------------
  // Equipment Editor
  //----------------------------------------------------------------------------

  const EquipmentEditor = createEquipmentEditor(form);

  //----------------------------------------------------------------------------
  // Ammunition Ids
  //----------------------------------------------------------------------------

  const AmmunitionIdsField = createResourceSearchField({
    i18nContext: {
      label: { en: "Ammunition", it: "Munizione" },
      placeholder: { en: "None", it: "Nessuna" },
    },
    i18nContextExtra: {
      "error.empty": {
        en: "The ammunition cannot be empty",
        it: "La munizione non può essere vuota",
      },
    },
    useField: form.createUseField("ammunition_ids", (ammunition_ids) =>
      ammunition_ids.length > 0 ? undefined : "error.empty",
    ),
    useOptions: equipmentStore.useResourceOptions,
  });

  //----------------------------------------------------------------------------
  // Damage
  //----------------------------------------------------------------------------

  const DamageField = createInputField({
    i18nContext: {
      label: { en: "Damage", it: "Danni" },
      placeholder: { en: "None", it: "Nessuno" },
    },
    i18nContextExtra: {
      "error.empty": {
        en: "Damage cannot be empty",
        it: "I danni non possono essere vuoti",
      },
    },
    useField: form.createUseField("damage", (damage) =>
      damage ? undefined : "error.empty",
    ),
  });

  const DamageVersatileField = createInputField({
    i18nContext: {
      label: { en: "Versatile Damage", it: "Danni Versatili" },
      placeholder: { en: "None", it: "Nessuno" },
    },
    i18nContextExtra: {
      "error.empty": {
        en: "Versatile damage cannot be empty",
        it: "I danni versatili non possono essere vuoti",
      },
    },
    useField: form.createUseField("damage_versatile", (damageVersatile) =>
      damageVersatile ? undefined : "error.empty",
    ),
  });

  const DamageTypeField = createSelectEnumField({
    i18nContext: { label: { en: "Damage Type", it: "Tipo di Danno" } },
    useField: form.createUseField("damage_type"),
    useOptions: useDamageTypeOptions,
  });

  //----------------------------------------------------------------------------
  // Mastery
  //----------------------------------------------------------------------------

  const MasteryField = createSelectEnumField({
    i18nContext: { label: { en: "Mastery", it: "Padronanza" } },
    useField: form.createUseField("mastery"),
    useOptions: useWeaponMasteryOptions,
  });

  //----------------------------------------------------------------------------
  // Melee
  //----------------------------------------------------------------------------

  const MeleeField = createSwitchField({
    i18nContext: { label: { en: "Melee", it: "Mischia" } },
    useField: form.createUseField("melee"),
  });

  //------------------------------------------------------------------------------
  // Properties
  //------------------------------------------------------------------------------

  const usePropertiesField = form.createUseField("properties");

  const PropertiesField = createMultipleSelectEnumField({
    i18nContext: {
      label: { en: "Properties", it: "Proprietà" },
      placeholder: { en: "None", it: "Nessuna" },
    },
    useField: usePropertiesField,
    useOptions: useWeaponPropertyOptions,
  });

  //----------------------------------------------------------------------------
  // Range
  //----------------------------------------------------------------------------

  const useRangedField = form.createUseField("ranged");

  const RangedField = createSwitchField({
    i18nContext: { label: { en: "Ranged", it: "A distanza" } },
    useField: useRangedField,
  });

  const RangeShortField = createDistanceInputField({
    i18nContext: { label: { en: "Short Range", it: "Gittata Corta" } },
    useField: form.createUseField("range_short"),
  });

  const RangeLongField = createDistanceInputField({
    i18nContext: { label: { en: "Long Range", it: "Gittata Lunga" } },
    useField: form.createUseField("range_long"),
  });

  //----------------------------------------------------------------------------
  // Type
  //----------------------------------------------------------------------------

  const TypeField = createSelectEnumField({
    i18nContext: { label: { en: "Type", it: "Tipo" } },
    useField: form.createUseField("type"),
    useOptions: useWeaponTypeOptions,
  });

  //----------------------------------------------------------------------------
  // Weapon Editor
  //----------------------------------------------------------------------------

  return function WeaponEditor({ campaignId, resource }: WeaponEditorProps) {
    const { value: ranged } = useRangedField(resource.ranged);
    const { value: properties } = usePropertiesField(resource.properties);

    return (
      <EquipmentEditor resource={resource}>
        <HStack align="flex-start" gap={4}>
          <TypeField defaultValue={resource.type} />
          <PropertiesField defaultValue={resource.properties} />
          <MasteryField defaultValue={resource.mastery} />
        </HStack>

        <HStack align="flex-start" gap={4}>
          <DamageField defaultValue={resource.damage} />
          {properties.includes("versatile") && (
            <DamageVersatileField
              defaultValue={resource.damage_versatile ?? ""}
            />
          )}
          <DamageTypeField defaultValue={resource.damage_type} />
          {properties.includes("ammunition") && (
            <AmmunitionIdsField
              campaignId={campaignId}
              defaultValue={resource.ammunition_ids}
            />
          )}
        </HStack>

        <HStack gap={8}>
          <MeleeField defaultValue={resource.melee} />
          <RangedField defaultValue={resource.ranged} />
        </HStack>

        {ranged && (
          <HStack align="flex-start" gap={4}>
            <RangeShortField defaultValue={resource.range_short ?? 0} />
            <RangeLongField defaultValue={resource.range_long ?? 0} />
          </HStack>
        )}
      </EquipmentEditor>
    );
  };
}
