import type { ResourceKind } from "~/models/types/resource-kind";
import { Route } from "~/navigation/routes";
import { resourcePanels } from "../panels/panels";

//------------------------------------------------------------------------------
// Resource Kind Search Option
//------------------------------------------------------------------------------

export type ResourceKindSearchOption = {
  kind: ResourceKind;
  route: string;
  searchNames: {
    en: string;
    it: string;
  };
};

//------------------------------------------------------------------------------
// Resource Kind Search Options
//------------------------------------------------------------------------------

export const resourceKindSearchOptions: ResourceKindSearchOption[] = [
  {
    kind: "armor",
    route: Route.ResourcesEquipmentArmors,
    searchNames: {
      en: "armor armors",
      it: "armatura armature",
    },
  },
  {
    kind: "armor_modifier",
    route: Route.ResourcesEquipmentArmorModifiers,
    searchNames: {
      en: "armor modifier modifiers variant variants",
      it: "modificatore modificatori armatura variante varianti",
    },
  },
  {
    kind: "background",
    route: Route.ResourcesCharacterBackgrounds,
    searchNames: {
      en: "background backgrounds",
      it: "background",
    },
  },
  {
    kind: "character_class",
    route: Route.ResourcesCharacterClasses,
    searchNames: {
      en: "class classes",
      it: "classe classi",
    },
  },
  {
    kind: "character_subclass",
    route: Route.ResourcesCharacterSubclasses,
    searchNames: {
      en: "subclass subclasses",
      it: "sottoclasse sottoclassi",
    },
  },
  {
    kind: "creature",
    route: Route.ResourcesBestiaryMonsters,
    searchNames: {
      en: "creature creatures",
      it: "creatura creature",
    },
  },
  {
    kind: "creature_family",
    route: Route.ResourcesBestiaryFamilies,
    searchNames: {
      en: "family families creature creatures",
      it: "famiglia famiglie creatura creature",
    },
  },
  {
    kind: "creature_tag",
    route: Route.ResourcesBestiaryTags,
    searchNames: {
      en: "group groups tag tags creature creatures",
      it: "gruppo gruppi tag creatura creature",
    },
  },
  {
    kind: "eldritch_invocation",
    route: Route.ResourcesAbilitiesEldritchInvocations,
    searchNames: {
      en: "eldritch invocation invocations",
      it: "supplica suppliche occulta occulte",
    },
  },
  {
    kind: "feat",
    route: Route.ResourcesCharacterFeats,
    searchNames: {
      en: "feat feats",
      it: "talento talenti",
    },
  },
  {
    kind: "feature",
    route: Route.ResourcesBlocksFeatures,
    searchNames: {
      en: "feature features",
      it: "privilegio privilegi",
    },
  },
  {
    kind: "item",
    route: Route.ResourcesEquipmentItems,
    searchNames: {
      en: "item items equipment",
      it: "oggetto oggetti equipaggiamento",
    },
  },
  {
    kind: "item_modifier",
    route: Route.ResourcesEquipmentItemModifiers,
    searchNames: {
      en: "item modifier modifiers variant variants",
      it: "modificatore modificatori oggetto oggetti variante varianti",
    },
  },
  {
    kind: "language",
    route: Route.ResourcesWorldLanguages,
    searchNames: {
      en: "language languages",
      it: "lingua lingue linguaggio linguaggi",
    },
  },
  {
    kind: "maneuver",
    route: Route.ResourcesAbilitiesManeuvers,
    searchNames: {
      en: "maneuver maneuvers",
      it: "manovra manovre",
    },
  },
  {
    kind: "metamagic",
    route: Route.ResourcesAbilitiesMetamagic,
    searchNames: {
      en: "metamagic",
      it: "metamagia",
    },
  },
  {
    kind: "plane",
    route: Route.ResourcesWorldPlanes,
    searchNames: {
      en: "plane planes",
      it: "piano piani",
    },
  },
  {
    kind: "service",
    route: Route.ResourcesMarketServices,
    searchNames: {
      en: "service services",
      it: "servizio servizi",
    },
  },
  {
    kind: "species",
    route: Route.ResourcesCharacterSpecies,
    searchNames: {
      en: "species",
      it: "specie",
    },
  },
  {
    kind: "spell",
    route: Route.ResourcesAbilitiesSpells,
    searchNames: {
      en: "spell spells",
      it: "incantesimo incantesimi",
    },
  },
  {
    kind: "tool",
    route: Route.ResourcesEquipmentTools,
    searchNames: {
      en: "tool tools",
      it: "strumento strumenti",
    },
  },
  {
    kind: "tool_modifier",
    route: Route.ResourcesEquipmentToolModifiers,
    searchNames: {
      en: "tool modifier modifiers variant variants",
      it: "modificatore modificatori strumento strumenti variante varianti",
    },
  },
  {
    kind: "vehicle",
    route: Route.ResourcesMarketVehicles,
    searchNames: {
      en: "vehicle vehicles",
      it: "veicolo veicoli",
    },
  },
  {
    kind: "weapon",
    route: Route.ResourcesEquipmentWeapons,
    searchNames: {
      en: "weapon weapons",
      it: "arma armi",
    },
  },
  {
    kind: "weapon_modifier",
    route: Route.ResourcesEquipmentWeaponModifiers,
    searchNames: {
      en: "weapon modifier modifiers variant variants",
      it: "modificatore modificatori arma armi variante varianti",
    },
  },
];

//------------------------------------------------------------------------------
// Resource Kind Category By Route
//------------------------------------------------------------------------------

export const resourceKindCategoryByRoute = Object.fromEntries(
  resourcePanels.flatMap(({ id, items }) => items.map(({ route }) => [route, id])),
) as Record<string, string>;
