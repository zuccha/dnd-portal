import z from "zod";
import { backgroundSchema } from "./backgrounds/background";
import { localizedBackgroundSchema } from "./backgrounds/localized-background";
import { characterClassSchema } from "./character-classes/character-class";
import { localizedCharacterClassSchema } from "./character-classes/localized-character-class";
import { characterSubclassSchema } from "./character-subclasses/character-subclass";
import { localizedCharacterSubclassSchema } from "./character-subclasses/localized-character-subclass";
import { creatureTagSchema } from "./creature-tags/creature-tag";
import { localizedCreatureTagSchema } from "./creature-tags/localized-creature-tag";
import { creatureSchema } from "./creatures/creature";
import { localizedCreatureSchema } from "./creatures/localized-creature";
import { eldritchInvocationSchema } from "./eldritch-invocations/eldritch-invocation";
import { localizedEldritchInvocationSchema } from "./eldritch-invocations/localized-eldritch-invocation";
import {
  equipmentUnionSchema,
  localizedEquipmentUnionSchema,
} from "./equipment/equipment-union";
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
import {
  localizedModifierUnionSchema,
  modifierUnionSchema,
} from "./modifiers/modifier-union";
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
  characterClassSchema,
  characterSubclassSchema,
  creatureTagSchema,
  creatureSchema,
  eldritchInvocationSchema,
  equipmentUnionSchema,
  featSchema,
  featureSchema,
  languageSchema,
  maneuverSchema,
  metamagicSchema,
  modifierUnionSchema,
  planeSchema,
  serviceSchema,
  speciesSchema,
  spellSchema,
  vehicleSchema,
]);

export type ResourceUnion = z.infer<typeof resourceUnionSchema>;

//------------------------------------------------------------------------------
// Localized Resource Union
//------------------------------------------------------------------------------

export const localizedResourceUnionSchema = z.discriminatedUnion("kind", [
  localizedBackgroundSchema,
  localizedCharacterClassSchema,
  localizedCharacterSubclassSchema,
  localizedCreatureTagSchema,
  localizedCreatureSchema,
  localizedEldritchInvocationSchema,
  localizedEquipmentUnionSchema,
  localizedFeatSchema,
  localizedFeatureSchema,
  localizedLanguageSchema,
  localizedManeuverSchema,
  localizedMetamagicSchema,
  localizedModifierUnionSchema,
  localizedPlaneSchema,
  localizedServiceSchema,
  localizedSpeciesSchema,
  localizedSpellSchema,
  localizedVehicleSchema,
]);

export type LocalizedResourceUnion = z.infer<
  typeof localizedResourceUnionSchema
>;
