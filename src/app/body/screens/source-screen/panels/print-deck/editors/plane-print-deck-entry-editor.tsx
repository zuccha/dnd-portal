import type { LocalizedPlane } from "~/models/resources/planes/localized-plane";
import Field from "~/ui/field";
import Input from "~/ui/input";
import type { PrintDeckEntryEditorProps } from "../print-deck-entry-editor-props";

//------------------------------------------------------------------------------
// Plane Print Deck Entry Editor
//------------------------------------------------------------------------------

export default function PlanePrintDeckEntryEditor({
  localizedResource,
  onLocalizedResourceUpdate,
}: PrintDeckEntryEditorProps<LocalizedPlane>) {
  return (
    <Field label={localizedResource.alignments.label}>
      <Input
        onValueChange={(value) =>
          onLocalizedResourceUpdate("alignments", { ...localizedResource.alignments, value })
        }
        value={localizedResource.alignments.value}
      />
    </Field>
  );
}
