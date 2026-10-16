import type { LocalizedArmor } from "~/models/resources/equipment/armors/localized-armor";
import EquipmentPrintDeckEntryEditor from "./equipment-print-deck-entry-editor";
import type { PrintDeckEntryEditorProps } from "../print-deck-entry-editor-props";

//------------------------------------------------------------------------------
// Armor Print Deck Entry Editor
//------------------------------------------------------------------------------

export default function ArmorPrintDeckEntryEditor({
  localizedResource,
  onLocalizedResourceUpdate,
}: PrintDeckEntryEditorProps<LocalizedArmor>) {
  return (
    <EquipmentPrintDeckEntryEditor
      localizedResource={localizedResource}
      onLocalizedResourceUpdate={onLocalizedResourceUpdate}
    />
  );
}
