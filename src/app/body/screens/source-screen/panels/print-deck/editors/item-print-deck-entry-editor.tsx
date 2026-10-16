import type { LocalizedItem } from "~/models/resources/equipment/items/localized-item";
import EquipmentPrintDeckEntryEditor from "./equipment-print-deck-entry-editor";
import type { PrintDeckEntryEditorProps } from "../print-deck-entry-editor-props";

//------------------------------------------------------------------------------
// Item Print Deck Entry Editor
//------------------------------------------------------------------------------

export default function ItemPrintDeckEntryEditor({
  localizedResource,
  onLocalizedResourceUpdate,
}: PrintDeckEntryEditorProps<LocalizedItem>) {
  return (
    <EquipmentPrintDeckEntryEditor
      localizedResource={localizedResource}
      onLocalizedResourceUpdate={onLocalizedResourceUpdate}
    />
  );
}
