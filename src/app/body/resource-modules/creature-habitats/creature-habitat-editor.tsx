import { creatureFamilyStore } from "~/models/resources/creature-families/creature-family-store";
import type { CreatureHabitat } from "~/models/resources/creature-habitats/creature-habitat";
import type { CreatureHabitatFormData } from "~/models/resources/creature-habitats/creature-habitat-form";
import { creatureHabitatStore } from "~/models/resources/creature-habitats/creature-habitat-store";
import type { Form } from "~/utils/form";
import { createResourceEditor } from "../resource-editor";
import { createMultipleSelectIdsField } from "../resource-editor-form";

const useCreatureHabitatRelatedIds = creatureHabitatStore.useRelatedIds;

//------------------------------------------------------------------------------
// Create Creature Habitat Editor
//------------------------------------------------------------------------------

export function createCreatureHabitatEditor(form: Form<CreatureHabitatFormData>) {
  const ResourceEditor = createResourceEditor(form);
  const FamilyIdsField = createMultipleSelectIdsField({
    i18nContext: {
      label: { en: "Families", it: "Famiglie" },
      placeholder: { en: "None", it: "Nessuna" },
    },
    useField: form.createUseField("family_ids"),
    useOptions: creatureFamilyStore.useResourceOptions,
  });

  return function CreatureHabitatEditor({
    resource,
    sourceId,
  }: {
    resource: CreatureHabitat;
    sourceId: string;
  }) {
    const familyIds = useCreatureHabitatRelatedIds(resource.id, "families");

    return (
      <ResourceEditor resource={resource}>
        <FamilyIdsField defaultValue={familyIds} sourceId={sourceId} />
      </ResourceEditor>
    );
  };
}
