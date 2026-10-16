import type { LocalizedResourceUnion } from "~/models/resources/resource-union";
import ArmorModifierPrintDeckEntryEditor from "./editors/armor-modifier-print-deck-entry-editor";
import ArmorPrintDeckEntryEditor from "./editors/armor-print-deck-entry-editor";
import BackgroundPrintDeckEntryEditor from "./editors/background-print-deck-entry-editor";
import CharacterClassPrintDeckEntryEditor from "./editors/character-class-print-deck-entry-editor";
import CharacterSubclassPrintDeckEntryEditor from "./editors/character-subclass-print-deck-entry-editor";
import CreatureFamilyPrintDeckEntryEditor from "./editors/creature-family-print-deck-entry-editor";
import CreatureHabitatPrintDeckEntryEditor from "./editors/creature-habitat-print-deck-entry-editor";
import CreaturePrintDeckEntryEditor from "./editors/creature-print-deck-entry-editor";
import CreatureTagPrintDeckEntryEditor from "./editors/creature-tag-print-deck-entry-editor";
import CreatureTreasurePrintDeckEntryEditor from "./editors/creature-treasure-print-deck-entry-editor";
import EldritchInvocationPrintDeckEntryEditor from "./editors/eldritch-invocation-print-deck-entry-editor";
import FeatPrintDeckEntryEditor from "./editors/feat-print-deck-entry-editor";
import FeaturePrintDeckEntryEditor from "./editors/feature-print-deck-entry-editor";
import ItemModifierPrintDeckEntryEditor from "./editors/item-modifier-print-deck-entry-editor";
import ItemPrintDeckEntryEditor from "./editors/item-print-deck-entry-editor";
import LanguagePrintDeckEntryEditor from "./editors/language-print-deck-entry-editor";
import ManeuverPrintDeckEntryEditor from "./editors/maneuver-print-deck-entry-editor";
import MetamagicPrintDeckEntryEditor from "./editors/metamagic-print-deck-entry-editor";
import PlanePrintDeckEntryEditor from "./editors/plane-print-deck-entry-editor";
import SpeciesPrintDeckEntryEditor from "./editors/species-print-deck-entry-editor";
import SpellPrintDeckEntryEditor from "./editors/spell-print-deck-entry-editor";
import ToolModifierPrintDeckEntryEditor from "./editors/tool-modifier-print-deck-entry-editor";
import ToolPrintDeckEntryEditor from "./editors/tool-print-deck-entry-editor";
import VehiclePrintDeckEntryEditor from "./editors/vehicle-print-deck-entry-editor";
import WeaponModifierPrintDeckEntryEditor from "./editors/weapon-modifier-print-deck-entry-editor";
import WeaponPrintDeckEntryEditor from "./editors/weapon-print-deck-entry-editor";
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
  armor: ArmorPrintDeckEntryEditor,
  armor_modifier: ArmorModifierPrintDeckEntryEditor,
  background: BackgroundPrintDeckEntryEditor,
  character_class: CharacterClassPrintDeckEntryEditor,
  character_subclass: CharacterSubclassPrintDeckEntryEditor,
  creature: CreaturePrintDeckEntryEditor,
  creature_family: CreatureFamilyPrintDeckEntryEditor,
  creature_habitat: CreatureHabitatPrintDeckEntryEditor,
  creature_tag: CreatureTagPrintDeckEntryEditor,
  creature_treasure: CreatureTreasurePrintDeckEntryEditor,
  eldritch_invocation: EldritchInvocationPrintDeckEntryEditor,
  feat: FeatPrintDeckEntryEditor,
  feature: FeaturePrintDeckEntryEditor,
  item: ItemPrintDeckEntryEditor,
  item_modifier: ItemModifierPrintDeckEntryEditor,
  language: LanguagePrintDeckEntryEditor,
  maneuver: ManeuverPrintDeckEntryEditor,
  metamagic: MetamagicPrintDeckEntryEditor,
  plane: PlanePrintDeckEntryEditor,
  species: SpeciesPrintDeckEntryEditor,
  spell: SpellPrintDeckEntryEditor,
  tool: ToolPrintDeckEntryEditor,
  tool_modifier: ToolModifierPrintDeckEntryEditor,
  vehicle: VehiclePrintDeckEntryEditor,
  weapon: WeaponPrintDeckEntryEditor,
  weapon_modifier: WeaponModifierPrintDeckEntryEditor,
};
