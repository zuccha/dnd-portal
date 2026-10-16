import type { LocalizedWeapon } from "~/models/resources/equipment/weapons/localized-weapon";
import EquipmentPrintDeckEntryEditor from "./equipment-print-deck-entry-editor";
import type { PrintDeckEntryEditorProps } from "../print-deck-entry-editor-props";

//------------------------------------------------------------------------------
// Weapon Print Deck Entry Editor
//------------------------------------------------------------------------------

export default function WeaponPrintDeckEntryEditor({
  localizedResource,
  onLocalizedResourceUpdate,
}: PrintDeckEntryEditorProps<LocalizedWeapon>) {
  return (
    <EquipmentPrintDeckEntryEditor
      localizedResource={localizedResource}
      onLocalizedResourceUpdate={onLocalizedResourceUpdate}
    />
  );
}
