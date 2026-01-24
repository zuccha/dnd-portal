import { WandIcon } from "lucide-react";
import { type Item } from "~/models/resources/equipment/items/item";
import {
  itemForm,
  itemFormDataToDB,
} from "~/models/resources/equipment/items/item-form";
import { itemStore } from "~/models/resources/equipment/items/item-store";
import { type LocalizedItem } from "~/models/resources/equipment/items/localized-item";
import { createResourcesPanel } from "../../resources-panel";
import type { ResourcesTableExtra } from "../../resources-table";
import { ItemCard } from "./item-card";
import { createItemEditor } from "./item-editor";
import ItemsFilters from "./items-filters";

//------------------------------------------------------------------------------
// Columns
//------------------------------------------------------------------------------

const columns: ResourcesTableExtra<Item, LocalizedItem>["columns"] = [
  {
    key: "name",
    label: { en: "Name", it: "Nome" },
  },
  {
    icon: WandIcon,
    key: "magic",
    label: { en: "🪄", it: "🪄" },
    textAlign: "center",
    w: "4em",
  },
  {
    key: "weight",
    label: { en: "Weight", it: "Peso" },
    textAlign: "right",
    w: "1%",
    whiteSpace: "nowrap",
  },
  {
    key: "cost",
    label: { en: "Cost", it: "Costo" },
    textAlign: "right",
    w: "1%",
    whiteSpace: "nowrap",
  },
] as const;

//------------------------------------------------------------------------------
// Items Panel
//------------------------------------------------------------------------------

const ItemsPanel = createResourcesPanel(
  itemStore,
  { initialPaletteName: "orange" },
  {
    album: { AlbumCard: ItemCard },
    filters: { Filters: ItemsFilters },
    form: {
      Editor: createItemEditor(itemForm),
      form: itemForm,
      parseFormData: itemFormDataToDB,
    },
    table: { columns, detailsKey: "details" },
  },
);

export default ItemsPanel;
