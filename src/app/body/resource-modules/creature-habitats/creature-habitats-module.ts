import { type CreatureHabitat } from "~/models/resources/creature-habitats/creature-habitat";
import {
  creatureHabitatForm,
  creatureHabitatFormDataToResource,
} from "~/models/resources/creature-habitats/creature-habitat-form";
import { creatureHabitatStore } from "~/models/resources/creature-habitats/creature-habitat-store";
import { type LocalizedCreatureHabitat } from "~/models/resources/creature-habitats/localized-creature-habitat";
import { Route } from "~/navigation/routes";
import { createResourceModule } from "../resource-module";
import { createResourcesTableColumns } from "../resources-table-columns";
import { createCreatureHabitatEditor } from "./creature-habitat-editor";
import CreatureHabitatDetail from "./detail/creature-habitat-detail";
import { CreatureHabitatCard } from "./panel/creature-habitat-card";
import CreatureHabitatsFilters from "./panel/creature-habitats-filters";

const columns = createResourcesTableColumns<CreatureHabitat, LocalizedCreatureHabitat>([]);

//------------------------------------------------------------------------------
// Creature Habitats Module
//------------------------------------------------------------------------------

export const resourceModule = createResourceModule(
  creatureHabitatStore,
  { initialPaletteName: "brown", path: Route.ResourcesBestiaryHabitats },
  {
    album: { AlbumCard: CreatureHabitatCard },
    detail: { Detail: CreatureHabitatDetail },
    filters: { Filters: CreatureHabitatsFilters },
    form: {
      Editor: createCreatureHabitatEditor(creatureHabitatForm),
      form: creatureHabitatForm,
      parseFormData: creatureHabitatFormDataToResource,
    },
    table: { columns },
  },
);
