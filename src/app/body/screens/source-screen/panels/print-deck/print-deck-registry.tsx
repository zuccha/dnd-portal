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
// Print Deck Registry Entry
//------------------------------------------------------------------------------

export type PrintDeckRegistryEntry<K extends PrintDeckResourceKind> = {
  Card: PrintDeckCardComponent<K>;
};

export type PrintDeckRegistry = {
  [K in PrintDeckResourceKind]: PrintDeckRegistryEntry<K>;
};

//------------------------------------------------------------------------------
// Print Deck Registry
//------------------------------------------------------------------------------

export const printDeckRegistry = {
  armor: { Card: ArmorCard },
  armor_modifier: { Card: ArmorModifierCard },
  background: { Card: BackgroundCard },
  character_class: { Card: CharacterClassCard },
  character_subclass: { Card: CharacterSubclassCard },
  creature: { Card: CreatureCard },
  creature_tag: { Card: CreatureTagCard },
  eldritch_invocation: { Card: EldritchInvocationCard },
  feat: { Card: FeatCard },
  feature: { Card: FeatureCard },
  item: { Card: ItemCard },
  item_modifier: { Card: ItemModifierCard },
  language: { Card: LanguageCard },
  maneuver: { Card: ManeuverCard },
  metamagic: { Card: MetamagicCard },
  plane: { Card: PlaneCard },
  service: { Card: ServiceCard },
  species: { Card: SpeciesCard },
  spell: { Card: SpellCard },
  tool: { Card: ToolCard },
  tool_modifier: { Card: ToolModifierCard },
  vehicle: { Card: VehicleCard },
  weapon: { Card: WeaponCard },
  weapon_modifier: { Card: WeaponModifierCard },
} satisfies PrintDeckRegistry;

//------------------------------------------------------------------------------
// Get Print Deck Registry Entry
//------------------------------------------------------------------------------

export function getPrintDeckRegistryEntry<K extends PrintDeckResourceKind>(
  kind: K,
): PrintDeckRegistryEntry<K> {
  return printDeckRegistry[kind] as PrintDeckRegistryEntry<K>;
}
