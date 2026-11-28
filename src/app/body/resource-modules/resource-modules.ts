import { resourceModule as backgrounds } from "./backgrounds/backgrounds-module";
import { resourceModule as calendars } from "./calendars/calendars-module";
import { resourceModule as characterClasses } from "./character-classes/character-classes-module";
import { resourceModule as characterSubclasses } from "./character-subclasses/character-subclasses-module";
import { resourceModule as chronicleEntries } from "./chronicle-entries/chronicle-entries-module";
import { resourceModule as creatureFamilies } from "./creature-families/creature-families-module";
import { resourceModule as creatureHabitats } from "./creature-habitats/creature-habitats-module";
import { resourceModule as creatureTags } from "./creature-tags/creature-tags-module";
import { resourceModule as creatureTreasures } from "./creature-treasures/creature-treasures-module";
import { resourceModule as creatures } from "./creatures/creatures-module";
import { resourceModule as deities } from "./deities/deities-module";
import { resourceModule as eldritchInvocations } from "./eldritch-invocations/eldritch-invocations-module";
import { resourceModule as armors } from "./equipment/armors/armors-module";
import { resourceModule as items } from "./equipment/items/items-module";
import { resourceModule as tools } from "./equipment/tools/tools-module";
import { resourceModule as weapons } from "./equipment/weapons/weapons-module";
import { resourceModule as factions } from "./factions/factions-module";
import { resourceModule as feats } from "./feats/feats-module";
import { resourceModule as features } from "./features/features-module";
import { resourceModule as languages } from "./languages/languages-module";
import { resourceModule as maneuvers } from "./maneuvers/maneuvers-module";
import { resourceModule as metamagics } from "./metamagics/metamagics-module";
import { resourceModule as armorModifiers } from "./modifiers/equipment/armors/armor-modifiers-module";
import { resourceModule as itemModifiers } from "./modifiers/equipment/items/item-modifiers-module";
import { resourceModule as toolModifiers } from "./modifiers/equipment/tools/tool-modifiers-module";
import { resourceModule as weaponModifiers } from "./modifiers/equipment/weapons/weapon-modifiers-module";
import { resourceModule as npcs } from "./npcs/npcs-module";
import { resourceModule as pcs } from "./pcs/pcs-module";
import { resourceModule as places } from "./places/places-module";
import { resourceModule as planes } from "./planes/planes-module";
import { resourceModule as relics } from "./relics/relics-module";
import { resourceModule as services } from "./services/services-module";
import { resourceModule as species } from "./species/species-module";
import { resourceModule as spells } from "./spells/spells-module";
import { resourceModule as vehicles } from "./vehicles/vehicles-module";
import type { ResourceModule } from "./resource-module";

//------------------------------------------------------------------------------
// Resource Modules
//------------------------------------------------------------------------------

export const resourceModules: ResourceModule[] = [
  armorModifiers,
  armors,
  backgrounds,
  calendars,
  chronicleEntries,
  characterClasses,
  characterSubclasses,
  creatureFamilies,
  creatureHabitats,
  creatureTags,
  creatureTreasures,
  creatures,
  deities,
  eldritchInvocations,
  factions,
  feats,
  features,
  itemModifiers,
  items,
  languages,
  maneuvers,
  metamagics,
  npcs,
  pcs,
  places,
  planes,
  relics,
  services,
  species,
  spells,
  toolModifiers,
  tools,
  vehicles,
  weaponModifiers,
  weapons,
];
