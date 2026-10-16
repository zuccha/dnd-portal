import { HStack } from "@chakra-ui/react";
import { equipmentReferenceStore } from "~/models/resources/equipment/equipment-reference-store";
import type { Weapon } from "~/models/resources/equipment/weapons/weapon";
import type { WeaponFormData } from "~/models/resources/equipment/weapons/weapon-form";
import { weaponStore } from "~/models/resources/equipment/weapons/weapon-store";
import { weaponModifierStore } from "~/models/resources/modifiers/equipment/weapons/weapon-modifier-store";
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
  resource: Weapon;
  sourceId: string;
};

export function createWeaponEditor(form: Form<WeaponFormData>) {
  //----------------------------------------------------------------------------
  // Equipment Editor
  //----------------------------------------------------------------------------

  const EquipmentEditor = createEquipmentEditor(form, weaponStore, weaponModifierStore);

  //----------------------------------------------------------------------------
  // Ammunition Ids
  //----------------------------------------------------------------------------

  const AmmunitionIdsField = createResourceSearchField({
    i18nContext: {
      label: { en: "Ammunition", it: "Munizione" },
      placeholder: { en: "None", it: "Nessuna" },
    },
    useField: form.createUseField("ammunition_ids"),
    useOptions: equipmentReferenceStore.useResourceOptions,
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
    useField: form.createUseField("damage", (damage) => (damage ? undefined : "error.empty")),
  });

  const DamageVersatileField = createInputField({
    i18nContext: {
      label: { en: "Versatile Damage", it: "Danni Versatili" },
      placeholder: { en: "None", it: "Nessuno" },
    },
    useField: form.createUseField("damage_versatile"),
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
    useField: form.createUseField("is_melee"),
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

  const useRangedField = form.createUseField("is_ranged");

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

  return function WeaponEditor({ resource, sourceId }: WeaponEditorProps) {
    const { value: ranged } = useRangedField(resource.is_ranged);
    const { value: properties } = usePropertiesField(resource.properties);

    return (
      <EquipmentEditor resource={resource} sourceId={sourceId}>
        <HStack align="flex-start" gap={4}>
          <TypeField defaultValue={resource.type} />
          <PropertiesField defaultValue={resource.properties} />
          <MasteryField defaultValue={resource.mastery} />
        </HStack>

        <HStack align="flex-start" gap={4}>
          <DamageField defaultValue={resource.damage} />
          <DamageVersatileField
            defaultValue={resource.damage_versatile ?? ""}
            hidden={!properties.includes("versatile")}
          />
          <DamageTypeField defaultValue={resource.damage_type} />
          <AmmunitionIdsField
            defaultValue={resource.ammunition_ids}
            hidden={!properties.includes("ammunition")}
            sourceId={sourceId}
          />
        </HStack>

        <HStack gap={8}>
          <MeleeField defaultValue={resource.is_melee} />
          <RangedField defaultValue={resource.is_ranged} />
        </HStack>

        <HStack align="flex-start" gap={4} hidden={!ranged}>
          <RangeShortField defaultValue={resource.range_short ?? 0} />
          <RangeLongField defaultValue={resource.range_long ?? 0} />
        </HStack>
      </EquipmentEditor>
    );
  };
}
