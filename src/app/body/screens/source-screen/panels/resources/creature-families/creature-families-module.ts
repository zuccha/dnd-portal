import { type CreatureFamily } from "~/models/resources/creature-families/creature-family";
import {
  creatureFamilyForm,
  creatureFamilyFormDataToResource,
} from "~/models/resources/creature-families/creature-family-form";
import { creatureFamilyStore } from "~/models/resources/creature-families/creature-family-store";
import { type LocalizedCreatureFamily } from "~/models/resources/creature-families/localized-creature-family";
import { Route } from "~/navigation/routes";
import { createResourceModule } from "../resources-panel";
import { createResourcesTableColumns } from "../resources-table-columns";
import CreatureFamiliesFilters from "./creature-families-filters";
import { CreatureFamilyCard } from "./creature-family-card";
import { createCreatureFamilyEditor } from "./creature-family-editor";
import CreatureFamilyDetail from "./detail/creature-family-detail";

//------------------------------------------------------------------------------
// Columns
//------------------------------------------------------------------------------

const columns = createResourcesTableColumns<CreatureFamily, LocalizedCreatureFamily>([
  { key: "habitats", label: { en: "Habitats", it: "Habitat" } },
  { key: "treasures", label: { en: "Treasures", it: "Tesori" } },
]);

//------------------------------------------------------------------------------
// Creature Families Panel
//------------------------------------------------------------------------------

export const resourceModule = createResourceModule(
  creatureFamilyStore,
  { initialPaletteName: "brown", path: Route.ResourcesBestiaryFamilies },
  {
    album: { AlbumCard: CreatureFamilyCard },
    Detail: CreatureFamilyDetail,
    filters: { Filters: CreatureFamiliesFilters },
    form: {
      Editor: createCreatureFamilyEditor(creatureFamilyForm),
      form: creatureFamilyForm,
      parseFormData: creatureFamilyFormDataToResource,
    },
    table: { columns },
  },
);
