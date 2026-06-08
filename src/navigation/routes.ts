//------------------------------------------------------------------------------
// Route
//------------------------------------------------------------------------------

export const Route = {
  _: "/",
  Resources: "/resources",
  ResourcesAbilities: "/resources/abilities",
  ResourcesAbilitiesClassFeatures: "/resources/abilities/class-privileges",
  ResourcesAbilitiesEldritchInvocations:
    "/resources/abilities/eldritch-invocations",
  ResourcesAbilitiesFeats: "/resources/abilities/feats",
  ResourcesAbilitiesSpeciesTraits: "/resources/abilities/species-traits",
  ResourcesAbilitiesSpells: "/resources/abilities/spells",
  ResourcesBestiary: "/resources/bestiary",
  ResourcesBestiaryMonsters: "/resources/bestiary/monsters",
  ResourcesBestiaryTags: "/resources/bestiary/tags",
  ResourcesCharacter: "/resources/character",
  ResourcesCharacterBackgrounds: "/resources/character/backgrounds",
  ResourcesCharacterClasses: "/resources/character/classes",
  ResourcesCharacterSpecies: "/resources/character/species",
  ResourcesCharacterSubclasses: "/resources/character/subclasses",
  ResourcesEquipment: "/resources/equipment",
  ResourcesEquipmentArmors: "/resources/equipment/armors",
  ResourcesEquipmentItems: "/resources/equipment/items",
  ResourcesEquipmentTools: "/resources/equipment/tools",
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
