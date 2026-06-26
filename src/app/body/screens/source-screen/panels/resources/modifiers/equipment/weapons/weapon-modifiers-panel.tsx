import { weaponStore } from "~/models/resources/equipment/weapons/weapon-store";
import {
  weaponModifierForm,
  weaponModifierFormDataToDB,
} from "~/models/resources/modifiers/equipment/weapons/weapon-modifier-form";
import { weaponModifierStore } from "~/models/resources/modifiers/equipment/weapons/weapon-modifier-store";
import { createEquipmentModifiersPanel } from "../equipment-modifiers-panel";
import { WeaponModifierCard } from "./weapon-modifier-card";
import { createWeaponModifierEditor } from "./weapon-modifier-editor";
import WeaponModifiersFilters from "./weapon-modifiers-filters";

//------------------------------------------------------------------------------
// Weapon Modifiers Panel
//------------------------------------------------------------------------------

const WeaponModifiersPanel = createEquipmentModifiersPanel(
  weaponModifierStore,
  weaponStore,
  "brick",
  {
    form: weaponModifierForm,
    parseFormData: weaponModifierFormDataToDB,
  },
  {
    AlbumCard: WeaponModifierCard,
    Filters: WeaponModifiersFilters,
    createEditor: createWeaponModifierEditor,
  },
);

export default WeaponModifiersPanel;
