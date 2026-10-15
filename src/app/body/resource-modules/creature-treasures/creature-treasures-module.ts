import type { CreatureTreasure } from "~/models/resources/creature-treasures/creature-treasure";
import {
  creatureTreasureForm,
  creatureTreasureFormDataToResource,
} from "~/models/resources/creature-treasures/creature-treasure-form";
import { creatureTreasureStore } from "~/models/resources/creature-treasures/creature-treasure-store";
import type { LocalizedCreatureTreasure } from "~/models/resources/creature-treasures/localized-creature-treasure";
import { Route } from "~/navigation/routes";
import { createResourceModule } from "../resource-module";
import { createResourcesTableColumns } from "../resources-table-columns";
import { createCreatureTreasureEditor } from "./creature-treasure-editor";
import CreatureTreasureDetail from "./detail/creature-treasure-detail";
import { CreatureTreasureCard } from "./panel/creature-treasure-card";
import CreatureTreasuresFilters from "./panel/creature-treasures-filters";

const columns = createResourcesTableColumns<CreatureTreasure, LocalizedCreatureTreasure>([]);

//------------------------------------------------------------------------------
// Creature Treasures Resource Module
//------------------------------------------------------------------------------

export const resourceModule = createResourceModule(
  creatureTreasureStore,
  { initialPaletteName: "brown", path: Route.ResourcesBestiaryTreasures },
  {
    album: { AlbumCard: CreatureTreasureCard },
    detail: { Detail: CreatureTreasureDetail },
    filters: { Filters: CreatureTreasuresFilters },
    form: {
      Editor: createCreatureTreasureEditor(creatureTreasureForm),
      form: creatureTreasureForm,
      parseFormData: creatureTreasureFormDataToResource,
    },
    table: { columns },
  },
);
