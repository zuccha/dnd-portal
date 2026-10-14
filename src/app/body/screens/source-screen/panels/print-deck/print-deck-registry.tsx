import type { LocalizedResource } from "~/models/resources/localized-resource";
import type { Resource } from "~/models/resources/resource";
import type { LocalizedResourceUnion } from "~/models/resources/resource-union";
import { BackgroundCard } from "../resources/backgrounds/panel/background-card.tsx";
import { CharacterClassCard } from "../resources/character-classes/panel/character-class-card.tsx";
import { CharacterSubclassCard } from "../resources/character-subclasses/panel/character-subclass-card.tsx";
import { CreatureFamilyCard } from "../resources/creature-families/panel/creature-family-card.tsx";
import { CreatureTagCard } from "../resources/creature-tags/panel/creature-tag-card.tsx";
import { CreatureCard } from "../resources/creatures/panel/creature-card.tsx";
import { EldritchInvocationCard } from "../resources/eldritch-invocations/panel/eldritch-invocation-card.tsx";
import { ArmorCard } from "../resources/equipment/armors/panel/armor-card.tsx";
import { ItemCard } from "../resources/equipment/items/panel/item-card.tsx";
import { ToolCard } from "../resources/equipment/tools/panel/tool-card.tsx";
import { WeaponCard } from "../resources/equipment/weapons/panel/weapon-card.tsx";
import { FeatCard } from "../resources/feats/panel/feat-card.tsx";
import { FeatureCard } from "../resources/features/panel/feature-card.tsx";
import { LanguageCard } from "../resources/languages/panel/language-card.tsx";
import { ManeuverCard } from "../resources/maneuvers/panel/maneuver-card.tsx";
import { MetamagicCard } from "../resources/metamagics/panel/metamagic-card.tsx";
import { ArmorModifierCard } from "../resources/modifiers/equipment/armors/panel/armor-modifier-card.tsx";
import { ItemModifierCard } from "../resources/modifiers/equipment/items/panel/item-modifier-card.tsx";
import { ToolModifierCard } from "../resources/modifiers/equipment/tools/panel/tool-modifier-card.tsx";
import { WeaponModifierCard } from "../resources/modifiers/equipment/weapons/panel/weapon-modifier-card.tsx";
import { PlaneCard } from "../resources/planes/panel/plane-card.tsx";
import { ServiceCard } from "../resources/services/panel/service-card.tsx";
import { SpeciesCard } from "../resources/species/panel/species-card.tsx";
import { SpellCard } from "../resources/spells/panel/spell-card.tsx";
import { VehicleCard } from "../resources/vehicles/panel/vehicle-card.tsx";
import type { ResourcePokerCardProps } from "../resources/resource-poker-card";
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

export const printDeckRegistry = {
  armor: ArmorCard,
  armor_modifier: ArmorModifierCard,
  background: BackgroundCard,
  character_class: CharacterClassCard,
  character_subclass: CharacterSubclassCard,
  creature: CreatureCard,
  creature_family: CreatureFamilyCard,
  creature_tag: CreatureTagCard,
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
