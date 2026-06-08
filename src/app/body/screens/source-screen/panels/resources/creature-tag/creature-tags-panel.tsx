import { type CreatureTag } from "~/models/resources/creature-tags/creature-tag";
import {
  creatureTagForm,
  creatureTagFormDataToDB,
} from "~/models/resources/creature-tags/creature-tag-form";
import { creatureTagStore } from "~/models/resources/creature-tags/creature-tag-store";
import { type LocalizedCreatureTag } from "~/models/resources/creature-tags/localized-creature-tag";
import { createResourcesPanel } from "../resources-panel";
import type { ResourcesTableExtra } from "../resources-table";
import { CreatureTagCard } from "./creature-tag-card";
import { createCreatureTagEditor } from "./creature-tag-editor";
import CreatureTagsFilters from "./creature-tags-filters";

//------------------------------------------------------------------------------
// Columns
//------------------------------------------------------------------------------

const columns: ResourcesTableExtra<
  CreatureTag,
  LocalizedCreatureTag
>["columns"] = [
  {
    key: "name",
    label: { en: "Name", it: "Nome" },
  },
] as const;

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
      parseFormData: creatureTagFormDataToDB,
    },
    table: { columns },
  },
);

export default CreatureTagsPanel;
