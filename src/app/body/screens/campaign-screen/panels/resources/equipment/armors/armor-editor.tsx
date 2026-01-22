import { HStack } from "@chakra-ui/react";
import type { Armor } from "~/models/resources/equipment/armors/armor";
import type { ArmorFormData } from "~/models/resources/equipment/armors/armor-form";
import { useArmorTypeOptions } from "~/models/types/armor-type";
import type { Form } from "~/utils/form";
import {
  createConditionalNumberInputField,
  createNumberInputField,
  createSelectEnumField,
  createSwitchField,
} from "../../resource-editor-form";
import { createEquipmentEditor } from "../equipment-editor";

//------------------------------------------------------------------------------
// Armor Editor
//------------------------------------------------------------------------------

export type ArmorEditorProps = {
  resource: Armor;
};

export function createArmorEditor(form: Form<ArmorFormData>) {
  //----------------------------------------------------------------------------
  // Equipment Editor
  //----------------------------------------------------------------------------

  const EquipmentEditor = createEquipmentEditor(form);

  //----------------------------------------------------------------------------
  // Modifiers
  //----------------------------------------------------------------------------

  const ChaModifierField = createConditionalNumberInputField({
    i18nContext: {
      label: {
        en: "Max Charisma Modifier",
        it: "Mod. Carisma Massimo",
      },
    },
    useConditionalField: form.createUseField(
      "armor_class_includes_cha_modifier",
    ),
    useField: form.createUseField("armor_class_max_cha_modifier"),
  });

  const ConModifierField = createConditionalNumberInputField({
    i18nContext: {
      label: {
        en: "Max Constitution Modifier",
        it: "Mod. Costituzione Massimo",
      },
    },
    useConditionalField: form.createUseField(
      "armor_class_includes_con_modifier",
    ),
    useField: form.createUseField("armor_class_max_con_modifier"),
  });

  const DexModifierField = createConditionalNumberInputField({
    i18nContext: {
      label: {
        en: "Max Dexterity Modifier",
        it: "Mod. Destrezza Massimo",
      },
    },
    useConditionalField: form.createUseField(
      "armor_class_includes_dex_modifier",
    ),
    useField: form.createUseField("armor_class_max_dex_modifier"),
  });

  const IntModifierField = createConditionalNumberInputField({
    i18nContext: {
      label: {
        en: "Max Intelligence Modifier",
        it: "Mod. Intelligenza Massimo",
      },
    },
    useConditionalField: form.createUseField(
      "armor_class_includes_int_modifier",
    ),
    useField: form.createUseField("armor_class_max_int_modifier"),
  });

  const StrModifierField = createConditionalNumberInputField({
    i18nContext: {
      label: {
        en: "Max Strength Modifier",
        it: "Mod. Forza Massimo",
      },
    },
    useConditionalField: form.createUseField(
      "armor_class_includes_str_modifier",
    ),
    useField: form.createUseField("armor_class_max_str_modifier"),
  });

  const WisModifierField = createConditionalNumberInputField({
    i18nContext: {
      label: {
        en: "Max Wisdom Modifier",
        it: "Mod. Saggezza Massimo",
      },
    },
    useConditionalField: form.createUseField(
      "armor_class_includes_wis_modifier",
    ),
    useField: form.createUseField("armor_class_max_wis_modifier"),
  });

  //----------------------------------------------------------------------------
  // Armor Class Modifier
  //----------------------------------------------------------------------------

  const ArmorClassModifierField = createNumberInputField({
    i18nContext: {
      label: {
        en: "Armor Class Modifier",
        it: "Modificatore Classe Armatura",
      },
    },
    useField: form.createUseField("armor_class_modifier"),
  });

  //----------------------------------------------------------------------------
  // Base Armor Class
  //----------------------------------------------------------------------------

  const BaseArmorClassField = createNumberInputField({
    i18nContext: {
      label: {
        en: "Base Armor Class",
        it: "Classe Armatura Base",
      },
    },
    useField: form.createUseField("base_armor_class"),
  });

  //------------------------------------------------------------------------------
  // Disadvantage on Stealth
  //------------------------------------------------------------------------------

  const DisadvantageOnStealth = createSwitchField({
    i18nContext: {
      label: { en: "Disadvantage on stealth", it: "Svantaggio su furtività" },
    },
    useField: form.createUseField("disadvantage_on_stealth"),
  });

  //------------------------------------------------------------------------------
  // Required Abilities
  //------------------------------------------------------------------------------

  const RequiredChaField = createNumberInputField({
    i18nContext: {
      label: { en: "Min Charisma", it: "Carisma Mininmo" },
    },
    useField: form.createUseField("required_cha"),
  });

  const RequiredConField = createNumberInputField({
    i18nContext: {
      label: { en: "Min Constitution", it: "Costituzione Mininmo" },
    },
    useField: form.createUseField("required_con"),
  });

  const RequiredDexField = createNumberInputField({
    i18nContext: {
      label: { en: "Min Dexterity", it: "Destrezza Mininmo" },
    },
    useField: form.createUseField("required_dex"),
  });

  const RequiredIntField = createNumberInputField({
    i18nContext: {
      label: { en: "Min Intelligence", it: "Intelligenza Mininmo" },
    },
    useField: form.createUseField("required_int"),
  });

  const RequiredStrField = createNumberInputField({
    i18nContext: {
      label: { en: "Min Strength", it: "Forza Mininmo" },
    },
    useField: form.createUseField("required_str"),
  });

  const RequiredWisField = createNumberInputField({
    i18nContext: {
      label: { en: "Min Wisdom", it: "Saggezza Mininmo" },
    },
    useField: form.createUseField("required_wis"),
  });

  //------------------------------------------------------------------------------
  // Type
  //------------------------------------------------------------------------------

  const TypeField = createSelectEnumField({
    i18nContext: { label: { en: "Type", it: "Tipo" } },
    useField: form.createUseField("type"),
    useOptions: useArmorTypeOptions,
  });

  //----------------------------------------------------------------------------
  // Armor Editor
  //----------------------------------------------------------------------------

  return function ArmorEditor({ resource }: ArmorEditorProps) {
    return (
      <EquipmentEditor resource={resource}>
        <HStack align="flex-start" gap={4}>
          <TypeField defaultValue={resource.type} />
          <BaseArmorClassField defaultValue={resource.base_armor_class} />
          <ArmorClassModifierField
            defaultValue={resource.armor_class_modifier}
          />
        </HStack>

        <HStack align="flex-start" gap={4}>
          <StrModifierField
            defaultConditionalValue={
              typeof resource.armor_class_max_str_modifier === "number"
            }
            defaultValue={resource.armor_class_max_str_modifier ?? 0}
          />
          <DexModifierField
            defaultConditionalValue={
              typeof resource.armor_class_max_dex_modifier === "number"
            }
            defaultValue={resource.armor_class_max_dex_modifier ?? 0}
          />
          <ConModifierField
            defaultConditionalValue={
              typeof resource.armor_class_max_con_modifier === "number"
            }
            defaultValue={resource.armor_class_max_con_modifier ?? 0}
          />
        </HStack>

        <HStack align="flex-start" gap={4}>
          <IntModifierField
            defaultConditionalValue={
              typeof resource.armor_class_max_int_modifier === "number"
            }
            defaultValue={resource.armor_class_max_int_modifier ?? 0}
          />
          <WisModifierField
            defaultConditionalValue={
              typeof resource.armor_class_max_wis_modifier === "number"
            }
            defaultValue={resource.armor_class_max_wis_modifier ?? 0}
          />
          <ChaModifierField
            defaultConditionalValue={
              typeof resource.armor_class_max_cha_modifier === "number"
            }
            defaultValue={resource.armor_class_max_cha_modifier ?? 0}
          />
        </HStack>

        <HStack align="flex-start" gap={4}>
          <RequiredStrField defaultValue={resource.required_str} />
          <RequiredDexField defaultValue={resource.required_dex} />
          <RequiredConField defaultValue={resource.required_con} />
        </HStack>

        <HStack align="flex-start" gap={4}>
          <RequiredIntField defaultValue={resource.required_int} />
          <RequiredWisField defaultValue={resource.required_wis} />
          <RequiredChaField defaultValue={resource.required_cha} />
        </HStack>

        <HStack align="flex-start" gap={4}>
          <DisadvantageOnStealth
            defaultValue={resource.disadvantage_on_stealth}
          />
        </HStack>
      </EquipmentEditor>
    );
  };
}
