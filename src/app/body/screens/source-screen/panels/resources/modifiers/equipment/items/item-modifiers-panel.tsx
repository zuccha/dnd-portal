import { itemStore } from "~/models/resources/equipment/items/item-store";
import {
  itemModifierForm,
  itemModifierFormDataToDB,
} from "~/models/resources/modifiers/equipment/items/item-modifier-form";
import { itemModifierStore } from "~/models/resources/modifiers/equipment/items/item-modifier-store";
import { createEquipmentModifiersPanel } from "../equipment-modifiers-panel";
import { ItemModifierCard } from "./item-modifier-card";
import { createItemModifierEditor } from "./item-modifier-editor";
import ItemModifiersFilters from "./item-modifiers-filters";

//------------------------------------------------------------------------------
// Item Modifiers Panel
//------------------------------------------------------------------------------

const ItemModifiersPanel = createEquipmentModifiersPanel(
  itemModifierStore,
  itemStore,
  "teal",
  {
    form: itemModifierForm,
    parseFormData: itemModifierFormDataToDB,
  },
  {
    AlbumCard: ItemModifierCard,
    Filters: ItemModifiersFilters,
    createEditor: createItemModifierEditor,
  },
);

export default ItemModifiersPanel;
