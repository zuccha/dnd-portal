import { type LocalizedSpecies } from "~/models/resources/species/localized-species";
import { type Species } from "~/models/resources/species/species";
import {
  speciesForm,
  speciesFormDataToDB,
} from "~/models/resources/species/species-form";
import { speciesStore } from "~/models/resources/species/species-store";
import { createResourcesPanel } from "../resources-panel";
import type { ResourcesTableExtra } from "../resources-table";
import { SpeciesCard } from "./species-card";
import { createSpeciesEditor } from "./species-editor";
import SpeciessFilters from "./species-filters";

//------------------------------------------------------------------------------
// Columns
//------------------------------------------------------------------------------

const columns: ResourcesTableExtra<Species, LocalizedSpecies>["columns"] = [
  {
    key: "name",
    label: { en: "Name", it: "Nome" },
  },
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
] as const;

//------------------------------------------------------------------------------
// Eldritch Invocations Panel
//------------------------------------------------------------------------------

const SpeciesPanel = createResourcesPanel(
  speciesStore,
  { initialPaletteName: "green" },
  {
    album: { AlbumCard: SpeciesCard },
    filters: { Filters: SpeciessFilters },
    form: {
      Editor: createSpeciesEditor(speciesForm),
      form: speciesForm,
      parseFormData: speciesFormDataToDB,
    },
    table: { columns, detailsKey: "details" },
  },
);

export default SpeciesPanel;
