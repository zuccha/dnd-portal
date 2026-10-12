import type { PrintDeckEntry } from "~/models/print-deck/print-deck-entry";
import { backgroundStore } from "~/models/resources/backgrounds/background-store";
import { characterClassStore } from "~/models/resources/character-classes/character-class-store";
import { characterSubclassStore } from "~/models/resources/character-subclasses/character-subclass-store";
import { creatureTagStore } from "~/models/resources/creature-tags/creature-tag-store";
import { creatureStore } from "~/models/resources/creatures/creature-store";
import { eldritchInvocationStore } from "~/models/resources/eldritch-invocations/eldritch-invocation-store";
import { armorStore } from "~/models/resources/equipment/armors/armor-store";
import { itemStore } from "~/models/resources/equipment/items/item-store";
import { toolStore } from "~/models/resources/equipment/tools/tool-store";
import { weaponStore } from "~/models/resources/equipment/weapons/weapon-store";
import { featStore } from "~/models/resources/feats/feat-store";
import { featureStore } from "~/models/resources/features/feature-store";
import { languageStore } from "~/models/resources/languages/language-store";
import { maneuverStore } from "~/models/resources/maneuvers/maneuver-store";
import { metamagicStore } from "~/models/resources/metamagics/metamagic-store";
import { armorModifierStore } from "~/models/resources/modifiers/equipment/armors/armor-modifier-store";
import { itemModifierStore } from "~/models/resources/modifiers/equipment/items/item-modifier-store";
import { toolModifierStore } from "~/models/resources/modifiers/equipment/tools/tool-modifier-store";
import { weaponModifierStore } from "~/models/resources/modifiers/equipment/weapons/weapon-modifier-store";
import { planeStore } from "~/models/resources/planes/plane-store";
import { serviceStore } from "~/models/resources/services/service-store";
import { speciesStore } from "~/models/resources/species/species-store";
import { spellStore } from "~/models/resources/spells/spell-store";
import { vehicleStore } from "~/models/resources/vehicles/vehicle-store";
import type { Palette } from "~/utils/palette";
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

const useLocalizedArmor = armorStore.useLocalizedResource;
const useLocalizedArmorModifier = armorModifierStore.useLocalizedResource;
const useLocalizedBackground = backgroundStore.useLocalizedResource;
const useLocalizedCharacterClass = characterClassStore.useLocalizedResource;
const useLocalizedCharacterSubclass = characterSubclassStore.useLocalizedResource;
const useLocalizedCreature = creatureStore.useLocalizedResource;
const useLocalizedCreatureTag = creatureTagStore.useLocalizedResource;
const useLocalizedEldritchInvocation = eldritchInvocationStore.useLocalizedResource;
const useLocalizedFeat = featStore.useLocalizedResource;
const useLocalizedFeature = featureStore.useLocalizedResource;
const useLocalizedItem = itemStore.useLocalizedResource;
const useLocalizedItemModifier = itemModifierStore.useLocalizedResource;
const useLocalizedLanguage = languageStore.useLocalizedResource;
const useLocalizedManeuver = maneuverStore.useLocalizedResource;
const useLocalizedMetamagic = metamagicStore.useLocalizedResource;
const useLocalizedPlane = planeStore.useLocalizedResource;
const useLocalizedService = serviceStore.useLocalizedResource;
const useLocalizedSpecies = speciesStore.useLocalizedResource;
const useLocalizedSpell = spellStore.useLocalizedResource;
const useLocalizedTool = toolStore.useLocalizedResource;
const useLocalizedToolModifier = toolModifierStore.useLocalizedResource;
const useLocalizedVehicle = vehicleStore.useLocalizedResource;
const useLocalizedWeapon = weaponStore.useLocalizedResource;
const useLocalizedWeaponModifier = weaponModifierStore.useLocalizedResource;

//------------------------------------------------------------------------------
// Print Deck Entry Card Props
//------------------------------------------------------------------------------

export type PrintDeckEntryCardProps = {
  alwaysEvenPages: boolean;
  bgColor?: string;
  borderRadius: number;
  css: Record<string, unknown>;
  entry: PrintDeckEntry;
  onPageCountChange: (count: number | undefined) => void;
  palette: Palette;
  showImage: boolean;
};

//------------------------------------------------------------------------------
// Armor Print Deck Entry Card
//------------------------------------------------------------------------------

export function ArmorPrintDeckEntryCard(props: PrintDeckEntryCardProps) {
  const resource = useLocalizedArmor(props.entry.resource.id);
  return resource ? <ArmorCard {...props} localizedResource={resource} /> : null;
}

//------------------------------------------------------------------------------
// Armor Modifier Print Deck Entry Card
//------------------------------------------------------------------------------

export function ArmorModifierPrintDeckEntryCard(props: PrintDeckEntryCardProps) {
  const resource = useLocalizedArmorModifier(props.entry.resource.id);
  return resource ? <ArmorModifierCard {...props} localizedResource={resource} /> : null;
}

//------------------------------------------------------------------------------
// Background Print Deck Entry Card
//------------------------------------------------------------------------------

export function BackgroundPrintDeckEntryCard(props: PrintDeckEntryCardProps) {
  const resource = useLocalizedBackground(props.entry.resource.id);
  return resource ? <BackgroundCard {...props} localizedResource={resource} /> : null;
}

//------------------------------------------------------------------------------
// Character Class Print Deck Entry Card
//------------------------------------------------------------------------------

export function CharacterClassPrintDeckEntryCard(props: PrintDeckEntryCardProps) {
  const resource = useLocalizedCharacterClass(props.entry.resource.id);
  return resource ? <CharacterClassCard {...props} localizedResource={resource} /> : null;
}

//------------------------------------------------------------------------------
// Character Subclass Print Deck Entry Card
//------------------------------------------------------------------------------

export function CharacterSubclassPrintDeckEntryCard(props: PrintDeckEntryCardProps) {
  const resource = useLocalizedCharacterSubclass(props.entry.resource.id);
  return resource ? <CharacterSubclassCard {...props} localizedResource={resource} /> : null;
}

//------------------------------------------------------------------------------
// Creature Print Deck Entry Card
//------------------------------------------------------------------------------

export function CreaturePrintDeckEntryCard(props: PrintDeckEntryCardProps) {
  const resource = useLocalizedCreature(props.entry.resource.id);
  return resource ? <CreatureCard {...props} localizedResource={resource} /> : null;
}

//------------------------------------------------------------------------------
// Creature Tag Print Deck Entry Card
//------------------------------------------------------------------------------

export function CreatureTagPrintDeckEntryCard(props: PrintDeckEntryCardProps) {
  const resource = useLocalizedCreatureTag(props.entry.resource.id);
  return resource ? <CreatureTagCard {...props} localizedResource={resource} /> : null;
}

//------------------------------------------------------------------------------
// Eldritch Invocation Print Deck Entry Card
//------------------------------------------------------------------------------

export function EldritchInvocationPrintDeckEntryCard(props: PrintDeckEntryCardProps) {
  const resource = useLocalizedEldritchInvocation(props.entry.resource.id);
  return resource ? <EldritchInvocationCard {...props} localizedResource={resource} /> : null;
}

//------------------------------------------------------------------------------
// Feat Print Deck Entry Card
//------------------------------------------------------------------------------

export function FeatPrintDeckEntryCard(props: PrintDeckEntryCardProps) {
  const resource = useLocalizedFeat(props.entry.resource.id);
  return resource ? <FeatCard {...props} localizedResource={resource} /> : null;
}

//------------------------------------------------------------------------------
// Feature Print Deck Entry Card
//------------------------------------------------------------------------------

export function FeaturePrintDeckEntryCard(props: PrintDeckEntryCardProps) {
  const resource = useLocalizedFeature(props.entry.resource.id);
  return resource ? <FeatureCard {...props} localizedResource={resource} /> : null;
}

//------------------------------------------------------------------------------
// Item Print Deck Entry Card
//------------------------------------------------------------------------------

export function ItemPrintDeckEntryCard(props: PrintDeckEntryCardProps) {
  const resource = useLocalizedItem(props.entry.resource.id);
  return resource ? <ItemCard {...props} localizedResource={resource} /> : null;
}

//------------------------------------------------------------------------------
// Item Modifier Print Deck Entry Card
//------------------------------------------------------------------------------

export function ItemModifierPrintDeckEntryCard(props: PrintDeckEntryCardProps) {
  const resource = useLocalizedItemModifier(props.entry.resource.id);
  return resource ? <ItemModifierCard {...props} localizedResource={resource} /> : null;
}

//------------------------------------------------------------------------------
// Language Print Deck Entry Card
//------------------------------------------------------------------------------

export function LanguagePrintDeckEntryCard(props: PrintDeckEntryCardProps) {
  const resource = useLocalizedLanguage(props.entry.resource.id);
  return resource ? <LanguageCard {...props} localizedResource={resource} /> : null;
}

//------------------------------------------------------------------------------
// Maneuver Print Deck Entry Card
//------------------------------------------------------------------------------

export function ManeuverPrintDeckEntryCard(props: PrintDeckEntryCardProps) {
  const resource = useLocalizedManeuver(props.entry.resource.id);
  return resource ? <ManeuverCard {...props} localizedResource={resource} /> : null;
}

//------------------------------------------------------------------------------
// Metamagic Print Deck Entry Card
//------------------------------------------------------------------------------

export function MetamagicPrintDeckEntryCard(props: PrintDeckEntryCardProps) {
  const resource = useLocalizedMetamagic(props.entry.resource.id);
  return resource ? <MetamagicCard {...props} localizedResource={resource} /> : null;
}

//------------------------------------------------------------------------------
// Plane Print Deck Entry Card
//------------------------------------------------------------------------------

export function PlanePrintDeckEntryCard(props: PrintDeckEntryCardProps) {
  const resource = useLocalizedPlane(props.entry.resource.id);
  return resource ? <PlaneCard {...props} localizedResource={resource} /> : null;
}

//------------------------------------------------------------------------------
// Service Print Deck Entry Card
//------------------------------------------------------------------------------

export function ServicePrintDeckEntryCard(props: PrintDeckEntryCardProps) {
  const resource = useLocalizedService(props.entry.resource.id);
  return resource ? <ServiceCard {...props} localizedResource={resource} /> : null;
}

//------------------------------------------------------------------------------
// Species Print Deck Entry Card
//------------------------------------------------------------------------------

export function SpeciesPrintDeckEntryCard(props: PrintDeckEntryCardProps) {
  const resource = useLocalizedSpecies(props.entry.resource.id);
  return resource ? <SpeciesCard {...props} localizedResource={resource} /> : null;
}

//------------------------------------------------------------------------------
// Spell Print Deck Entry Card
//------------------------------------------------------------------------------

export function SpellPrintDeckEntryCard(props: PrintDeckEntryCardProps) {
  const resource = useLocalizedSpell(props.entry.resource.id);
  return resource ? <SpellCard {...props} localizedResource={resource} /> : null;
}

//------------------------------------------------------------------------------
// Tool Print Deck Entry Card
//------------------------------------------------------------------------------

export function ToolPrintDeckEntryCard(props: PrintDeckEntryCardProps) {
  const resource = useLocalizedTool(props.entry.resource.id);
  return resource ? <ToolCard {...props} localizedResource={resource} /> : null;
}

//------------------------------------------------------------------------------
// Tool Modifier Print Deck Entry Card
//------------------------------------------------------------------------------

export function ToolModifierPrintDeckEntryCard(props: PrintDeckEntryCardProps) {
  const resource = useLocalizedToolModifier(props.entry.resource.id);
  return resource ? <ToolModifierCard {...props} localizedResource={resource} /> : null;
}

//------------------------------------------------------------------------------
// Vehicle Print Deck Entry Card
//------------------------------------------------------------------------------

export function VehiclePrintDeckEntryCard(props: PrintDeckEntryCardProps) {
  const resource = useLocalizedVehicle(props.entry.resource.id);
  return resource ? <VehicleCard {...props} localizedResource={resource} /> : null;
}

//------------------------------------------------------------------------------
// Weapon Print Deck Entry Card
//------------------------------------------------------------------------------

export function WeaponPrintDeckEntryCard(props: PrintDeckEntryCardProps) {
  const resource = useLocalizedWeapon(props.entry.resource.id);
  return resource ? <WeaponCard {...props} localizedResource={resource} /> : null;
}

//------------------------------------------------------------------------------
// Weapon Modifier Print Deck Entry Card
//------------------------------------------------------------------------------

export function WeaponModifierPrintDeckEntryCard(props: PrintDeckEntryCardProps) {
  const resource = useLocalizedWeaponModifier(props.entry.resource.id);
  return resource ? <WeaponModifierCard {...props} localizedResource={resource} /> : null;
}
