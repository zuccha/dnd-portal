import { HStack, SimpleGrid } from "@chakra-ui/react";
import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import { characterClassStore } from "~/models/resources/character-classes/character-class-store";
import type { Pc } from "~/models/resources/pcs/pc";
import type { PcFormData } from "~/models/resources/pcs/pc-form";
import { speciesStore } from "~/models/resources/species/species-store";
import { usePcStatusOptions } from "~/models/types/pc-status";
import Field from "~/ui/field";
import type { Form } from "~/utils/form";
import ChronicleDateInput from "../chronicle-date-input";
import { createResourceEditor } from "../resource-editor";
import {
  createMultipleSelectIdsField,
  createNumberInputField,
  createSelectEnumField,
  createSingleResourceField,
  createTextareaField,
} from "../resource-editor-form";
import { useResourceEditorLang } from "../resource-editor-language-context";

//------------------------------------------------------------------------------
// PC Editor Props
//------------------------------------------------------------------------------

type PcEditorProps = { resource: Pc; sourceId: string };

//------------------------------------------------------------------------------
// Create PC Editor
//------------------------------------------------------------------------------

export function createPcEditor(form: Form<PcFormData>) {
  //----------------------------------------------------------------------------
  // Resource Editor
  //----------------------------------------------------------------------------

  const ResourceEditor = createResourceEditor(form);

  //----------------------------------------------------------------------------
  // Species Field
  //----------------------------------------------------------------------------

  const SpeciesField = createSingleResourceField({
    i18nContext: {
      label: { en: "Species", it: "Specie" },
      placeholder: { en: "Search species", it: "Cerca specie" },
    },
    useField: form.createUseField("species_id"),
    useOptions: speciesStore.useResourceOptions,
  });

  //----------------------------------------------------------------------------
  // Class Ids Field
  //----------------------------------------------------------------------------

  const ClassIdsField = createMultipleSelectIdsField({
    i18nContext: {
      label: { en: "Classes", it: "Classi" },
      placeholder: { en: "Select classes", it: "Seleziona le classi" },
    },
    useField: form.createUseField("class_ids"),
    useOptions: characterClassStore.useResourceOptions,
  });

  //----------------------------------------------------------------------------
  // Status Field
  //----------------------------------------------------------------------------

  const StatusField = createSelectEnumField({
    i18nContext: { label: { en: "Status", it: "Stato" } },
    useField: form.createUseField("status"),
    useOptions: usePcStatusOptions,
  });

  //----------------------------------------------------------------------------
  // Level Field
  //----------------------------------------------------------------------------

  const LevelField = createNumberInputField({
    i18nContext: { label: { en: "Character Level", it: "Livello del personaggio" } },
    useField: form.createUseField("level"),
  });

  //----------------------------------------------------------------------------
  // Description Field
  //----------------------------------------------------------------------------

  const DescriptionField = createTextareaField({
    i18nContext: {
      label: { en: "Description", it: "Descrizione" },
      placeholder: { en: "Describe the character", it: "Descrivi il personaggio" },
    },
    inputProps: { rows: 12 },
    translatable: true,
    useField: form.createUseField("description"),
  });

  //----------------------------------------------------------------------------
  // Date Fields
  //----------------------------------------------------------------------------

  const useDateOfBirthField = form.createUseField("date_of_birth");
  const useDateOfDeathField = form.createUseField("date_of_death");

  //----------------------------------------------------------------------------
  // PC Editor
  //----------------------------------------------------------------------------

  return function PcEditor({ resource, sourceId }: PcEditorProps) {
    const { lang } = useResourceEditorLang();
    const { t } = useI18nLangContext(i18nContext);
    const dateOfBirth = useDateOfBirthField(resource.date_of_birth);
    const dateOfDeath = useDateOfDeathField(resource.date_of_death);

    return (
      <ResourceEditor resource={resource}>
        <HStack align="flex-start" gap={4}>
          <SpeciesField defaultValue={resource.species_id} sourceId={sourceId} />
          <ClassIdsField defaultValue={resource.class_ids} sourceId={sourceId} />
        </HStack>
        <HStack align="flex-start" gap={4}>
          <StatusField defaultValue={resource.status} />
          <LevelField defaultValue={resource.level} />
        </HStack>
        <SimpleGrid columns={{ base: 1, sm: 2 }} columnGap={4}>
          <Field label={t("date_of_birth")}>
            <ChronicleDateInput
              onChange={dateOfBirth.onValueChange}
              size="sm"
              value={dateOfBirth.value}
              w="full"
            />
          </Field>
          <Field label={t("date_of_death")}>
            <ChronicleDateInput
              onChange={dateOfDeath.onValueChange}
              size="sm"
              value={dateOfDeath.value}
              w="full"
            />
          </Field>
        </SimpleGrid>
        <DescriptionField defaultValue={resource.description[lang] ?? ""} />
      </ResourceEditor>
    );
  };
}

//------------------------------------------------------------------------------
// I18n Context
//------------------------------------------------------------------------------

const i18nContext = {
  date_of_birth: { en: "Date of Birth", it: "Data di nascita" },
  date_of_death: { en: "Date of Death", it: "Data di morte" },
};
