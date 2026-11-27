import { HStack, SimpleGrid } from "@chakra-ui/react";
import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import { creatureStore } from "~/models/resources/creatures/creature-store";
import type { Npc } from "~/models/resources/npcs/npc";
import type { NpcFormData } from "~/models/resources/npcs/npc-form";
import { speciesStore } from "~/models/resources/species/species-store";
import Field from "~/ui/field";
import type { Form } from "~/utils/form";
import ChronicleDateInput from "../chronicle-date-input";
import { createResourceEditor } from "../resource-editor";
import { createSingleResourceField, createTextareaField } from "../resource-editor-form";
import { useResourceEditorLang } from "../resource-editor-language-context";

//------------------------------------------------------------------------------
// Create NPC Editor
//------------------------------------------------------------------------------

export function createNpcEditor(form: Form<NpcFormData>) {
  const ResourceEditor = createResourceEditor(form);
  const SpeciesField = createSingleResourceField({
    i18nContext: {
      label: { en: "Species", it: "Specie" },
      placeholder: { en: "Search species", it: "Cerca specie" },
    },
    useField: form.createUseField("species_id"),
    useOptions: speciesStore.useResourceOptions,
  });
  const CreatureField = createSingleResourceField({
    i18nContext: {
      label: { en: "Creature", it: "Creatura" },
      placeholder: { en: "Search creatures", it: "Cerca creature" },
    },
    useField: form.createUseField("creature_id"),
    useOptions: creatureStore.useResourceOptions,
  });
  const DescriptionField = createTextareaField({
    i18nContext: {
      label: { en: "Description", it: "Descrizione" },
      placeholder: { en: "None", it: "Nessuna" },
    },
    inputProps: { rows: 12 },
    translatable: true,
    useField: form.createUseField("description"),
  });
  const useDateOfBirthField = form.createUseField("date_of_birth");
  const useDateOfDeathField = form.createUseField("date_of_death");

  return function NpcEditor({ resource, sourceId }: { resource: Npc; sourceId: string }) {
    const { lang } = useResourceEditorLang();
    const { t } = useI18nLangContext(i18nContext);
    const dateOfBirth = useDateOfBirthField(resource.date_of_birth);
    const dateOfDeath = useDateOfDeathField(resource.date_of_death);

    return (
      <ResourceEditor resource={resource}>
        <HStack align="flex-start" gap={4}>
          <CreatureField defaultValue={resource.creature_id} sourceId={sourceId} />
          <SpeciesField defaultValue={resource.species_id} sourceId={sourceId} />
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
