import { type CreatureTag } from "~/models/resources/creature-tags/creature-tag";
import {
  creatureTagForm,
  creatureTagFormDataToResource,
} from "~/models/resources/creature-tags/creature-tag-form";
import { creatureTagStore } from "~/models/resources/creature-tags/creature-tag-store";
import { type LocalizedCreatureTag } from "~/models/resources/creature-tags/localized-creature-tag";
import { createResourcesPanel } from "../resources-panel";
import { createResourcesTableColumns } from "../resources-table-columns";
import { CreatureTagCard } from "./creature-tag-card";
import { createCreatureTagEditor } from "./creature-tag-editor";
import CreatureTagsFilters from "./creature-tags-filters";

//------------------------------------------------------------------------------
// Columns
//------------------------------------------------------------------------------

const columns = createResourcesTableColumns<CreatureTag, LocalizedCreatureTag>(
  [],
);

//------------------------------------------------------------------------------
// Creature Tags Panel
//------------------------------------------------------------------------------

const CreatureTagsPanel = createResourcesPanel(
  creatureTagStore,
  { initialPaletteName: "brown" },
  {
    album: { AlbumCard: CreatureTagCard },
    filters: { Filters: CreatureTagsFilters },
    form: {
      Editor: createCreatureTagEditor(creatureTagForm),
      form: creatureTagForm,
      parseFormData: creatureTagFormDataToResource,
    },
    table: { columns },
  },
);

export default CreatureTagsPanel;
