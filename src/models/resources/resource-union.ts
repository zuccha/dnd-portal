import z from "zod";
import { backgroundSchema } from "./backgrounds/background";
import { localizedBackgroundSchema } from "./backgrounds/localized-background";
import { calendarSchema } from "./calendars/calendar";
import { localizedCalendarSchema } from "./calendars/localized-calendar";
import { characterClassSchema } from "./character-classes/character-class";
import { localizedCharacterClassSchema } from "./character-classes/localized-character-class";
import { characterSubclassSchema } from "./character-subclasses/character-subclass";
import { localizedCharacterSubclassSchema } from "./character-subclasses/localized-character-subclass";
import { chronicleEntrySchema } from "./chronicle-entries/chronicle-entry";
import { localizedChronicleEntrySchema } from "./chronicle-entries/localized-chronicle-entry";
import { creatureFamilySchema } from "./creature-families/creature-family";
import { localizedCreatureFamilySchema } from "./creature-families/localized-creature-family";
import { creatureHabitatSchema } from "./creature-habitats/creature-habitat";
import { localizedCreatureHabitatSchema } from "./creature-habitats/localized-creature-habitat";
import { creatureTagSchema } from "./creature-tags/creature-tag";
import { localizedCreatureTagSchema } from "./creature-tags/localized-creature-tag";
import { creatureTreasureSchema } from "./creature-treasures/creature-treasure";
import { localizedCreatureTreasureSchema } from "./creature-treasures/localized-creature-treasure";
import { creatureSchema } from "./creatures/creature";
import { localizedCreatureSchema } from "./creatures/localized-creature";
import { eldritchInvocationSchema } from "./eldritch-invocations/eldritch-invocation";
import { localizedEldritchInvocationSchema } from "./eldritch-invocations/localized-eldritch-invocation";
import { equipmentUnionSchema, localizedEquipmentUnionSchema } from "./equipment/equipment-union";
import { factionSchema } from "./factions/faction";
import { localizedFactionSchema } from "./factions/localized-faction";
import { featSchema } from "./feats/feat";
import { localizedFeatSchema } from "./feats/localized-feat";
import { featureSchema } from "./features/feature";
import { localizedFeatureSchema } from "./features/localized-feature";
import { languageSchema } from "./languages/language";
import { localizedLanguageSchema } from "./languages/localized-language";
import { localizedManeuverSchema } from "./maneuvers/localized-maneuver";
import { maneuverSchema } from "./maneuvers/maneuver";
import { localizedMetamagicSchema } from "./metamagics/localized-metamagic";
import { metamagicSchema } from "./metamagics/metamagic";
import { localizedModifierUnionSchema, modifierUnionSchema } from "./modifiers/modifier-union";
import { localizedNpcSchema } from "./npcs/localized-npc";
import { npcSchema } from "./npcs/npc";
import { localizedPlaceSchema } from "./places/localized-place";
import { placeSchema } from "./places/place";
import { localizedPlaneSchema } from "./planes/localized-plane";
import { planeSchema } from "./planes/plane";
import { localizedServiceSchema } from "./services/localized-service";
import { serviceSchema } from "./services/service";
import { localizedSpeciesSchema } from "./species/localized-species";
import { speciesSchema } from "./species/species";
import { localizedSpellSchema } from "./spells/localized-spell";
import { spellSchema } from "./spells/spell";
import { localizedVehicleSchema } from "./vehicles/localized-vehicle";
import { vehicleSchema } from "./vehicles/vehicle";

//------------------------------------------------------------------------------
// Resource Union
//------------------------------------------------------------------------------

export const resourceUnionSchema = z.discriminatedUnion("kind", [
  backgroundSchema,
  calendarSchema,
  chronicleEntrySchema,
  characterClassSchema,
  characterSubclassSchema,
  creatureTagSchema,
  creatureTreasureSchema,
  creatureSchema,
  creatureFamilySchema,
  creatureHabitatSchema,
  eldritchInvocationSchema,
  equipmentUnionSchema,
  factionSchema,
  featSchema,
  featureSchema,
  languageSchema,
  maneuverSchema,
  metamagicSchema,
  npcSchema,
  modifierUnionSchema,
  placeSchema,
  planeSchema,
  serviceSchema,
  speciesSchema,
  spellSchema,
  vehicleSchema,
]);

//------------------------------------------------------------------------------
// Resource Union
//------------------------------------------------------------------------------

export type ResourceUnion = z.infer<typeof resourceUnionSchema>;

//------------------------------------------------------------------------------
// Localized Resource Union
//------------------------------------------------------------------------------

export const localizedResourceUnionSchema = z.discriminatedUnion("kind", [
  localizedBackgroundSchema,
  localizedCalendarSchema,
  localizedCharacterClassSchema,
  localizedCharacterSubclassSchema,
  localizedChronicleEntrySchema,
  localizedCreatureTagSchema,
  localizedCreatureTreasureSchema,
  localizedCreatureSchema,
  localizedCreatureFamilySchema,
  localizedCreatureHabitatSchema,
  localizedEldritchInvocationSchema,
  localizedEquipmentUnionSchema,
  localizedFactionSchema,
  localizedFeatSchema,
  localizedFeatureSchema,
  localizedLanguageSchema,
  localizedManeuverSchema,
  localizedMetamagicSchema,
  localizedNpcSchema,
  localizedModifierUnionSchema,
  localizedPlaceSchema,
  localizedPlaneSchema,
  localizedServiceSchema,
  localizedSpeciesSchema,
  localizedSpellSchema,
  localizedVehicleSchema,
]);

//------------------------------------------------------------------------------
// Localized Resource Union
//------------------------------------------------------------------------------

export type LocalizedResourceUnion = z.infer<typeof localizedResourceUnionSchema>;
