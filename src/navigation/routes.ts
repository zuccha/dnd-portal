//------------------------------------------------------------------------------
// Route
//------------------------------------------------------------------------------

export const Route = {
  _: "/",
  PrintDeck: "/print-deck",
  Resources: "/resources",
  ResourcesAbilities: "/resources/abilities",
  ResourcesAbilitiesEldritchInvocations: "/resources/eldritch-invocations",
  ResourcesAbilitiesManeuvers: "/resources/maneuvers",
  ResourcesAbilitiesMetamagic: "/resources/metamagic",
  ResourcesAbilitiesSpells: "/resources/spells",
  ResourcesBestiary: "/resources/bestiary",
  ResourcesBestiaryMonsters: "/resources/creatures",
  ResourcesBestiaryTags: "/resources/creature-tags",
  ResourcesBlocks: "/resources/blocks",
  ResourcesBlocksFeatures: "/resources/features",
  ResourcesCharacter: "/resources/character",
  ResourcesCharacterBackgrounds: "/resources/backgrounds",
  ResourcesCharacterClasses: "/resources/classes",
  ResourcesCharacterFeats: "/resources/feats",
  ResourcesCharacterSpecies: "/resources/species",
  ResourcesCharacterSubclasses: "/resources/subclasses",
  ResourcesEquipment: "/resources/equipment",
  ResourcesEquipmentArmorModifiers: "/resources/armor-modifiers",
  ResourcesEquipmentArmors: "/resources/armors",
  ResourcesEquipmentItemModifiers: "/resources/item-modifiers",
  ResourcesEquipmentItems: "/resources/items",
  ResourcesEquipmentToolModifiers: "/resources/tool-modifiers",
  ResourcesEquipmentTools: "/resources/tools",
  ResourcesEquipmentWeaponModifiers: "/resources/weapon-modifiers",
  ResourcesEquipmentWeapons: "/resources/weapons",
  ResourcesMarket: "/resources/market",
  ResourcesMarketServices: "/resources/services",
  ResourcesMarketVehicles: "/resources/vehicles",
  ResourcesWorld: "/resources/world",
  ResourcesWorldLanguages: "/resources/languages",
  ResourcesWorldPlanes: "/resources/planes",
  Settings: "/settings",
  SignIn: "/sign-in",
  SignUp: "/sign-up",
  Sources: "/sources",
} as const;

export type Route = (typeof Route)[keyof typeof Route];

export const routes = Object.values(Route);

//------------------------------------------------------------------------------
// Source Settings Route
//------------------------------------------------------------------------------

export function sourceSettingsRoute(sourceId: string): string {
  return `${Route.Sources}/${sourceId}`;
}
