import { z } from "zod";
import { createTypeTranslationHooks } from "./_base";

//------------------------------------------------------------------------------
// Resource Kind
//------------------------------------------------------------------------------

export const resourceKindSchema = z.enum([
  "armor",
  "armor_modifier",
  "background",
  "character_class",
  "character_subclass",
  "creature",
  "creature_tag",
  "eldritch_invocation",
  "equipment",
  "equipment_modifier",
  "feat",
  "feature",
  "item",
  "item_modifier",
  "language",
  "maneuver",
  "metamagic",
  "modifier",
  "plane",
  "resource",
  "service",
  "species",
  "spell",
  "tool",
  "tool_modifier",
  "vehicle",
  "weapon",
  "weapon_modifier",
]);

export const resourceKinds = resourceKindSchema.options;

export type ResourceKind = z.infer<typeof resourceKindSchema>;

//------------------------------------------------------------------------------
// Resource Visibility Hooks
//------------------------------------------------------------------------------

export const {
  useOptions: useResourceKindOptions,
  useTranslate: useTranslateResourceKind,
  useTranslations: useResourceKindTranslations,
} = createTypeTranslationHooks(resourceKinds, {
  armor: { en: "Armor", it: "Armatura" },
  armor_modifier: { en: "Armor Modifier", it: "Modificatore Armatura" },
  background: { en: "Background", it: "Background" },
  character_class: { en: "Class", it: "Classe" },
  character_subclass: { en: "Subclass", it: "Sottoclasse" },
  creature: { en: "Creature", it: "Creatura" },
  creature_tag: { en: "Creature Tag", it: "Tag Creatura" },
  eldritch_invocation: { en: "Eldritch Invocation", it: "Supplica Occulta" },
  equipment: { en: "Equipment", it: "Equipaggiamento" },
  equipment_modifier: {
    en: "Equipment Modifier",
    it: "Modificatore Equipaggiamento",
  },
  feat: { en: "Feat", it: "Talento" },
  feature: { en: "Feature", it: "Privilegio" },
  item: { en: "Item", it: "Oggetto" },
  item_modifier: { en: "Item Modifier", it: "Modificatore Oggetto" },
  language: { en: "Language", it: "Linguaggio" },
  maneuver: { en: "Maneuver", it: "Manovra" },
  metamagic: { en: "Metamagic", it: "Metamagia" },
  modifier: { en: "Modifier", it: "Modificatore" },
  plane: { en: "Plane", it: "Piano" },
  resource: { en: "Resource", it: "Risorsa" },
  service: { en: "Service", it: "Servizio" },
  species: { en: "Species", it: "Specie" },
  spell: { en: "Spell", it: "Incantesimo" },
  tool: { en: "Tool", it: "Strumento" },
  tool_modifier: { en: "Tool Modifier", it: "Modificatore Strumento" },
  vehicle: { en: "Vehicle", it: "Veicolo" },
  weapon: { en: "Weapon", it: "Arma" },
  weapon_modifier: { en: "Weapon Modifier", it: "Modificatore Arma" },
});
