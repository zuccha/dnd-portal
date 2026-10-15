import type { LocalizedResource } from "~/models/resources/localized-resource";
import type { Resource } from "~/models/resources/resource";
import type { LocalizedResourceUnion } from "~/models/resources/resource-union";
import { BackgroundCard } from "../../../../resource-modules/backgrounds/panel/background-card.tsx";
import { CharacterClassCard } from "../../../../resource-modules/character-classes/panel/character-class-card.tsx";
import { CharacterSubclassCard } from "../../../../resource-modules/character-subclasses/panel/character-subclass-card.tsx";
import { CreatureFamilyCard } from "../../../../resource-modules/creature-families/panel/creature-family-card.tsx";
import { CreatureHabitatCard } from "../../../../resource-modules/creature-habitats/panel/creature-habitat-card.tsx";
import { CreatureTagCard } from "../../../../resource-modules/creature-tags/panel/creature-tag-card.tsx";
import { CreatureTreasureCard } from "../../../../resource-modules/creature-treasures/panel/creature-treasure-card.tsx";
import { CreatureCard } from "../../../../resource-modules/creatures/panel/creature-card.tsx";
import { EldritchInvocationCard } from "../../../../resource-modules/eldritch-invocations/panel/eldritch-invocation-card.tsx";
import { ArmorCard } from "../../../../resource-modules/equipment/armors/panel/armor-card.tsx";
import { ItemCard } from "../../../../resource-modules/equipment/items/panel/item-card.tsx";
import { ToolCard } from "../../../../resource-modules/equipment/tools/panel/tool-card.tsx";
import { WeaponCard } from "../../../../resource-modules/equipment/weapons/panel/weapon-card.tsx";
import { FeatCard } from "../../../../resource-modules/feats/panel/feat-card.tsx";
import { FeatureCard } from "../../../../resource-modules/features/panel/feature-card.tsx";
import { LanguageCard } from "../../../../resource-modules/languages/panel/language-card.tsx";
import { ManeuverCard } from "../../../../resource-modules/maneuvers/panel/maneuver-card.tsx";
import { MetamagicCard } from "../../../../resource-modules/metamagics/panel/metamagic-card.tsx";
import { ArmorModifierCard } from "../../../../resource-modules/modifiers/equipment/armors/panel/armor-modifier-card.tsx";
import { ItemModifierCard } from "../../../../resource-modules/modifiers/equipment/items/panel/item-modifier-card.tsx";
import { ToolModifierCard } from "../../../../resource-modules/modifiers/equipment/tools/panel/tool-modifier-card.tsx";
import { WeaponModifierCard } from "../../../../resource-modules/modifiers/equipment/weapons/panel/weapon-modifier-card.tsx";
import { PlaneCard } from "../../../../resource-modules/planes/panel/plane-card.tsx";
import { ServiceCard } from "../../../../resource-modules/services/panel/service-card.tsx";
import { SpeciesCard } from "../../../../resource-modules/species/panel/species-card.tsx";
import { SpellCard } from "../../../../resource-modules/spells/panel/spell-card.tsx";
import { VehicleCard } from "../../../../resource-modules/vehicles/panel/vehicle-card.tsx";
import type { ResourcePokerCardProps } from "../../../../resource-modules/resource-poker-card.tsx";
import type { ComponentType } from "react";

//------------------------------------------------------------------------------
// Print Deck Resource Kind
//------------------------------------------------------------------------------

export type PrintDeckResourceKind = LocalizedResourceUnion["kind"];

//------------------------------------------------------------------------------
// Print Deck Localized Resource
//------------------------------------------------------------------------------

export type PrintDeckLocalizedResource<K extends PrintDeckResourceKind> = Extract<
  LocalizedResourceUnion,
  { kind: K; _raw: { kind: K } }
>;

//------------------------------------------------------------------------------
// Print Deck Card Component
//------------------------------------------------------------------------------

export type PrintDeckCardProps<K extends PrintDeckResourceKind> = Omit<
  ResourcePokerCardProps<Resource, LocalizedResource<Resource>>,
  "afterDetails" | "beforeDetails" | "firstPageInfo" | "localizedResource"
> & {
  localizedResource: PrintDeckLocalizedResource<K>;
};

//------------------------------------------------------------------------------
// Print Deck Card Component
//------------------------------------------------------------------------------

export type PrintDeckCardComponent<K extends PrintDeckResourceKind> = ComponentType<
  PrintDeckCardProps<K>
> & {
  h: number;
  w: number;
};

//------------------------------------------------------------------------------
// Print Deck Registry
//------------------------------------------------------------------------------

export type PrintDeckRegistry = {
  [K in PrintDeckResourceKind]: PrintDeckCardComponent<K>;
};

//------------------------------------------------------------------------------
// Print Deck Registry
//------------------------------------------------------------------------------

export const printDeckRegistry = {
  armor: ArmorCard,
  armor_modifier: ArmorModifierCard,
  background: BackgroundCard,
  character_class: CharacterClassCard,
  character_subclass: CharacterSubclassCard,
  creature: CreatureCard,
  creature_family: CreatureFamilyCard,
  creature_habitat: CreatureHabitatCard,
  creature_tag: CreatureTagCard,
  creature_treasure: CreatureTreasureCard,
  eldritch_invocation: EldritchInvocationCard,
  feat: FeatCard,
  feature: FeatureCard,
  item: ItemCard,
  item_modifier: ItemModifierCard,
  language: LanguageCard,
  maneuver: ManeuverCard,
  metamagic: MetamagicCard,
  plane: PlaneCard,
  service: ServiceCard,
  species: SpeciesCard,
  spell: SpellCard,
  tool: ToolCard,
  tool_modifier: ToolModifierCard,
  vehicle: VehicleCard,
  weapon: WeaponCard,
  weapon_modifier: WeaponModifierCard,
} satisfies PrintDeckRegistry;

//------------------------------------------------------------------------------
// Get Print Deck Card
//------------------------------------------------------------------------------

export function getPrintDeckCard<K extends PrintDeckResourceKind>(
  kind: K,
): PrintDeckCardComponent<K> {
  return printDeckRegistry[kind] as PrintDeckCardComponent<K>;
}
