import type { WeaponTranslation } from "../../../../../../resources/weapon-translation";
import type { DataTableColumn } from "../../../../../../ui/data-table";
import { createResourcesPanel } from "../resources-panel";
import useFilteredWeaponTranslations from "./use-filtered-weapon-translations";
import WeaponCard from "./weapon-card";
import WeaponsFilters from "./weapon-filters";

//------------------------------------------------------------------------------
// Columns
//------------------------------------------------------------------------------

const columns: Omit<DataTableColumn<WeaponTranslation>, "label">[] = [
  { key: "name" },
  { key: "type", maxW: "5em" },
  { key: "properties", maxW: "12em" },
  { key: "mastery", maxW: "6em" },
  { key: "magic", maxW: "2em", textAlign: "center" },
  { key: "melee", maxW: "2em", textAlign: "center" },
  { key: "ranged", maxW: "2em", textAlign: "center" },
  { key: "range", maxW: "4em", textAlign: "right" },
  { key: "weight", maxW: "3em", textAlign: "right" },
] as const;

//------------------------------------------------------------------------------
// I18n Context
//------------------------------------------------------------------------------

const i18nContext = {
  name: {
    en: "Name",
    it: "Nome",
  },

  type: {
    en: "Type",
    it: "Tipo",
  },

  properties: {
    en: "Properties",
    it: "Proprietà",
  },

  mastery: {
    en: "Mastery",
    it: "Padronanza",
  },

  magic: {
    en: "🪄",
    it: "🪄",
  },

  melee: {
    en: "⚔️",
    it: "⚔️",
  },

  ranged: {
    en: "🏹",
    it: "🏹",
  },

  range: {
    en: "Range",
    it: "Gittata",
  },

  weight: {
    en: "Weight",
    it: "Peso",
  },
};

//------------------------------------------------------------------------------
// Weapons Panel
//------------------------------------------------------------------------------

const WeaponsPanel = createResourcesPanel(
  useFilteredWeaponTranslations,
  columns,
  i18nContext,
  "notes",
  WeaponsFilters,
  WeaponCard
);

export default WeaponsPanel;
