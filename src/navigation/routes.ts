//------------------------------------------------------------------------------
// Route
//------------------------------------------------------------------------------

export const Route = {
  _: "/",
  Resources: "/resources",
  ResourcesAbilities: "/resources/abilities",
  ResourcesAbilitiesEldritchInvocations:
    "/resources/abilities/eldritch-invocations",
  ResourcesAbilitiesManeuvers: "/resources/abilities/maneuvers",
  ResourcesAbilitiesMetamagic: "/resources/abilities/metamagic",
  ResourcesAbilitiesSpells: "/resources/abilities/spells",
  ResourcesBestiary: "/resources/bestiary",
  ResourcesBestiaryMonsters: "/resources/bestiary/monsters",
  ResourcesBestiaryTags: "/resources/bestiary/tags",
  ResourcesBlocks: "/resources/blocks",
  ResourcesBlocksFeatures: "/resources/blocks/features",
  ResourcesCharacter: "/resources/character",
  ResourcesCharacterBackgrounds: "/resources/character/backgrounds",
  ResourcesCharacterClasses: "/resources/character/classes",
  ResourcesCharacterFeats: "/resources/character/feats",
  ResourcesCharacterSpecies: "/resources/character/species",
  ResourcesCharacterSubclasses: "/resources/character/subclasses",
  ResourcesEquipment: "/resources/equipment",
  ResourcesEquipmentArmors: "/resources/equipment/armors",
  ResourcesEquipmentItems: "/resources/equipment/items",
  ResourcesEquipmentTools: "/resources/equipment/tools",
  ResourcesEquipmentVehicles: "/resources/equipment/vehicles",
  ResourcesEquipmentWeapons: "/resources/equipment/weapons",
  ResourcesWorld: "/resources/world",
  ResourcesWorldLanguages: "/resources/world/languages",
  ResourcesWorldPlanes: "/resources/world/planes",
  Settings: "/settings",
  SettingsCampaign: "/settings/campaign",
  SignIn: "/sign-in",
  SignUp: "/sign-up",
} as const;

export type Route = (typeof Route)[keyof typeof Route];

export const routes = Object.values(Route);
