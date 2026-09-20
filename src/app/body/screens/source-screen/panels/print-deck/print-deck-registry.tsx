import type { LocalizedResource } from "~/models/resources/localized-resource";
import type { Resource } from "~/models/resources/resource";
import type { LocalizedResourceUnion } from "~/models/resources/resource-union";
import { BackgroundCard } from "../resources/backgrounds/background-card";
import { CharacterClassCard } from "../resources/character-classes/character-class-card";
import { CharacterSubclassCard } from "../resources/character-subclasses/character-subclass-card";
import { CreatureTagCard } from "../resources/creature-tag/creature-tag-card";
import { CreatureCard } from "../resources/creatures/creature-card";
import { EldritchInvocationCard } from "../resources/eldritch-invocations/eldritch-invocation-card";
import { ArmorCard } from "../resources/equipment/armors/armor-card";
import { ItemCard } from "../resources/equipment/items/item-card";
import { ToolCard } from "../resources/equipment/tools/tool-card";
import { WeaponCard } from "../resources/equipment/weapons/weapon-card";
import { FeatCard } from "../resources/feats/feat-card";
import { FeatureCard } from "../resources/features/feature-card";
import { LanguageCard } from "../resources/languages/language-card";
import { ManeuverCard } from "../resources/maneuvers/maneuver-card";
import { MetamagicCard } from "../resources/metamagics/metamagic-card";
import { ArmorModifierCard } from "../resources/modifiers/equipment/armors/armor-modifier-card";
import { ItemModifierCard } from "../resources/modifiers/equipment/items/item-modifier-card";
import { ToolModifierCard } from "../resources/modifiers/equipment/tools/tool-modifier-card";
import { WeaponModifierCard } from "../resources/modifiers/equipment/weapons/weapon-modifier-card";
import { PlaneCard } from "../resources/planes/plane-card";
import { ServiceCard } from "../resources/services/service-card";
import { SpeciesCard } from "../resources/species/species-card";
import { SpellCard } from "../resources/spells/spell-card";
import { VehicleCard } from "../resources/vehicles/vehicle-card";
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
