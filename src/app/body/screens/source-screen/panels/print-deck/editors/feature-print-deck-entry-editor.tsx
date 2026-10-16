import type { LocalizedFeature } from "~/models/resources/features/localized-feature";
import ResourcePrintDeckEntryEditor from "./resource-print-deck-entry-editor";
import type { PrintDeckEntryEditorProps } from "../print-deck-entry-editor-props";

//------------------------------------------------------------------------------
// Feature Print Deck Entry Editor
//------------------------------------------------------------------------------

export default function FeaturePrintDeckEntryEditor(
  props: PrintDeckEntryEditorProps<LocalizedFeature>,
) {
  return <ResourcePrintDeckEntryEditor {...props} />;
}
