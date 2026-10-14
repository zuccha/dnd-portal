import { itemStore } from "~/models/resources/equipment/items/item-store";
import {
  itemModifierForm,
  itemModifierFormDataToResource,
} from "~/models/resources/modifiers/equipment/items/item-modifier-form";
import { itemModifierStore } from "~/models/resources/modifiers/equipment/items/item-modifier-store";
import { Route } from "~/navigation/routes";
import { createEquipmentModifierModule } from "../equipment-modifiers-module";
import ItemModifierDetail from "./detail/item-modifier-detail";
import { createItemModifierEditor } from "./item-modifier-editor";
import { ItemModifierCard } from "./panel/item-modifier-card";
import ItemModifiersFilters from "./panel/item-modifiers-filters";

//------------------------------------------------------------------------------
// Item Modifiers Panel
//------------------------------------------------------------------------------

export const resourceModule = createEquipmentModifierModule(
  itemModifierStore,
  itemStore,
  "teal",
  Route.ResourcesEquipmentItemModifiers,
  ItemModifierDetail,
  {
    form: itemModifierForm,
    parseFormData: itemModifierFormDataToResource,
  },
  {
    AlbumCard: ItemModifierCard,
    Filters: ItemModifiersFilters,
    createEditor: createItemModifierEditor,
  },
);
