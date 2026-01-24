import type { CreatureTag } from "~/models/resources/creature-tags/creature-tag";
import type { CreatureTagFormData } from "~/models/resources/creature-tags/creature-tag-form";
import type { Form } from "~/utils/form";
import { createResourceEditor } from "../resource-editor";

//------------------------------------------------------------------------------
// Create CreatureTag Editor
//------------------------------------------------------------------------------

export type CreatureTagEditorProps = {
  resource: CreatureTag;
};

export function createCreatureTagEditor(form: Form<CreatureTagFormData>) {
  //----------------------------------------------------------------------------
  // Resource Editor
  //----------------------------------------------------------------------------

  const ResourceEditor = createResourceEditor(form);

  //----------------------------------------------------------------------------
  // CreatureTag Editor
  //----------------------------------------------------------------------------

  return function CreatureTagEditor({ resource }: CreatureTagEditorProps) {
    return <ResourceEditor resource={resource} />;
  };
}
