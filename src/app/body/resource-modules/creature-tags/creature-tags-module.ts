import { type CreatureTag } from "~/models/resources/creature-tags/creature-tag";
import {
  creatureTagForm,
  creatureTagFormDataToResource,
} from "~/models/resources/creature-tags/creature-tag-form";
import { creatureTagStore } from "~/models/resources/creature-tags/creature-tag-store";
import { type LocalizedCreatureTag } from "~/models/resources/creature-tags/localized-creature-tag";
import { Route } from "~/navigation/routes";
import { createResourceModule } from "../resource-module";
import { createResourcesTableColumns } from "../resources-table-columns";
import { createCreatureTagEditor } from "./creature-tag-editor";
import CreatureTagDetail from "./detail/creature-tag-detail";
import { CreatureTagCard } from "./panel/creature-tag-card";
import CreatureTagsFilters from "./panel/creature-tags-filters";

//------------------------------------------------------------------------------
// Columns
//------------------------------------------------------------------------------

const columns = createResourcesTableColumns<CreatureTag, LocalizedCreatureTag>([]);

//------------------------------------------------------------------------------
// Creature Tags Panel
//------------------------------------------------------------------------------

export const resourceModule = createResourceModule(
  creatureTagStore,
  { initialPaletteName: "brown", path: Route.ResourcesBestiaryTags },
  {
    album: { AlbumCard: CreatureTagCard },
    Detail: CreatureTagDetail,
    filters: { Filters: CreatureTagsFilters },
    form: {
      Editor: createCreatureTagEditor(creatureTagForm),
      form: creatureTagForm,
      parseFormData: creatureTagFormDataToResource,
    },
    table: { columns },
  },
);
