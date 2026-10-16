import type { LocalizedWeaponModifier } from "~/models/resources/modifiers/equipment/weapons/localized-weapon-modifier";
import EquipmentModifierPrintDeckEntryEditor from "./equipment-modifier-print-deck-entry-editor";
import type { PrintDeckEntryEditorProps } from "../print-deck-entry-editor-props";

//------------------------------------------------------------------------------
// Weapon Modifier Print Deck Entry Editor
//------------------------------------------------------------------------------

export default function WeaponModifierPrintDeckEntryEditor(
  props: PrintDeckEntryEditorProps<LocalizedWeaponModifier>,
) {
  return <EquipmentModifierPrintDeckEntryEditor {...props} />;
}
