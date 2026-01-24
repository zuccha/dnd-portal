//------------------------------------------------------------------------------
// Route
//------------------------------------------------------------------------------

export const Route = {
  _: "/",
  Resources: "/resources",
  ResourcesBestiary: "/resources/bestiary",
  ResourcesBestiaryMonsters: "/resources/bestiary/monsters",
  ResourcesBestiaryTags: "/resources/bestiary/tags",
  ResourcesCharacter: "/resources/character",
  ResourcesCharacterClasses: "/resources/character/classes",
  ResourcesCharacterEldritchInvocations:
    "/resources/character/eldritch-invocations",
  ResourcesCharacterSpells: "/resources/character/spells",
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
