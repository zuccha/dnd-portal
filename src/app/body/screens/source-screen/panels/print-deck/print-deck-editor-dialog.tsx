import type { PrintDeckEntry } from "~/models/print-deck/print-deck-entry";
import { getPrintDeckEditorRegistryEntry } from "./print-deck-editor-registry";

//------------------------------------------------------------------------------
// Print Deck Editor Dialog Props
//------------------------------------------------------------------------------

export type PrintDeckEditorDialogProps = {
  entry: PrintDeckEntry | undefined;
  onClose: () => void;
};

//------------------------------------------------------------------------------
// Print Deck Editor Dialog
//------------------------------------------------------------------------------

export default function PrintDeckEditorDialog({ entry, onClose }: PrintDeckEditorDialogProps) {
  if (!entry) return null;

  const registryEntry = getPrintDeckEditorRegistryEntry(entry.localized_resource.kind);
  const EditorComponent = registryEntry.Component;
  return <EditorComponent entry={entry} onClose={onClose} />;
}
