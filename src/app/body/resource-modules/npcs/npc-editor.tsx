import { creatureStore } from "~/models/resources/creatures/creature-store";
import type { Npc } from "~/models/resources/npcs/npc";
import type { NpcFormData } from "~/models/resources/npcs/npc-form";
import type { Form } from "~/utils/form";
import { createResourceEditor } from "../resource-editor";
import { createSingleResourceField, createTextareaField } from "../resource-editor-form";
import { useResourceEditorLang } from "../resource-editor-language-context";

//------------------------------------------------------------------------------
// Create NPC Editor
//------------------------------------------------------------------------------

export function createNpcEditor(form: Form<NpcFormData>) {
  const ResourceEditor = createResourceEditor(form);
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

  return function NpcEditor({ resource, sourceId }: { resource: Npc; sourceId: string }) {
    const { lang } = useResourceEditorLang();

    return (
      <ResourceEditor resource={resource}>
        <CreatureField defaultValue={resource.creature_id} sourceId={sourceId} />
        <DescriptionField defaultValue={resource.description[lang] ?? ""} />
      </ResourceEditor>
    );
  };
}

//------------------------------------------------------------------------------
// I18n Context
//------------------------------------------------------------------------------
