import { weaponStore } from "~/models/resources/equipment/weapons/weapon-store";
import {
  weaponModifierForm,
  weaponModifierFormDataToResource,
} from "~/models/resources/modifiers/equipment/weapons/weapon-modifier-form";
import { weaponModifierStore } from "~/models/resources/modifiers/equipment/weapons/weapon-modifier-store";
import { Route } from "~/navigation/routes";
import { createEquipmentModifierModule } from "../equipment-modifiers-module";
import WeaponModifierDetail from "./detail/weapon-modifier-detail";
import { WeaponModifierCard } from "./panel/weapon-modifier-card";
import WeaponModifiersFilters from "./panel/weapon-modifiers-filters";
import { createWeaponModifierEditor } from "./weapon-modifier-editor";

//------------------------------------------------------------------------------
// Weapon Modifiers Panel
//------------------------------------------------------------------------------

export const resourceModule = createEquipmentModifierModule(
  weaponModifierStore,
  weaponStore,
  "brick",
  Route.ResourcesEquipmentWeaponModifiers,
  WeaponModifierDetail,
  {
    form: weaponModifierForm,
    parseFormData: weaponModifierFormDataToResource,
  },
  {
    AlbumCard: WeaponModifierCard,
    Filters: WeaponModifiersFilters,
    createEditor: createWeaponModifierEditor,
  },
);
