import type { CreatureFamily } from "~/models/resources/creature-families/creature-family";
import type { CreatureFamilyFormData } from "~/models/resources/creature-families/creature-family-form";
import { creatureFamilyStore } from "~/models/resources/creature-families/creature-family-store";
import { creatureHabitatStore } from "~/models/resources/creature-habitats/creature-habitat-store";
import { creatureTreasureStore } from "~/models/resources/creature-treasures/creature-treasure-store";
import { planeStore } from "~/models/resources/planes/plane-store";
import type { Form } from "~/utils/form";
import { createResourceEditor } from "../resource-editor";
import { createMultipleSelectIdsField } from "../resource-editor-form";

const useCreatureFamilyRelatedIds = creatureFamilyStore.useRelatedIds;

//------------------------------------------------------------------------------
// Create Creature Family Editor
//------------------------------------------------------------------------------

export function createCreatureFamilyEditor(form: Form<CreatureFamilyFormData>) {
  const ResourceEditor = createResourceEditor(form);
  const HabitatsField = createMultipleSelectIdsField({
    i18nContext: {
      label: { en: "Habitats", it: "Habitat" },
      placeholder: { en: "None", it: "Nessuno" },
    },
    useField: form.createUseField("habitat_ids"),
    useOptions: creatureHabitatStore.useResourceOptions,
  });
  const TreasuresField = createMultipleSelectIdsField({
    i18nContext: {
      label: { en: "Treasures", it: "Tesori" },
      placeholder: { en: "None", it: "Nessuno" },
    },
    useField: form.createUseField("treasure_ids"),
    useOptions: creatureTreasureStore.useResourceOptions,
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
    const treasureIds = useCreatureFamilyRelatedIds(resource.id, "treasures");

    return (
      <ResourceEditor resource={resource}>
        <HabitatsField defaultValue={habitatIds} sourceId={sourceId} />
        <TreasuresField defaultValue={treasureIds} sourceId={sourceId} />
        <PlaneIdsField defaultValue={resource.plane_ids} sourceId={sourceId} />
      </ResourceEditor>
    );
  };
}
