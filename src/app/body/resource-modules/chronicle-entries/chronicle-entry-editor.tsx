import { HStack } from "@chakra-ui/react";
import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import type { ChronicleEntry } from "~/models/resources/chronicle-entries/chronicle-entry";
import type { ChronicleEntryFormData } from "~/models/resources/chronicle-entries/chronicle-entry-form";
import { chronicleEntryStore } from "~/models/resources/chronicle-entries/chronicle-entry-store";
import { factionStore } from "~/models/resources/factions/faction-store";
import { npcStore } from "~/models/resources/npcs/npc-store";
import { placeStore } from "~/models/resources/places/place-store";
import { planeStore } from "~/models/resources/planes/plane-store";
import Field from "~/ui/field";
import type { Form } from "~/utils/form";
import ChronicleDateInput from "../chronicle-date-input";
import { createResourceEditor } from "../resource-editor";
import { createResourceSearchField, createTextareaField } from "../resource-editor-form";
import { useResourceEditorLang } from "../resource-editor-language-context";

//------------------------------------------------------------------------------
// Create Chronicle Entry Editor
//------------------------------------------------------------------------------

export function createChronicleEntryEditor(form: Form<ChronicleEntryFormData>) {
  const ResourceEditor = createResourceEditor(form);

  const useSubjects = chronicleEntryStore.useRelatedEntries;
  const useDateField = form.createUseField("date");

  const PlaneIdsField = createResourceSearchField({
    hideFilter: true,
    i18nContext: {
      label: { en: "Planes", it: "Piani" },
      placeholder: { en: "Search planes", it: "Cerca piani" },
    },
    useField: form.createUseField("plane_ids"),
    useOptions: planeStore.useResourceOptions,
  });

  const PlaceIdsField = createResourceSearchField({
    hideFilter: true,
    i18nContext: {
      label: { en: "Places", it: "Luoghi" },
      placeholder: { en: "Search places", it: "Cerca luoghi" },
    },
    useField: form.createUseField("place_ids"),
    useOptions: placeStore.useResourceOptions,
  });

  const FactionIdsField = createResourceSearchField({
    hideFilter: true,
    i18nContext: {
      label: { en: "Factions", it: "Fazioni" },
      placeholder: { en: "Search factions", it: "Cerca fazioni" },
    },
    useField: form.createUseField("faction_ids"),
    useOptions: factionStore.useResourceOptions,
  });

  const NpcIdsField = createResourceSearchField({
    hideFilter: true,
    i18nContext: {
      label: { en: "NPCs", it: "PNG" },
      placeholder: { en: "Search NPCs", it: "Cerca PNG" },
    },
    useField: form.createUseField("npc_ids"),
    useOptions: npcStore.useResourceOptions,
  });

  const DescriptionField = createTextareaField({
    i18nContext: {
      label: { en: "Description", it: "Descrizione" },
      placeholder: { en: "Enter a chronicle entry", it: "Inserisci una voce della cronologia" },
    },
    inputProps: { rows: 10 },
    translatable: true,
    useField: form.createUseField("description"),
  });

  return function ChronicleEntryEditor({
    resource,
    sourceId,
  }: {
    resource: ChronicleEntry;
    sourceId: string;
  }) {
    const { lang } = useResourceEditorLang();
    const { t } = useI18nLangContext(i18nContext);
    const related = useSubjects(resource.id, "subjects");
    const dateField = useDateField(resource.date);

    return (
      <ResourceEditor resource={resource}>
        <Field label={t("date")}>
          <ChronicleDateInput
            onChange={(value) => dateField.onValueChange(value ?? emptyChronicleDate)}
            value={dateField.value}
            w="full"
          />
        </Field>
        <HStack align="flex-start" gap={4}>
          <PlaneIdsField
            defaultValue={related.filter(({ kind }) => kind === "plane").map(({ id }) => id)}
            sourceId={sourceId}
          />
          <PlaceIdsField
            defaultValue={related.filter(({ kind }) => kind === "place").map(({ id }) => id)}
            sourceId={sourceId}
          />
        </HStack>
        <HStack align="flex-start" gap={4}>
          <FactionIdsField
            defaultValue={related.filter(({ kind }) => kind === "faction").map(({ id }) => id)}
            sourceId={sourceId}
          />
          <NpcIdsField
            defaultValue={related.filter(({ kind }) => kind === "npc").map(({ id }) => id)}
            sourceId={sourceId}
          />
        </HStack>
        <DescriptionField defaultValue={resource.description[lang] ?? ""} />
      </ResourceEditor>
    );
  };
}

//------------------------------------------------------------------------------
// Empty Chronicle Date
//------------------------------------------------------------------------------

const emptyChronicleDate = {
  day: null,
  era: null,
  hour: null,
  minute: null,
  month: null,
  year: null,
};

//------------------------------------------------------------------------------
// I18n Context
//------------------------------------------------------------------------------

const i18nContext = {
  date: { en: "Date", it: "Data" },
};
