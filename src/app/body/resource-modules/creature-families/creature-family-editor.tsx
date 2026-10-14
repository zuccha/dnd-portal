import type { CreatureFamily } from "~/models/resources/creature-families/creature-family";
import type { CreatureFamilyFormData } from "~/models/resources/creature-families/creature-family-form";
import { planeStore } from "~/models/resources/planes/plane-store";
import { useCreatureHabitatOptions } from "~/models/types/creature-habitat";
import { useCreatureTreasureOptions } from "~/models/types/creature-treasure";
import type { Form } from "~/utils/form";
import { createResourceEditor } from "../resource-editor";
import {
  createMultipleSelectEnumField,
  createMultipleSelectIdsField,
} from "../resource-editor-form";

//------------------------------------------------------------------------------
// Create Creature Family Editor
//------------------------------------------------------------------------------

export function createCreatureFamilyEditor(form: Form<CreatureFamilyFormData>) {
  const ResourceEditor = createResourceEditor(form);
  const HabitatsField = createMultipleSelectEnumField({
    i18nContext: {
      label: { en: "Habitats", it: "Habitat" },
      placeholder: { en: "None", it: "Nessuno" },
    },
    useField: form.createUseField("habitats"),
    useOptions: useCreatureHabitatOptions,
  });
  const TreasuresField = createMultipleSelectEnumField({
    i18nContext: {
      label: { en: "Treasures", it: "Tesori" },
      placeholder: { en: "None", it: "Nessuno" },
    },
    useField: form.createUseField("treasures"),
    useOptions: useCreatureTreasureOptions,
  });
  const PlaneIdsField = createMultipleSelectIdsField({
    i18nContext: {
      label: { en: "Planes", it: "Piani" },
      placeholder: { en: "None", it: "Nessuno" },
    },
    useField: form.createUseField("plane_ids"),
    useOptions: planeStore.useResourceOptions,
  });

  return function CreatureFamilyEditor({
    resource,
    sourceId,
  }: {
    resource: CreatureFamily;
    sourceId: string;
  }) {
    return (
      <ResourceEditor resource={resource}>
        <HabitatsField defaultValue={resource.habitats} />
        <TreasuresField defaultValue={resource.treasures} />
        <PlaneIdsField defaultValue={resource.plane_ids} sourceId={sourceId} />
      </ResourceEditor>
    );
  };
}
