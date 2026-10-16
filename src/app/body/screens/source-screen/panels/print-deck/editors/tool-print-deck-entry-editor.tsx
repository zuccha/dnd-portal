import type { LocalizedTool } from "~/models/resources/equipment/tools/localized-tool";
import EquipmentPrintDeckEntryEditor from "./equipment-print-deck-entry-editor";
import type { PrintDeckEntryEditorProps } from "../print-deck-entry-editor-props";

//------------------------------------------------------------------------------
// Tool Print Deck Entry Editor
//------------------------------------------------------------------------------

export default function ToolPrintDeckEntryEditor({
  localizedResource,
  onLocalizedResourceUpdate,
}: PrintDeckEntryEditorProps<LocalizedTool>) {
  return (
    <EquipmentPrintDeckEntryEditor
      localizedResource={localizedResource}
      onLocalizedResourceUpdate={onLocalizedResourceUpdate}
    />
  );
}
