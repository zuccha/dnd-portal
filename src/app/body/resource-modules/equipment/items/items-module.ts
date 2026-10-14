import { FlaskConicalIcon, LayersIcon } from "lucide-react";
import { hasAvailableEquipmentModifier } from "~/models/resources/equipment/equipment-variant";
import { type Item } from "~/models/resources/equipment/items/item";
import { itemForm, itemFormDataToResource } from "~/models/resources/equipment/items/item-form";
import { itemStore } from "~/models/resources/equipment/items/item-store";
import { type LocalizedItem } from "~/models/resources/equipment/items/localized-item";
import { itemModifierStore } from "~/models/resources/modifiers/equipment/items/item-modifier-store";
import { Route } from "~/navigation/routes";
import { createResourceModule } from "../../resource-module";
import { createEquipmentTableColumns } from "../equipment-table-columns";
import { createEquipmentVariantDialog } from "../equipment-variant-dialog";
import ItemDetail from "./detail/item-detail";
import { createItemEditor } from "./item-editor";
import { ItemCard } from "./panel/item-card";
import ItemsFilters from "./panel/items-filters";
import type { ResourceAction } from "../../resource-action";

//------------------------------------------------------------------------------
// Columns
//------------------------------------------------------------------------------

const columns = createEquipmentTableColumns<Item, LocalizedItem>([
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
]);

//------------------------------------------------------------------------------
// Item Variant Dialog
//------------------------------------------------------------------------------

const itemVariantDialog = createEquipmentVariantDialog(itemStore, itemModifierStore);

//------------------------------------------------------------------------------
// Actions
//------------------------------------------------------------------------------

const actions: ResourceAction<Item>[] = [
  {
    icon: LayersIcon,
    isDisabled: (resource) => !hasAvailableEquipmentModifier(resource),
    isVisible: ({ virtual }) => !virtual,
    label: { en: "Add variant", it: "Aggiungi variante" },
    onClick: itemVariantDialog.open,
  },
];

const detailActions: ResourceAction<Item>[] = [
  {
    icon: LayersIcon,
    isDisabled: (resource) => !hasAvailableEquipmentModifier(resource),
    isVisible: ({ virtual }) => !virtual,
    label: { en: "Add variant", it: "Aggiungi variante" },
    onClick: (resource) => itemVariantDialog.open(resource, { navigateAfterCreation: true }),
  },
];

//------------------------------------------------------------------------------
// Items Panel
//------------------------------------------------------------------------------

export const resourceModule = createResourceModule(
  itemStore,
  { initialPaletteName: "teal", initialView: "cards", path: Route.ResourcesEquipmentItems },
  {
    Extra: itemVariantDialog.Dialog,
    album: { AlbumCard: ItemCard, actions },
    detail: { Detail: ItemDetail, actions: detailActions },
    filters: { Filters: ItemsFilters },
    form: {
      Editor: createItemEditor(itemForm),
      form: itemForm,
      parseFormData: itemFormDataToResource,
    },
    table: {
      actions,
      columns,
      detailsKey: "details",
    },
  },
);
