import type { CreatureFamily } from "~/models/resources/creature-families/creature-family";
import type { CreatureFamilyFormData } from "~/models/resources/creature-families/creature-family-form";
import { creatureFamilyStore } from "~/models/resources/creature-families/creature-family-store";
import { creatureHabitatStore } from "~/models/resources/creature-habitats/creature-habitat-store";
import { planeStore } from "~/models/resources/planes/plane-store";
import { useCreatureTreasureOptions } from "~/models/types/creature-treasure";
import type { Form } from "~/utils/form";
import { createResourceEditor } from "../resource-editor";
import {
  createMultipleSelectEnumField,
  createMultipleSelectIdsField,
} from "../resource-editor-form";

const useCreatureFamilyRelatedIds = creatureFamilyStore.useRelatedIds;

//------------------------------------------------------------------------------
// Create Creature Family Editor
//------------------------------------------------------------------------------

export function createCreatureFamilyEditor(
  form: Form<CreatureFamilyFormData>,
  { showHabitatRelations = true }: { showHabitatRelations?: boolean } = {},
) {
  const ResourceEditor = createResourceEditor(form);
  const HabitatsField = showHabitatRelations
    ? createMultipleSelectIdsField({
        i18nContext: {
          label: { en: "Habitats", it: "Habitat" },
          placeholder: { en: "None", it: "Nessuno" },
        },
        useField: form.createUseField("habitat_ids"),
        useOptions: creatureHabitatStore.useResourceOptions,
      })
    : undefined;
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
    const habitatIds = useCreatureFamilyRelatedIds(resource.id, "habitats");

    return (
      <ResourceEditor resource={resource}>
        {HabitatsField && <HabitatsField defaultValue={habitatIds} sourceId={sourceId} />}
        <TreasuresField defaultValue={resource.treasures} />
        <PlaneIdsField defaultValue={resource.plane_ids} sourceId={sourceId} />
      </ResourceEditor>
    );
  };
}
