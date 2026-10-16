import type { LocalizedItemModifier } from "~/models/resources/modifiers/equipment/items/localized-item-modifier";
import EquipmentModifierPrintDeckEntryEditor from "./equipment-modifier-print-deck-entry-editor";
import type { PrintDeckEntryEditorProps } from "../print-deck-entry-editor-props";

//------------------------------------------------------------------------------
// Item Modifier Print Deck Entry Editor
//------------------------------------------------------------------------------

export default function ItemModifierPrintDeckEntryEditor(
  props: PrintDeckEntryEditorProps<LocalizedItemModifier>,
) {
  return <EquipmentModifierPrintDeckEntryEditor {...props} />;
}
