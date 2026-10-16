import { HStack } from "@chakra-ui/react";
import { type ReactNode } from "react";
import useBooleanOptions from "~/hooks/use-boolean-options";
import type { RelatedResourceEntryByName } from "~/models/catalogue/resource-relations";
import type { Equipment } from "~/models/resources/equipment/equipment";
import type { EquipmentFormData } from "~/models/resources/equipment/equipment-form";
import type { ResourceOption } from "~/models/resources/resource";
import { useEquipmentRarityOptions } from "~/models/types/equipment-rarity";
import type { Form } from "~/utils/form";
import { createResourceEditor } from "../resource-editor";
import {
  createFeatureEntriesField,
  createInputField,
  createNullableCostInputField,
  createNullableWeightInputField,
  createNumberInputField,
  createResourceSearchField,
  createSelectEnumField,
  createSelectField,
  createTextareaField,
} from "../resource-editor-form";
import { useResourceEditorLang } from "../resource-editor-language-context";

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
  resourceStore: {
    useRelatedEntries: (
      resourceId: string,
      name: "features",
    ) => RelatedResourceEntryByName<"armor", "features">[];
  },
  modifierStore: { useResourceOptions: (sourceId: string) => ResourceOption[] },
) {
  const { useRelatedEntries: useEquipmentRelatedEntries } = resourceStore;
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
  // Modifiers
  //----------------------------------------------------------------------------

  const ModifiersField = createResourceSearchField({
    i18nContext: {
      label: { en: "Supported Modifiers", it: "Modificatori Supportati" },
      placeholder: { en: "Search modifier", it: "Cerca modificatore" },
    },
    useField: form.createUseField("modifier_ids"),
    useOptions: modifierStore.useResourceOptions,
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

  const useMagicField = form.createUseField("is_magic");

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

  const useRequiredAttunementSlotsField = form.createUseField("required_attunement_slots");

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
  // Description
  //----------------------------------------------------------------------------

  const DescriptionField = createTextareaField({
    i18nContext: {
      label: { en: "Description", it: "Descrizione" },
      placeholder: { en: "None", it: "Nessuna" },
    },
    inputProps: { rows: 10 },
    translatable: true,
    useField: form.createUseField("description"),
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

  return function EquipmentEditor({ children, resource, sourceId }: EquipmentEditorProps) {
    const { lang } = useResourceEditorLang();
    const featureEntries = useEquipmentRelatedEntries(resource.id, "features");
    const { value: magic } = useMagicField(resource.is_magic);
    const { value: requiredAttunementSlots } = useRequiredAttunementSlotsField(
      resource.required_attunement_slots,
    );

    return (
      <ResourceEditor resource={resource}>
        <HStack align="flex-start" gap={4}>
          <WeightField defaultValue={resource.weight} />
          <CostField defaultValue={resource.cost} />
          <MagicField defaultValue={resource.is_magic} />
        </HStack>

        <HStack align="flex-start" gap={4} hidden={!magic}>
          <RarityField defaultValue={resource.rarity} />
          <RequiredAttunementSlotsField defaultValue={resource.required_attunement_slots} />
        </HStack>

        <AttunementNotesField
          defaultValue={resource.attunement_notes[lang] ?? ""}
          hidden={!magic || requiredAttunementSlots <= 0}
          w="full"
        />

        {children}

        <DescriptionField defaultValue={resource.description[lang] ?? ""} />

        <ModifiersField defaultValue={resource.modifier_ids} sourceId={sourceId} w="full" />

        <FeatureEntriesField defaultValue={featureEntries} sourceId={sourceId} w="full" />
      </ResourceEditor>
    );
  };
}
