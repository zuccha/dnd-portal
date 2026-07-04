import type { ComponentType } from "react";
import type { LocalizedBackground } from "~/models/resources/backgrounds/localized-background";
import type { LocalizedCharacterClass } from "~/models/resources/character-classes/localized-character-class";
import type { LocalizedCharacterSubclass } from "~/models/resources/character-subclasses/localized-character-subclass";
import type { LocalizedCreatureTag } from "~/models/resources/creature-tags/localized-creature-tag";
import type { LocalizedCreature } from "~/models/resources/creatures/localized-creature";
import type { LocalizedEldritchInvocation } from "~/models/resources/eldritch-invocations/localized-eldritch-invocation";
import type { LocalizedArmor } from "~/models/resources/equipment/armors/localized-armor";
import type { LocalizedItem } from "~/models/resources/equipment/items/localized-item";
import type { LocalizedTool } from "~/models/resources/equipment/tools/localized-tool";
import type { LocalizedWeapon } from "~/models/resources/equipment/weapons/localized-weapon";
import type { LocalizedFeat } from "~/models/resources/feats/localized-feat";
import type { LocalizedFeature } from "~/models/resources/features/localized-feature";
import type { LocalizedLanguage } from "~/models/resources/languages/localized-language";
import type { LocalizedManeuver } from "~/models/resources/maneuvers/localized-maneuver";
import type { LocalizedMetamagic } from "~/models/resources/metamagics/localized-metamagic";
import type { LocalizedArmorModifier } from "~/models/resources/modifiers/equipment/armors/localized-armor-modifier";
import type { LocalizedItemModifier } from "~/models/resources/modifiers/equipment/items/localized-item-modifier";
import type { LocalizedToolModifier } from "~/models/resources/modifiers/equipment/tools/localized-tool-modifier";
import type { LocalizedWeaponModifier } from "~/models/resources/modifiers/equipment/weapons/localized-weapon-modifier";
import type { LocalizedPlane } from "~/models/resources/planes/localized-plane";
import type { LocalizedResourceUnion } from "~/models/resources/resource-union";
import type { LocalizedService } from "~/models/resources/services/localized-service";
import type { LocalizedSpecies } from "~/models/resources/species/localized-species";
import type { LocalizedSpell } from "~/models/resources/spells/localized-spell";
import type { LocalizedVehicle } from "~/models/resources/vehicles/localized-vehicle";
import { BackgroundCard } from "../resources/backgrounds/background-card";
import { CharacterClassCard } from "../resources/character-classes/character-class-card";
import { CharacterSubclassCard } from "../resources/character-subclasses/character-subclass-card";
import { CreatureTagCard } from "../resources/creature-tag/creature-tag-card";
import { CreatureCard } from "../resources/creatures/creature-card";
import { EldritchInvocationCard } from "../resources/eldritch-invocations/eldritch-invocation-card";
import { ArmorCard } from "../resources/equipment/armors/armor-card";
import { ItemCard } from "../resources/equipment/items/item-card";
import { ServiceCard } from "../resources/equipment/services/service-card";
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
import type { ResourcePokerCardProps } from "../resources/resource-poker-card";
import { SpeciesCard } from "../resources/species/species-card";
import { SpellCard } from "../resources/spells/spell-card";
import { VehicleCard } from "../resources/vehicles/vehicle-card";

//------------------------------------------------------------------------------
// Print Deck Resource Kind
//------------------------------------------------------------------------------

export type PrintDeckResourceKind = LocalizedResourceUnion["kind"];

//------------------------------------------------------------------------------
// Print Deck Localized Resources
//------------------------------------------------------------------------------

export type PrintDeckLocalizedResources = {
  armor: LocalizedArmor;
  armor_modifier: LocalizedArmorModifier;
  background: LocalizedBackground;
  character_class: LocalizedCharacterClass;
  character_subclass: LocalizedCharacterSubclass;
  creature: LocalizedCreature;
  creature_tag: LocalizedCreatureTag;
  eldritch_invocation: LocalizedEldritchInvocation;
  feat: LocalizedFeat;
  feature: LocalizedFeature;
  item: LocalizedItem;
  item_modifier: LocalizedItemModifier;
  language: LocalizedLanguage;
  maneuver: LocalizedManeuver;
  metamagic: LocalizedMetamagic;
  plane: LocalizedPlane;
  service: LocalizedService;
  species: LocalizedSpecies;
  spell: LocalizedSpell;
  tool: LocalizedTool;
  tool_modifier: LocalizedToolModifier;
  vehicle: LocalizedVehicle;
  weapon: LocalizedWeapon;
  weapon_modifier: LocalizedWeaponModifier;
};

export type PrintDeckLocalizedResource<K extends PrintDeckResourceKind> =
  PrintDeckLocalizedResources[K];

//------------------------------------------------------------------------------
// Print Deck Card Component
//------------------------------------------------------------------------------

export type PrintDeckCardProps<K extends PrintDeckResourceKind> = Omit<
  ResourcePokerCardProps<
    PrintDeckLocalizedResource<K>["_raw"],
    PrintDeckLocalizedResource<K>
  >,
  "afterDetails" | "beforeDetails" | "firstPageInfo"
>;

export type PrintDeckCardComponent<K extends PrintDeckResourceKind> =
  ComponentType<PrintDeckCardProps<K>> & {
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
