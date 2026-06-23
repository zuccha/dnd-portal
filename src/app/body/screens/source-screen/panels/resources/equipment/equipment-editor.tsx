import { HStack } from "@chakra-ui/react";
import { type ReactNode } from "react";
import useBooleanOptions from "~/hooks/use-boolean-options";
import { useI18nLang } from "~/i18n/i18n-lang";
import type { Equipment } from "~/models/resources/equipment/equipment";
import type { EquipmentFormData } from "~/models/resources/equipment/equipment-form";
import { useEquipmentRarityOptions } from "~/models/types/equipment-rarity";
import type { Form } from "~/utils/form";
import { createResourceEditor } from "../resource-editor";
import {
  createFeatureEntriesField,
  createInputField,
  createNullableCostInputField,
  createNullableWeightInputField,
  createNumberInputField,
  createSelectEnumField,
  createSelectField,
  createTextareaField,
} from "../resource-editor-form";

//------------------------------------------------------------------------------
// Create Equipment Editor
//------------------------------------------------------------------------------

export type EquipmentEditorProps = {
  children?: ReactNode;
  resource: Equipment;
  sourceId: string;
};

export function createEquipmentEditor<E extends EquipmentFormData>(
  form: Form<E>,
) {
  //----------------------------------------------------------------------------
  // Resource Editor
  //----------------------------------------------------------------------------

  const ResourceEditor = createResourceEditor(form);

  //----------------------------------------------------------------------------
  // Feature Entries
  //----------------------------------------------------------------------------

  const FeatureEntriesField = createFeatureEntriesField({
    i18nContext: { label: { en: "Qualities", it: "Qualità" } },
    useField: form.createUseField("feature_entries"),
  });

  //----------------------------------------------------------------------------
  // Cost
  //----------------------------------------------------------------------------

  const CostField = createNullableCostInputField({
    i18nContext: { label: { en: "Cost", it: "Costo" } },
    useField: form.createUseField("cost"),
  });

  //----------------------------------------------------------------------------
  // Magic
  //----------------------------------------------------------------------------

  const magicFieldBooleanOptionsI18nContext = {
    false: { en: "Non Magic", it: "Non Magico" },
    true: { en: "Magic", it: "Magico" },
  };

  const useMagicField = form.createUseField("magic");

  const MagicField = createSelectField({
    i18nContext: { label: { en: "Magic", it: "Magico" } },
    inputProps: {
      parse: (value) => value === "true",
      stringify: (value) => `${value}`,
    },
    useField: useMagicField,
    useOptions: () => useBooleanOptions(magicFieldBooleanOptionsI18nContext),
  });

  //----------------------------------------------------------------------------
  // Attunement
  //----------------------------------------------------------------------------

  const useRequiredAttunementSlotsField = form.createUseField(
    "required_attunement_slots",
  );

  const RequiredAttunementSlotsField = createNumberInputField({
    i18nContext: {
      label: { en: "Attunement Slots", it: "Slot Sintonia" },
    },
    inputProps: { min: 0 },
    useField: useRequiredAttunementSlotsField,
  });

  const AttunementNotesField = createInputField({
    i18nContext: {
      label: { en: "Attunement Notes", it: "Note Sintonia" },
      placeholder: { en: "None", it: "Nessuna" },
    },
    translatable: true,
    useField: form.createUseField("attunement_notes"),
  });

  //----------------------------------------------------------------------------
  // Rarity
  //----------------------------------------------------------------------------

  const RarityField = createSelectEnumField({
    i18nContext: { label: { en: "Rarity", it: "Rarità" } },
    useField: form.createUseField("rarity"),
    useOptions: useEquipmentRarityOptions,
  });

  //----------------------------------------------------------------------------
  // Notes
  //----------------------------------------------------------------------------

  const NotesField = createTextareaField({
    i18nContext: {
      label: { en: "Notes", it: "Note" },
      placeholder: { en: "None", it: "Nessuna" },
    },
    inputProps: { rows: 4 },
    translatable: true,
    useField: form.createUseField("notes"),
  });

  //----------------------------------------------------------------------------
  // Weight
  //----------------------------------------------------------------------------

  const WeightField = createNullableWeightInputField({
    i18nContext: { label: { en: "Weight", it: "Peso" } },
    useField: form.createUseField("weight"),
  });

  //----------------------------------------------------------------------------
  // Equipment Editor
  //----------------------------------------------------------------------------

  return function EquipmentEditor({
    children,
    resource,
    sourceId,
  }: EquipmentEditorProps) {
    const [lang] = useI18nLang();
    const { value: magic } = useMagicField(resource.magic);
    const { value: requiredAttunementSlots } = useRequiredAttunementSlotsField(
      resource.required_attunement_slots,
    );

    return (
      <ResourceEditor resource={resource}>
        <HStack align="flex-start" gap={4}>
          <MagicField defaultValue={resource.magic} />
          <RarityField defaultValue={resource.rarity} />
          <WeightField defaultValue={resource.weight} />
          <CostField defaultValue={resource.cost} />
        </HStack>

        {magic && (
          <HStack align="flex-start" gap={4} w="full">
            <RequiredAttunementSlotsField
              defaultValue={resource.required_attunement_slots}
              maxW="7em"
            />
            {requiredAttunementSlots > 0 && (
              <AttunementNotesField
                defaultValue={resource.attunement_notes[lang] ?? ""}
                flex={1}
              />
            )}
          </HStack>
        )}

        {children}

        <NotesField defaultValue={resource.notes[lang] ?? ""} />

        <FeatureEntriesField
          defaultValue={resource.feature_entries}
          sourceId={sourceId}
          w="full"
        />
      </ResourceEditor>
    );
  };
}
