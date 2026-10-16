import type { LocalizedResourceUnion } from "~/models/resources/resource-union";
import BackgroundPrintDeckEntryEditor from "./editors/background-print-deck-entry-editor";
import CharacterClassPrintDeckEntryEditor from "./editors/character-class-print-deck-entry-editor";
import CharacterSubclassPrintDeckEntryEditor from "./editors/character-subclass-print-deck-entry-editor";
import FeatPrintDeckEntryEditor from "./editors/feat-print-deck-entry-editor";
import LanguagePrintDeckEntryEditor from "./editors/language-print-deck-entry-editor";
import PlanePrintDeckEntryEditor from "./editors/plane-print-deck-entry-editor";
import SpeciesPrintDeckEntryEditor from "./editors/species-print-deck-entry-editor";
import type { PrintDeckEntryEditorProps } from "./print-deck-entry-editor-props";
import type { ComponentType } from "react";

//------------------------------------------------------------------------------
// Localized Resource By Kind
//------------------------------------------------------------------------------

type LocalizedResourceByKind<K extends LocalizedResourceUnion["kind"]> = Extract<
  LocalizedResourceUnion,
  { kind: K }
>;

//------------------------------------------------------------------------------
// Print Deck Entry Editor Registry
//------------------------------------------------------------------------------

type PrintDeckEntryEditorRegistry = Partial<{
  [K in LocalizedResourceUnion["kind"]]: ComponentType<
    PrintDeckEntryEditorProps<LocalizedResourceByKind<K>>
  >;
}>;

//------------------------------------------------------------------------------
// Print Deck Entry Editors
//------------------------------------------------------------------------------

export const printDeckEntryEditors: PrintDeckEntryEditorRegistry = {
  background: BackgroundPrintDeckEntryEditor,
  character_class: CharacterClassPrintDeckEntryEditor,
  character_subclass: CharacterSubclassPrintDeckEntryEditor,
  feat: FeatPrintDeckEntryEditor,
  language: LanguagePrintDeckEntryEditor,
  plane: PlanePrintDeckEntryEditor,
  species: SpeciesPrintDeckEntryEditor,
};
