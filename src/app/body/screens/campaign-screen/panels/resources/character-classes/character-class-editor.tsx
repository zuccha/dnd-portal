import { HStack } from "@chakra-ui/react";
import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import type { CharacterClass } from "~/models/resources/character-classes/character-class";
import { type CharacterClassFormData } from "~/models/resources/character-classes/character-class-form";
import type { StartingEquipmentGroup } from "~/models/resources/character-classes/starting-equipment";
import { toolStore } from "~/models/resources/equipment/tools/tool-store";
import { spellStore } from "~/models/resources/spells/spell-store";
import { useArmorTypeOptions } from "~/models/types/armor-type";
import { useCreatureAbilityOptions } from "~/models/types/creature-ability";
import { useCreatureSkillOptions } from "~/models/types/creature-skill";
import { useDieTypeOptions } from "~/models/types/die_type";
import { useWeaponTypeOptions } from "~/models/types/weapon-type";
import Field from "~/ui/field";
import type { Form } from "~/utils/form";
import { createResourceEditor } from "../resource-editor";
import {
  createInputField,
  createMultipleSelectEnumField,
  createMultipleSelectIdsField,
  createNumberInputField,
  createResourceSearchField,
  createSelectEnumField,
} from "../resource-editor-form";
import StartingEquipmentEditor from "./starting-equipment-editor";

//------------------------------------------------------------------------------
// Character Class Editor
//------------------------------------------------------------------------------

export type CharacterClassEditorProps = {
  campaignId: string;
  resource: CharacterClass;
};

export function createCharacterClassEditor(form: Form<CharacterClassFormData>) {
  //----------------------------------------------------------------------------
  // Resource Editor
  //----------------------------------------------------------------------------

  const ResourceEditor = createResourceEditor(form);

  //----------------------------------------------------------------------------
  // Armor Proficiencies Field
  //----------------------------------------------------------------------------

  const ArmorProficienciesField = createMultipleSelectEnumField({
    i18nContext: {
      label: {
        en: "Armor Training",
        it: "Competenze nelle Armature",
      },
      placeholder: {
        en: "None",
        it: "Nessuna",
      },
    },
    useField: form.createUseField("armor_proficiencies"),
    useOptions: useArmorTypeOptions,
  });

  //----------------------------------------------------------------------------
  // Armor Proficiencies Extra Field
  //----------------------------------------------------------------------------

  const ArmorProficienciesExtraField = createInputField({
    i18nContext: {
      label: {
        en: "Other",
        it: "Altro",
      },
      placeholder: {
        en: "None",
        it: "Nessuna",
      },
    },
    translatable: true,
    useField: form.createUseField("armor_proficiencies_extra"),
  });

  //----------------------------------------------------------------------------
  // HP Die Field
  //----------------------------------------------------------------------------

  const HpDieField = createSelectEnumField({
    i18nContext: {
      label: {
        en: "Hit Point Die",
        it: "Dado Vita",
      },
    },
    useField: form.createUseField("hp_die"),
    useOptions: useDieTypeOptions,
  });

  //----------------------------------------------------------------------------
  // Primary Abilities Field
  //----------------------------------------------------------------------------

  const PrimaryAbilitiesField = createMultipleSelectEnumField({
    i18nContext: {
      label: {
        en: "Primary Abilities",
        it: "Abilità Primarie",
      },
      placeholder: {
        en: "None",
        it: "Nessuna",
      },
    },
    useField: form.createUseField("primary_abilities"),
    useOptions: useCreatureAbilityOptions,
  });

  //----------------------------------------------------------------------------
  // Saving Throw Proficiencies Field
  //----------------------------------------------------------------------------

  const SavingThrowProficienciesField = createMultipleSelectEnumField({
    i18nContext: {
      label: {
        en: "Saving Throw Proficiencies",
        it: "Competenze nei Tiri Salvezza",
      },
      placeholder: {
        en: "None",
        it: "Nessuna",
      },
    },
    useField: form.createUseField("saving_throw_proficiencies"),
    useOptions: useCreatureAbilityOptions,
  });

  //----------------------------------------------------------------------------
  // Skill Proficiencies Pool Field
  //----------------------------------------------------------------------------

  const SkillProficienciesPoolField = createMultipleSelectEnumField({
    i18nContext: {
      label: {
        en: "Skill Proficiencies",
        it: "Competenze nelle Abilità",
      },
      placeholder: {
        en: "None",
        it: "Nessuna",
      },
    },
    useField: form.createUseField("skill_proficiencies_pool"),
    useOptions: useCreatureSkillOptions,
  });

  //----------------------------------------------------------------------------
  // Skill Proficiencies Pool Quantity Field
  //----------------------------------------------------------------------------

  const SkillProficienciesPoolQuantityField = createNumberInputField({
    i18nContext: {
      label: {
        en: "Quantity",
        it: "Quantità",
      },
    },
    useField: form.createUseField("skill_proficiencies_pool_quantity"),
  });

  //----------------------------------------------------------------------------
  // Spell Ids
  //----------------------------------------------------------------------------

  const SpellIdsField = createResourceSearchField({
    i18nContext: {
      label: {
        en: "Spells",
        it: "Incantesimi",
      },
      placeholder: {
        en: "Search spell",
        it: "Cerca incantesimo",
      },
    },
    useField: form.createUseField("spell_ids"),
    useOptions: spellStore.useResourceOptions,
  });

  //----------------------------------------------------------------------------
  // Starting Equipment Extra
  //----------------------------------------------------------------------------

  const useStartingEquipment = form.createUseField("starting_equipment");

  function StartingEquipmentField({
    campaignId,
    defaultValue,
  }: {
    campaignId: string;
    defaultValue: StartingEquipmentGroup[];
  }) {
    const { error, ...rest } = useStartingEquipment(defaultValue);
    const { t } = useI18nLangContext(i18nContext);
    const message = error ? t(error) : undefined;

    return (
      <Field error={message} label={t("starting_equipment.label")}>
        <StartingEquipmentEditor campaignId={campaignId} w="full" {...rest} />
      </Field>
    );
  }

  //----------------------------------------------------------------------------
  // Tool Proficiency Ids Field
  //----------------------------------------------------------------------------

  const ToolProficiencyIdsField = createMultipleSelectIdsField({
    i18nContext: {
      label: {
        en: "Tool Proficiencies",
        it: "Competenza negli Strumenti",
      },
      placeholder: {
        en: "None",
        it: "Nessuna",
      },
    },
    useField: form.createUseField("tool_proficiency_ids"),
    useOptions: toolStore.useResourceOptions,
  });

  //----------------------------------------------------------------------------
  // Weapon Proficiencies Field
  //----------------------------------------------------------------------------

  const WeaponProficienciesField = createMultipleSelectEnumField({
    i18nContext: {
      label: {
        en: "Weapon Proficiencies",
        it: "Competenze nelle Armi",
      },
      placeholder: {
        en: "None",
        it: "Nessuna",
      },
    },
    useField: form.createUseField("weapon_proficiencies"),
    useOptions: useWeaponTypeOptions,
  });

  //----------------------------------------------------------------------------
  // Weapon Proficiencies Extra Field
  //----------------------------------------------------------------------------

  const WeaponProficienciesExtraField = createInputField({
    i18nContext: {
      label: {
        en: "Other",
        it: "Altro",
      },
      placeholder: {
        en: "None",
        it: "Nessuna",
      },
    },
    translatable: true,
    useField: form.createUseField("weapon_proficiencies_extra"),
  });

  //----------------------------------------------------------------------------
  // Character Class Editor
  //----------------------------------------------------------------------------

  return function CharacterClassEditor({
    campaignId,
    resource,
  }: CharacterClassEditorProps) {
    const { lang } = useI18nLangContext(i18nContext);

    return (
      <ResourceEditor resource={resource}>
        <HStack gap={4} w="full">
          <PrimaryAbilitiesField defaultValue={resource.primary_abilities} />
          <HpDieField defaultValue={resource.hp_die} maxW="10em" />
        </HStack>

        <SavingThrowProficienciesField
          defaultValue={resource.saving_throw_proficiencies}
        />

        <HStack gap={4} w="full">
          <SkillProficienciesPoolField
            defaultValue={resource.skill_proficiencies_pool}
          />

          <SkillProficienciesPoolQuantityField
            defaultValue={resource.skill_proficiencies_pool_quantity}
            maxW="6em"
          />
        </HStack>

        <HStack gap={2} w="full">
          <WeaponProficienciesField
            defaultValue={resource.weapon_proficiencies}
          />
          <WeaponProficienciesExtraField
            defaultValue={resource.weapon_proficiencies_extra[lang] ?? ""}
          />
        </HStack>

        <HStack gap={2} w="full">
          <ArmorProficienciesField
            defaultValue={resource.armor_proficiencies}
          />
          <ArmorProficienciesExtraField
            defaultValue={resource.armor_proficiencies_extra[lang] ?? ""}
          />
        </HStack>

        <ToolProficiencyIdsField
          campaignId={campaignId}
          defaultValue={resource.tool_proficiency_ids}
        />

        <StartingEquipmentField
          campaignId={campaignId}
          defaultValue={resource.starting_equipment}
        />

        <SpellIdsField
          campaignId={campaignId}
          defaultValue={resource.spell_ids}
          w="full"
        />
      </ResourceEditor>
    );
  };
}

//----------------------------------------------------------------------------
// I18n Context
//----------------------------------------------------------------------------

const i18nContext = {
  "starting_equipment.label": {
    en: "Starting Equipment",
    it: "Equipaggiamento Iniziale",
  },
};
