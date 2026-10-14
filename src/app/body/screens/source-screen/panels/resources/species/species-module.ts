import { type LocalizedSpecies } from "~/models/resources/species/localized-species";
import { type Species } from "~/models/resources/species/species";
import { speciesForm, speciesFormDataToResource } from "~/models/resources/species/species-form";
import { speciesStore } from "~/models/resources/species/species-store";
import { Route } from "~/navigation/routes";
import { createResourceModule } from "../resources-panel";
import { createResourcesTableColumns } from "../resources-table-columns";
import SpeciesDetail from "./detail/species-detail";
import { SpeciesCard } from "./species-card";
import { createSpeciesEditor } from "./species-editor";
import SpeciesFilters from "./species-filters";

//------------------------------------------------------------------------------
// Columns
//------------------------------------------------------------------------------

const columns = createResourcesTableColumns<Species, LocalizedSpecies>([
  {
    key: "type",
    label: { en: "Type", it: "Tipo" },
  },
  {
    key: "sizes",
    label: { en: "Sizes", it: "Taglie" },
  },
  {
    key: "speed",
    label: { en: "Speed", it: "Velocità" },
    textAlign: "right",
    w: "1%",
  },
]);

//------------------------------------------------------------------------------
// Eldritch Invocations Panel
//------------------------------------------------------------------------------

export const resourceModule = createResourceModule(
  speciesStore,
  { initialPaletteName: "green", path: Route.ResourcesCharacterSpecies },
  {
    album: { AlbumCard: SpeciesCard },
    Detail: SpeciesDetail,
    filters: { Filters: SpeciesFilters },
    form: {
      Editor: createSpeciesEditor(speciesForm),
      form: speciesForm,
      parseFormData: speciesFormDataToResource,
    },
    table: { columns, detailsKey: "details" },
  },
);
