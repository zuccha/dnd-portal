import { armorStore } from "~/models/resources/equipment/armors/armor-store";
import {
  armorModifierForm,
  armorModifierFormDataToResource,
} from "~/models/resources/modifiers/equipment/armors/armor-modifier-form";
import { armorModifierStore } from "~/models/resources/modifiers/equipment/armors/armor-modifier-store";
import { Route } from "~/navigation/routes";
import { createEquipmentModifierModule } from "../equipment-modifiers-module";
import { createArmorModifierEditor } from "./armor-modifier-editor";
import ArmorModifierDetail from "./detail/armor-modifier-detail";
import { ArmorModifierCard } from "./panel/armor-modifier-card";
import ArmorModifiersFilters from "./panel/armor-modifiers-filters";

//------------------------------------------------------------------------------
// Armor Modifiers Panel
//------------------------------------------------------------------------------

export const resourceModule = createEquipmentModifierModule(
  armorModifierStore,
  armorStore,
  "gray",
  Route.ResourcesEquipmentArmorModifiers,
  ArmorModifierDetail,
  {
    form: armorModifierForm,
    parseFormData: armorModifierFormDataToResource,
  },
  {
    AlbumCard: ArmorModifierCard,
    Filters: ArmorModifiersFilters,
    createEditor: createArmorModifierEditor,
  },
);
