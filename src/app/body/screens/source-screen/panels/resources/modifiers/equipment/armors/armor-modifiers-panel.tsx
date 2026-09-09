import { armorStore } from "~/models/resources/equipment/armors/armor-store";
import {
  armorModifierForm,
  armorModifierFormDataToResource,
} from "~/models/resources/modifiers/equipment/armors/armor-modifier-form";
import { armorModifierStore } from "~/models/resources/modifiers/equipment/armors/armor-modifier-store";
import { createEquipmentModifiersPanel } from "../equipment-modifiers-panel";
import { ArmorModifierCard } from "./armor-modifier-card";
import { createArmorModifierEditor } from "./armor-modifier-editor";
import ArmorModifiersFilters from "./armor-modifiers-filters";

//------------------------------------------------------------------------------
// Armor Modifiers Panel
//------------------------------------------------------------------------------

const ArmorModifiersPanel = createEquipmentModifiersPanel(
  armorModifierStore,
  armorStore,
  "gray",
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

export default ArmorModifiersPanel;
