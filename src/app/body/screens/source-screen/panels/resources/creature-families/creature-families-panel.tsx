import { type CreatureFamily } from "~/models/resources/creature-families/creature-family";
import {
  creatureFamilyForm,
  creatureFamilyFormDataToResource,
} from "~/models/resources/creature-families/creature-family-form";
import { creatureFamilyStore } from "~/models/resources/creature-families/creature-family-store";
import { type LocalizedCreatureFamily } from "~/models/resources/creature-families/localized-creature-family";
import { createResourcesPanel } from "../resources-panel";
import { createResourcesTableColumns } from "../resources-table-columns";
import CreatureFamiliesFilters from "./creature-families-filters";
import { CreatureFamilyCard } from "./creature-family-card";
import { createCreatureFamilyEditor } from "./creature-family-editor";

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

const CreatureFamiliesPanel = createResourcesPanel(
  creatureFamilyStore,
  { initialPaletteName: "brown" },
  {
    album: { AlbumCard: CreatureFamilyCard },
    filters: { Filters: CreatureFamiliesFilters },
    form: {
      Editor: createCreatureFamilyEditor(creatureFamilyForm),
      form: creatureFamilyForm,
      parseFormData: creatureFamilyFormDataToResource,
    },
    table: { columns },
  },
);

export default CreatureFamiliesPanel;
