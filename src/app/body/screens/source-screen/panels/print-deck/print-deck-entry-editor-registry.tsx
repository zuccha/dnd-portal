import type { LocalizedResourceUnion } from "~/models/resources/resource-union";
import BackgroundPrintDeckEntryEditor from "./editors/background-print-deck-entry-editor";
import CharacterClassPrintDeckEntryEditor from "./editors/character-class-print-deck-entry-editor";
import CharacterSubclassPrintDeckEntryEditor from "./editors/character-subclass-print-deck-entry-editor";
import EldritchInvocationPrintDeckEntryEditor from "./editors/eldritch-invocation-print-deck-entry-editor";
import FeatPrintDeckEntryEditor from "./editors/feat-print-deck-entry-editor";
import FeaturePrintDeckEntryEditor from "./editors/feature-print-deck-entry-editor";
import LanguagePrintDeckEntryEditor from "./editors/language-print-deck-entry-editor";
import ManeuverPrintDeckEntryEditor from "./editors/maneuver-print-deck-entry-editor";
import PlanePrintDeckEntryEditor from "./editors/plane-print-deck-entry-editor";
import SpeciesPrintDeckEntryEditor from "./editors/species-print-deck-entry-editor";
import SpellPrintDeckEntryEditor from "./editors/spell-print-deck-entry-editor";
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
  eldritch_invocation: EldritchInvocationPrintDeckEntryEditor,
  feat: FeatPrintDeckEntryEditor,
  feature: FeaturePrintDeckEntryEditor,
  language: LanguagePrintDeckEntryEditor,
  maneuver: ManeuverPrintDeckEntryEditor,
  plane: PlanePrintDeckEntryEditor,
  species: SpeciesPrintDeckEntryEditor,
  spell: SpellPrintDeckEntryEditor,
};
