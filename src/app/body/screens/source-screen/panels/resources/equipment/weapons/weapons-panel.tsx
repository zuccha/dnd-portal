import { BowArrowIcon, LayersIcon, SwordsIcon, WandIcon } from "lucide-react";
import { hasAvailableEquipmentModifier } from "~/models/resources/equipment/equipment-variant";
import { type LocalizedWeapon } from "~/models/resources/equipment/weapons/localized-weapon";
import { type Weapon } from "~/models/resources/equipment/weapons/weapon";
import {
  weaponForm,
  weaponFormDataToDB,
} from "~/models/resources/equipment/weapons/weapon-form";
import { weaponStore } from "~/models/resources/equipment/weapons/weapon-store";
import { weaponModifierStore } from "~/models/resources/modifiers/equipment/weapons/weapon-modifier-store";
import { createResourcesPanel } from "../../resources-panel";
import type { ResourcesTableExtra } from "../../resources-table";
import { createEquipmentVariantDialog } from "../equipment-variant-dialog";
import { WeaponCard } from "./weapon-card";
import { createWeaponEditor } from "./weapon-editor";
import WeaponsFilters from "./weapons-filters";

//------------------------------------------------------------------------------
// Columns
//------------------------------------------------------------------------------

const columns: ResourcesTableExtra<Weapon, LocalizedWeapon>["columns"] = [
  {
    key: "name",
    label: { en: "Name", it: "Nome" },
  },
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
    icon: WandIcon,
    key: "magic",
    label: { en: "🪄", it: "🪄" },
    textAlign: "center",
    w: "1%",
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
] as const;

//------------------------------------------------------------------------------
// Weapon Variant Dialog
//------------------------------------------------------------------------------

const weaponVariantDialog = createEquipmentVariantDialog(
  weaponStore,
  weaponModifierStore,
);

//------------------------------------------------------------------------------
// Actions
//------------------------------------------------------------------------------

const actions: ResourcesTableExtra<Weapon, LocalizedWeapon>["actions"] = [
  {
    icon: LayersIcon,
    isVisible: hasAvailableEquipmentModifier,
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
      parseFormData: weaponFormDataToDB,
    },
    table: {
      actions,
      columns,
      detailsKey: "details",
    },
  },
);

export default WeaponsPanel;
