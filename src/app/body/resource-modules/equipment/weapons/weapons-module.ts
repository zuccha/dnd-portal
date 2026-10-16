import { BowArrowIcon, LayersIcon, SwordsIcon } from "lucide-react";
import { hasAvailableEquipmentModifier } from "~/models/resources/equipment/equipment-variant";
import { type LocalizedWeapon } from "~/models/resources/equipment/weapons/localized-weapon";
import { type Weapon } from "~/models/resources/equipment/weapons/weapon";
import {
  weaponForm,
  weaponFormDataToResource,
} from "~/models/resources/equipment/weapons/weapon-form";
import { weaponStore } from "~/models/resources/equipment/weapons/weapon-store";
import { weaponModifierStore } from "~/models/resources/modifiers/equipment/weapons/weapon-modifier-store";
import { Route } from "~/navigation/routes";
import { createResourceModule } from "../../resource-module";
import { createEquipmentTableColumns } from "../equipment-table-columns";
import { createEquipmentVariantDialog } from "../equipment-variant-dialog";
import WeaponDetail from "./detail/weapon-detail";
import { WeaponCard } from "./panel/weapon-card";
import WeaponsFilters from "./panel/weapons-filters";
import { createWeaponEditor } from "./weapon-editor";
import type { ResourceAction } from "../../resource-action";

//------------------------------------------------------------------------------
// Columns
//------------------------------------------------------------------------------

const columns = createEquipmentTableColumns<Weapon, LocalizedWeapon>([
  {
    key: "type",
    label: { en: "Type", it: "Tipo" },
  },
  {
    key: "damage",
    label: { en: "Damage", it: "Danni" },
  },
  {
    key: "properties",
    label: { en: "Properties", it: "Proprietà" },
  },
  {
    key: "mastery",
    label: { en: "Mastery", it: "Padronanza" },
  },
  {
    icon: SwordsIcon,
    key: "is_melee",
    label: { en: "⚔️", it: "⚔️" },
    textAlign: "center",
    w: "1%",
  },
  {
    icon: BowArrowIcon,
    key: "is_ranged",
    label: { en: "🏹", it: "🏹" },
    textAlign: "center",
    w: "1%",
  },
]);

//------------------------------------------------------------------------------
// Weapon Variant Dialog
//------------------------------------------------------------------------------

const weaponVariantDialog = createEquipmentVariantDialog(weaponStore, weaponModifierStore);

//------------------------------------------------------------------------------
// Actions
//------------------------------------------------------------------------------

const actions: ResourceAction<Weapon>[] = [
  {
    icon: LayersIcon,
    isDisabled: (resource) => !hasAvailableEquipmentModifier(resource),
    isVisible: ({ is_virtual }) => !is_virtual,
    label: { en: "Add variant", it: "Aggiungi variante" },
    onClick: weaponVariantDialog.open,
  },
];

const detailActions: ResourceAction<Weapon>[] = [
  {
    icon: LayersIcon,
    isDisabled: (resource) => !hasAvailableEquipmentModifier(resource),
    isVisible: ({ is_virtual }) => !is_virtual,
    label: { en: "Add variant", it: "Aggiungi variante" },
    onClick: (resource) => weaponVariantDialog.open(resource, { navigateAfterCreation: true }),
  },
];

//------------------------------------------------------------------------------
// Weapons Panel
//------------------------------------------------------------------------------

export const resourceModule = createResourceModule(
  weaponStore,
  { initialPaletteName: "brick", initialView: "cards", path: Route.ResourcesEquipmentWeapons },
  {
    Extra: weaponVariantDialog.Dialog,
    album: { AlbumCard: WeaponCard, actions },
    detail: { Detail: WeaponDetail, actions: detailActions },
    filters: { Filters: WeaponsFilters },
    form: {
      Editor: createWeaponEditor(weaponForm),
      form: weaponForm,
      parseFormData: weaponFormDataToResource,
    },
    table: {
      actions,
      columns,
      hasDescription: true,
    },
  },
);
