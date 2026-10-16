import type { LocalizedToolModifier } from "~/models/resources/modifiers/equipment/tools/localized-tool-modifier";
import EquipmentModifierPrintDeckEntryEditor from "./equipment-modifier-print-deck-entry-editor";
import type { PrintDeckEntryEditorProps } from "../print-deck-entry-editor-props";

//------------------------------------------------------------------------------
// Tool Modifier Print Deck Entry Editor
//------------------------------------------------------------------------------

export default function ToolModifierPrintDeckEntryEditor(
  props: PrintDeckEntryEditorProps<LocalizedToolModifier>,
) {
  return <EquipmentModifierPrintDeckEntryEditor {...props} />;
}
