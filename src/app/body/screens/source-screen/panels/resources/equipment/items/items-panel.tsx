import { FlaskConicalIcon, LayersIcon, WandIcon } from "lucide-react";
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
    key: "type",
    label: { en: "Type", it: "Tipo" },
    whiteSpace: "nowrap",
  },
  {
    key: "rarity",
    label: { en: "Rarity", it: "Rarità" },
    whiteSpace: "nowrap",
  },
  {
    icon: WandIcon,
    key: "magic",
    label: { en: "🪄", it: "🪄" },
    textAlign: "center",
    w: "1%",
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
  {
    key: "charges",
    label: { en: "Charges", it: "Cariche" },
    textAlign: "right",
    w: "1%",
    whiteSpace: "nowrap",
  },
  {
    icon: FlaskConicalIcon,
    key: "consumable",
    label: { en: "🧪", it: "🧪" },
    textAlign: "center",
    w: "1%",
  },
] as const;

//------------------------------------------------------------------------------
// Actions
//------------------------------------------------------------------------------

const actions: ResourcesTableExtra<Item, LocalizedItem>["actions"] = [
  {
    icon: LayersIcon,
    isVisible: (item) => item.modifier_ids.length > 0,
    label: { en: "Add variant", it: "Aggiungi variante" },
    onClick: (item) => console.log("Add variant", item),
  },
];

//------------------------------------------------------------------------------
// Items Panel
//------------------------------------------------------------------------------

const ItemsPanel = createResourcesPanel(
  itemStore,
  { initialPaletteName: "teal" },
  {
    album: { AlbumCard: ItemCard, actions },
    filters: { Filters: ItemsFilters },
    form: {
      Editor: createItemEditor(itemForm),
      form: itemForm,
      parseFormData: itemFormDataToDB,
    },
    table: {
      actions,
      columns,
      detailsKey: "details",
    },
  },
);

export default ItemsPanel;
