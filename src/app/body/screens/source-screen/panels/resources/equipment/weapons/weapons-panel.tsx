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
import { createResourcesPanel } from "../../resources-panel";
import { createEquipmentTableColumns } from "../equipment-table-columns";
import { createEquipmentVariantDialog } from "../equipment-variant-dialog";
import { WeaponCard } from "./weapon-card";
import { createWeaponEditor } from "./weapon-editor";
import WeaponsFilters from "./weapons-filters";
import type { ResourcesTableExtra } from "../../resources-table";

//------------------------------------------------------------------------------
// Columns
//------------------------------------------------------------------------------

const columns = createEquipmentTableColumns<Weapon, LocalizedWeapon>([
  {
    key: "type",
    label: { en: "Type", it: "Tipo" },
  },
  {
    key: "damage_extended",
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
    key: "melee",
    label: { en: "⚔️", it: "⚔️" },
    textAlign: "center",
    w: "1%",
  },
  {
    icon: BowArrowIcon,
    key: "ranged",
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

const actions: ResourcesTableExtra<Weapon, LocalizedWeapon>["actions"] = [
  {
    icon: LayersIcon,
    isDisabled: (resource) => !hasAvailableEquipmentModifier(resource),
    isVisible: ({ virtual }) => !virtual,
    label: { en: "Add variant", it: "Aggiungi variante" },
    onClick: weaponVariantDialog.open,
  },
];

//------------------------------------------------------------------------------
// Weapons Panel
//------------------------------------------------------------------------------

const WeaponsPanel = createResourcesPanel(
  weaponStore,
  { initialPaletteName: "brick" },
  {
    Extra: weaponVariantDialog.Dialog,
    album: { AlbumCard: WeaponCard, actions },
    filters: { Filters: WeaponsFilters },
    form: {
      Editor: createWeaponEditor(weaponForm),
      form: weaponForm,
      parseFormData: weaponFormDataToResource,
    },
    table: {
      actions,
      columns,
      detailsKey: "details",
    },
  },
);

export default WeaponsPanel;
