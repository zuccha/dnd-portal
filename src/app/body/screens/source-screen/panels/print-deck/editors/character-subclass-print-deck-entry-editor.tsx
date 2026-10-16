import type { LocalizedCharacterSubclass } from "~/models/resources/character-subclasses/localized-character-subclass";
import ResourcePrintDeckEntryEditor from "./resource-print-deck-entry-editor";
import type { PrintDeckEntryEditorProps } from "../print-deck-entry-editor-props";

//------------------------------------------------------------------------------
// Character Subclass Print Deck Entry Editor
//------------------------------------------------------------------------------

export default function CharacterSubclassPrintDeckEntryEditor(
  props: PrintDeckEntryEditorProps<LocalizedCharacterSubclass>,
) {
  return <ResourcePrintDeckEntryEditor {...props} />;
}
