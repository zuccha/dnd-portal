import type { PrintDeckEntry } from "~/models/print-deck/print-deck-entry";
import { backgroundStore } from "~/models/resources/backgrounds/background-store";
import { characterClassStore } from "~/models/resources/character-classes/character-class-store";
import { characterSubclassStore } from "~/models/resources/character-subclasses/character-subclass-store";
import { creatureFamilyStore } from "~/models/resources/creature-families/creature-family-store";
import { creatureHabitatStore } from "~/models/resources/creature-habitats/creature-habitat-store";
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
import type { LocalizedResource } from "~/models/resources/localized-resource";
import { maneuverStore } from "~/models/resources/maneuvers/maneuver-store";
import { metamagicStore } from "~/models/resources/metamagics/metamagic-store";
import { armorModifierStore } from "~/models/resources/modifiers/equipment/armors/armor-modifier-store";
import { itemModifierStore } from "~/models/resources/modifiers/equipment/items/item-modifier-store";
import { toolModifierStore } from "~/models/resources/modifiers/equipment/tools/tool-modifier-store";
import { weaponModifierStore } from "~/models/resources/modifiers/equipment/weapons/weapon-modifier-store";
import { planeStore } from "~/models/resources/planes/plane-store";
import type { Resource } from "~/models/resources/resource";
import { serviceStore } from "~/models/resources/services/service-store";
import { speciesStore } from "~/models/resources/species/species-store";
import { spellStore } from "~/models/resources/spells/spell-store";
import { vehicleStore } from "~/models/resources/vehicles/vehicle-store";
import type { Palette } from "~/utils/palette";
import { BackgroundCard } from "../../../../resource-modules/backgrounds/panel/background-card.tsx";
import { CharacterClassCard } from "../../../../resource-modules/character-classes/panel/character-class-card.tsx";
import { CharacterSubclassCard } from "../../../../resource-modules/character-subclasses/panel/character-subclass-card.tsx";
import { CreatureFamilyCard } from "../../../../resource-modules/creature-families/panel/creature-family-card.tsx";
import { CreatureHabitatCard } from "../../../../resource-modules/creature-habitats/panel/creature-habitat-card.tsx";
import { CreatureTagCard } from "../../../../resource-modules/creature-tags/panel/creature-tag-card.tsx";
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
import type { ComponentType } from "react";

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
// Create Resource Print Deck Entry Card
//------------------------------------------------------------------------------

function createResourcePrintDeckEntryCard<R extends Resource, L extends LocalizedResource<R>, C>(
  store: {
    localizeResource: (resource: R, context: C) => L;
    useLocalizationContext: (resource: R) => C;
  },
  Card: ComponentType<PrintDeckEntryCardProps & { localizedResource: L }>,
) {
  const { localizeResource, useLocalizationContext } = store;

  return (props: PrintDeckEntryCardProps) => {
    const rawResource = props.entry.resource as R;
    const context = useLocalizationContext(rawResource);
    const localizedResource = localizeResource(rawResource, context);
    return <Card {...props} localizedResource={localizedResource} />;
  };
}

//------------------------------------------------------------------------------
// Armor Print Deck Entry Card
//------------------------------------------------------------------------------

export const ArmorPrintDeckEntryCard = createResourcePrintDeckEntryCard(armorStore, ArmorCard);

//------------------------------------------------------------------------------
// Armor Modifier Print Deck Entry Card
//------------------------------------------------------------------------------

export const ArmorModifierPrintDeckEntryCard = createResourcePrintDeckEntryCard(
  armorModifierStore,
  ArmorModifierCard,
);

//------------------------------------------------------------------------------
// Background Print Deck Entry Card
//------------------------------------------------------------------------------

export const BackgroundPrintDeckEntryCard = createResourcePrintDeckEntryCard(
  backgroundStore,
  BackgroundCard,
);

//------------------------------------------------------------------------------
// Character Class Print Deck Entry Card
//------------------------------------------------------------------------------

export const CharacterClassPrintDeckEntryCard = createResourcePrintDeckEntryCard(
  characterClassStore,
  CharacterClassCard,
);

//------------------------------------------------------------------------------
// Character Subclass Print Deck Entry Card
//------------------------------------------------------------------------------

export const CharacterSubclassPrintDeckEntryCard = createResourcePrintDeckEntryCard(
  characterSubclassStore,
  CharacterSubclassCard,
);

//------------------------------------------------------------------------------
// Creature Print Deck Entry Card
//------------------------------------------------------------------------------

export const CreaturePrintDeckEntryCard = createResourcePrintDeckEntryCard(
  creatureStore,
  CreatureCard,
);

//------------------------------------------------------------------------------
// Creature Family Print Deck Entry Card
//------------------------------------------------------------------------------

export const CreatureFamilyPrintDeckEntryCard = createResourcePrintDeckEntryCard(
  creatureFamilyStore,
  CreatureFamilyCard,
);

//------------------------------------------------------------------------------
// Creature Habitat Print Deck Entry Card
//------------------------------------------------------------------------------

export const CreatureHabitatPrintDeckEntryCard = createResourcePrintDeckEntryCard(
  creatureHabitatStore,
  CreatureHabitatCard,
);

//------------------------------------------------------------------------------
// Creature Tag Print Deck Entry Card
//------------------------------------------------------------------------------

export const CreatureTagPrintDeckEntryCard = createResourcePrintDeckEntryCard(
  creatureTagStore,
  CreatureTagCard,
);

//------------------------------------------------------------------------------
// Eldritch Invocation Print Deck Entry Card
//------------------------------------------------------------------------------

export const EldritchInvocationPrintDeckEntryCard = createResourcePrintDeckEntryCard(
  eldritchInvocationStore,
  EldritchInvocationCard,
);

//------------------------------------------------------------------------------
// Feat Print Deck Entry Card
//------------------------------------------------------------------------------

export const FeatPrintDeckEntryCard = createResourcePrintDeckEntryCard(featStore, FeatCard);

//------------------------------------------------------------------------------
// Feature Print Deck Entry Card
//------------------------------------------------------------------------------

export const FeaturePrintDeckEntryCard = createResourcePrintDeckEntryCard(
  featureStore,
  FeatureCard,
);

//------------------------------------------------------------------------------
// Item Print Deck Entry Card
//------------------------------------------------------------------------------

export const ItemPrintDeckEntryCard = createResourcePrintDeckEntryCard(itemStore, ItemCard);

//------------------------------------------------------------------------------
// Item Modifier Print Deck Entry Card
//------------------------------------------------------------------------------

export const ItemModifierPrintDeckEntryCard = createResourcePrintDeckEntryCard(
  itemModifierStore,
  ItemModifierCard,
);

//------------------------------------------------------------------------------
// Language Print Deck Entry Card
//------------------------------------------------------------------------------

export const LanguagePrintDeckEntryCard = createResourcePrintDeckEntryCard(
  languageStore,
  LanguageCard,
);

//------------------------------------------------------------------------------
// Maneuver Print Deck Entry Card
//------------------------------------------------------------------------------

export const ManeuverPrintDeckEntryCard = createResourcePrintDeckEntryCard(
  maneuverStore,
  ManeuverCard,
);

//------------------------------------------------------------------------------
// Metamagic Print Deck Entry Card
//------------------------------------------------------------------------------

export const MetamagicPrintDeckEntryCard = createResourcePrintDeckEntryCard(
  metamagicStore,
  MetamagicCard,
);

//------------------------------------------------------------------------------
// Plane Print Deck Entry Card
//------------------------------------------------------------------------------

export const PlanePrintDeckEntryCard = createResourcePrintDeckEntryCard(planeStore, PlaneCard);

//------------------------------------------------------------------------------
// Service Print Deck Entry Card
//------------------------------------------------------------------------------

export const ServicePrintDeckEntryCard = createResourcePrintDeckEntryCard(
  serviceStore,
  ServiceCard,
);

//------------------------------------------------------------------------------
// Species Print Deck Entry Card
//------------------------------------------------------------------------------

export const SpeciesPrintDeckEntryCard = createResourcePrintDeckEntryCard(
  speciesStore,
  SpeciesCard,
);

//------------------------------------------------------------------------------
// Spell Print Deck Entry Card
//------------------------------------------------------------------------------

export const SpellPrintDeckEntryCard = createResourcePrintDeckEntryCard(spellStore, SpellCard);

//------------------------------------------------------------------------------
// Tool Print Deck Entry Card
//------------------------------------------------------------------------------

export const ToolPrintDeckEntryCard = createResourcePrintDeckEntryCard(toolStore, ToolCard);

//------------------------------------------------------------------------------
// Tool Modifier Print Deck Entry Card
//------------------------------------------------------------------------------

export const ToolModifierPrintDeckEntryCard = createResourcePrintDeckEntryCard(
  toolModifierStore,
  ToolModifierCard,
);

//------------------------------------------------------------------------------
// Vehicle Print Deck Entry Card
//------------------------------------------------------------------------------

export const VehiclePrintDeckEntryCard = createResourcePrintDeckEntryCard(
  vehicleStore,
  VehicleCard,
);

//------------------------------------------------------------------------------
// Weapon Print Deck Entry Card
//------------------------------------------------------------------------------

export const WeaponPrintDeckEntryCard = createResourcePrintDeckEntryCard(weaponStore, WeaponCard);

//------------------------------------------------------------------------------
// Weapon Modifier Print Deck Entry Card
//------------------------------------------------------------------------------

export const WeaponModifierPrintDeckEntryCard = createResourcePrintDeckEntryCard(
  weaponModifierStore,
  WeaponModifierCard,
);
