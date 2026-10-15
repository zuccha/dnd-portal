import { creatureFamilyStore } from "~/models/resources/creature-families/creature-family-store";
import type { CreatureTreasure } from "~/models/resources/creature-treasures/creature-treasure";
import type { CreatureTreasureFormData } from "~/models/resources/creature-treasures/creature-treasure-form";
import { creatureTreasureStore } from "~/models/resources/creature-treasures/creature-treasure-store";
import type { Form } from "~/utils/form";
import { createResourceEditor } from "../resource-editor";
import { createMultipleSelectIdsField } from "../resource-editor-form";

const useCreatureTreasureRelatedIds = creatureTreasureStore.useRelatedIds;

//------------------------------------------------------------------------------
// Create Creature Treasure Editor
//------------------------------------------------------------------------------

export function createCreatureTreasureEditor(form: Form<CreatureTreasureFormData>) {
  const ResourceEditor = createResourceEditor(form);
  const FamilyIdsField = createMultipleSelectIdsField({
    i18nContext: {
      label: { en: "Families", it: "Famiglie" },
      placeholder: { en: "None", it: "Nessuna" },
    },
    useField: form.createUseField("family_ids"),
    useOptions: creatureFamilyStore.useResourceOptions,
  });

  return function CreatureTreasureEditor({
    resource,
    sourceId,
  }: {
    resource: CreatureTreasure;
    sourceId: string;
  }) {
    const familyIds = useCreatureTreasureRelatedIds(resource.id, "families");

    return (
      <ResourceEditor resource={resource}>
        <FamilyIdsField defaultValue={familyIds} sourceId={sourceId} />
      </ResourceEditor>
    );
  };
}
