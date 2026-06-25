import { HStack } from "@chakra-ui/react";
import { useI18nLang } from "~/i18n/i18n-lang";
import { equipmentStore } from "~/models/resources/equipment/equipment-store";
import type { EquipmentModifier } from "~/models/resources/equipment-modifiers/equipment-modifier";
import type { EquipmentModifierFormData } from "~/models/resources/equipment-modifiers/equipment-modifier-form";
import {
  type EquipmentRarity,
  useEquipmentRarityOptions,
} from "~/models/types/equipment-rarity";
import type { Form } from "~/utils/form";
import { createResourceEditor } from "../resource-editor";
import {
  createCostInputField,
  createInputField,
  createLargeSwitchField,
  createNumberInputField,
  createResourceSearchField,
  createSelectEnumField,
  createTextareaField,
  createWeightInputField,
} from "../resource-editor-form";

//------------------------------------------------------------------------------
// Create Equipment Modifier Editor
//------------------------------------------------------------------------------

export type EquipmentModifierEditorProps = {
  resource: EquipmentModifier;
  sourceId: string;
};

export function createEquipmentModifierEditor(
  form: Form<EquipmentModifierFormData>,
) {
  //----------------------------------------------------------------------------
  // Resource Editor
  //----------------------------------------------------------------------------

  const ResourceEditor = createResourceEditor(form);

  //----------------------------------------------------------------------------
  // Cost Delta
  //----------------------------------------------------------------------------

  const CostDeltaField = createCostInputField({
    i18nContext: { label: { en: "Additional Cost", it: "Costo Addizionale" } },
    useField: form.createUseField("cost_delta"),
  });

  //----------------------------------------------------------------------------
  // Weight Delta
  //----------------------------------------------------------------------------

  const WeightDeltaField = createWeightInputField({
    i18nContext: { label: { en: "Additional Weight", it: "Peso Addizionale" } },
    useField: form.createUseField("weight_delta"),
  });

  //----------------------------------------------------------------------------
  // Make Magic
  //----------------------------------------------------------------------------

  const useMakeMagic = form.createUseField("make_magic");

  const MakeMagicField = createLargeSwitchField({
    i18nContext: { label: { en: "Make Magic", it: "Rendi Magico" } },
    useField: useMakeMagic,
  });

  //----------------------------------------------------------------------------
  // Rarity Minimum
  //----------------------------------------------------------------------------

  const RarityMinimumField = createSelectEnumField<EquipmentRarity>({
    i18nContext: { label: { en: "Minimum Rarity", it: "Rarità Minima" } },
    useField: form.createUseField("rarity_minimum"),
    useOptions: useEquipmentRarityOptions,
  });

  //----------------------------------------------------------------------------
  // Required Attunement Slots Minimum
  //----------------------------------------------------------------------------

  const useRequiredAttunementSlotsMinimum = form.createUseField(
    "required_attunement_slots_minimum",
  );

  const RequiredAttunementSlotsMinimumField = createNumberInputField({
    i18nContext: {
      label: { en: "Min. Attunement Slots", it: "Min. Slot Sintonia" },
    },
    inputProps: { min: 0 },
    useField: useRequiredAttunementSlotsMinimum,
  });

  //----------------------------------------------------------------------------
  // Composite Name
  //----------------------------------------------------------------------------

  const CompositeNameField = createInputField({
    i18nContext: {
      label: { en: "Composite Name", it: "Nome Composito" },
      placeholder: { en: "{base}", it: "{base}" },
    },
    translatable: true,
    useField: form.createUseField("composite_name"),
  });

  //----------------------------------------------------------------------------
  // Applies To
  //----------------------------------------------------------------------------

  const AppliesToField = createInputField({
    i18nContext: {
      label: { en: "Applies To", it: "Applicabile A" },
      placeholder: { en: "None", it: "Nessuno" },
    },
    translatable: true,
    useField: form.createUseField("applies_to"),
  });

  //----------------------------------------------------------------------------
  // Equipment
  //----------------------------------------------------------------------------

  const EquipmentField = createResourceSearchField({
    i18nContext: {
      label: { en: "Supported Equipment", it: "Equipaggiamento Supportato" },
      placeholder: { en: "Search equipment", it: "Cerca equipaggiamento" },
    },
    useField: form.createUseField("equipment_ids"),
    useOptions: equipmentStore.useResourceOptions,
  });

  //----------------------------------------------------------------------------
  // Notes Delta
  //----------------------------------------------------------------------------

  const NotesDeltaField = createTextareaField({
    i18nContext: {
      label: { en: "Notes", it: "Note" },
      placeholder: { en: "None", it: "Nessuna" },
    },
    inputProps: { rows: 5 },
    translatable: true,
    useField: form.createUseField("notes_delta"),
  });

  //----------------------------------------------------------------------------
  // Attunement Notes Delta
  //----------------------------------------------------------------------------

  const AttunementNotesDeltaField = createInputField({
    i18nContext: {
      label: { en: "Attunement Notes", it: "Note Sintonia" },
      placeholder: { en: "None", it: "Nessuna" },
    },
    translatable: true,
    useField: form.createUseField("attunement_notes_delta"),
  });

  //----------------------------------------------------------------------------
  // Equipment Modifier Editor
  //----------------------------------------------------------------------------

  return function EquipmentModifierEditor({
    resource,
    sourceId,
  }: EquipmentModifierEditorProps) {
    const [lang] = useI18nLang();
    const { value: makeMagic } = useMakeMagic(resource.make_magic);
    const { value: requiredAttunementSlotsMinimum } =
      useRequiredAttunementSlotsMinimum(
        resource.required_attunement_slots_minimum,
      );

    return (
      <ResourceEditor resource={resource}>
        <CompositeNameField
          defaultValue={resource.composite_name[lang] ?? "{base}"}
        />
        <AppliesToField defaultValue={resource.applies_to[lang] ?? ""} />

        <HStack align="flex-start" gap={4} w="full">
          <CostDeltaField defaultValue={resource.cost_delta} />
          <WeightDeltaField defaultValue={resource.weight_delta} />
        </HStack>

        <HStack align="flex-start" gap={4} w="full">
          <MakeMagicField defaultValue={resource.make_magic} w="16em" />
          {makeMagic && (
            <>
              <RarityMinimumField defaultValue={resource.rarity_minimum} />
              <RequiredAttunementSlotsMinimumField
                defaultValue={resource.required_attunement_slots_minimum}
              />
            </>
          )}
        </HStack>

        {makeMagic && requiredAttunementSlotsMinimum > 0 && (
          <AttunementNotesDeltaField
            defaultValue={resource.attunement_notes_delta[lang] ?? ""}
          />
        )}

        <NotesDeltaField defaultValue={resource.notes_delta[lang] ?? ""} />

        <EquipmentField
          defaultValue={resource.equipment_ids}
          sourceId={sourceId}
          w="full"
        />
      </ResourceEditor>
    );
  };
}
