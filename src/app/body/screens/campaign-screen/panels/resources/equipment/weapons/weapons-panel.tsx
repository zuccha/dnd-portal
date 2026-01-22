import { BowArrowIcon, SwordsIcon, WandIcon } from "lucide-react";
import { type LocalizedWeapon } from "~/models/resources/equipment/weapons/localized-weapon";
import { type Weapon } from "~/models/resources/equipment/weapons/weapon";
import {
  weaponForm,
  weaponFormDataToDB,
} from "~/models/resources/equipment/weapons/weapon-form";
import { weaponStore } from "~/models/resources/equipment/weapons/weapon-store";
import { createResourcesPanel } from "../../resources-panel";
import type { ResourcesTableExtra } from "../../resources-table";
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
    maxW: "5em",
  },
  {
    key: "damage_extended",
    label: { en: "Damage", it: "Danni" },
    maxW: "5em",
  },
  {
    key: "properties",
    label: { en: "Properties", it: "Proprietà" },
    maxW: "14em",
  },
  {
    key: "mastery",
    label: { en: "Mastery", it: "Padronanza" },
    maxW: "6em",
  },
  {
    icon: WandIcon,
    key: "magic",
    label: { en: "🪄", it: "🪄" },
    textAlign: "center",
    w: "4em",
  },
  {
    icon: SwordsIcon,
    key: "melee",
    label: { en: "⚔️", it: "⚔️" },
    textAlign: "center",
    w: "4em",
  },
  {
    icon: BowArrowIcon,
    key: "ranged",
    label: { en: "🏹", it: "🏹" },
    textAlign: "center",
    w: "4em",
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
// Weapons Panel
//------------------------------------------------------------------------------

const WeaponsPanel = createResourcesPanel(weaponStore, {
  album: { AlbumCard: WeaponCard },
  filters: { Filters: WeaponsFilters },
  form: {
    Editor: createWeaponEditor(weaponForm),
    form: weaponForm,
    parseFormData: weaponFormDataToDB,
  },
  table: { columns, detailsKey: "details" },
});

export default WeaponsPanel;
