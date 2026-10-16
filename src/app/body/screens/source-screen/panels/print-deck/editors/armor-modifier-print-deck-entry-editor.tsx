import type { LocalizedArmorModifier } from "~/models/resources/modifiers/equipment/armors/localized-armor-modifier";
import EquipmentModifierPrintDeckEntryEditor from "./equipment-modifier-print-deck-entry-editor";
import type { PrintDeckEntryEditorProps } from "../print-deck-entry-editor-props";

//------------------------------------------------------------------------------
// Armor Modifier Print Deck Entry Editor
//------------------------------------------------------------------------------

export default function ArmorModifierPrintDeckEntryEditor(
  props: PrintDeckEntryEditorProps<LocalizedArmorModifier>,
) {
  return <EquipmentModifierPrintDeckEntryEditor {...props} />;
}
