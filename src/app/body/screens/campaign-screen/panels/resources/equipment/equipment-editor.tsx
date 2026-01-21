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
  createCostInputField,
  createSelectEnumField,
  createSelectField,
  createTextareaField,
  createWeightInputField,
} from "../resource-editor-form";

//------------------------------------------------------------------------------
// Create Equipment Editor
//------------------------------------------------------------------------------

export type EquipmentEditorProps = {
  children?: ReactNode;
  resource: Equipment;
};

export function createEquipmentEditor<E extends EquipmentFormData>(
  form: Form<E>,
) {
  //----------------------------------------------------------------------------
  // Resource Editor
  //----------------------------------------------------------------------------

  const ResourceEditor = createResourceEditor(form);

  //----------------------------------------------------------------------------
  // Cost
  //----------------------------------------------------------------------------

  const CostField = createCostInputField({
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

  const MagicField = createSelectField({
    i18nContext: { label: { en: "Magic", it: "Magico" } },
    inputProps: {
      parse: (value) => value === "true",
      stringify: (value) => `${value}`,
    },
    useField: form.createUseField("magic"),
    useOptions: () => useBooleanOptions(magicFieldBooleanOptionsI18nContext),
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

  const WeightField = createWeightInputField({
    i18nContext: { label: { en: "Weight", it: "Peso" } },
    useField: form.createUseField("weight"),
  });

  //----------------------------------------------------------------------------
  // Equipment Editor
  //----------------------------------------------------------------------------

  return function EquipmentEditor({
    children,
    resource,
  }: EquipmentEditorProps) {
    const [lang] = useI18nLang();

    return (
      <ResourceEditor resource={resource}>
        <HStack align="flex-start" gap={4}>
          <WeightField defaultValue={resource.weight} />
          <CostField defaultValue={resource.cost} />
          <MagicField defaultValue={resource.magic} />
          <RarityField defaultValue={resource.rarity} />
        </HStack>

        {children}

        <NotesField defaultValue={resource.notes[lang] ?? ""} />
      </ResourceEditor>
    );
  };
}
