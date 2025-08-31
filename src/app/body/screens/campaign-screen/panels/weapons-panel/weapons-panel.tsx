import { useIsWeaponSelected } from "../../../../../../resources/weapon";
import type { WeaponTranslation } from "../../../../../../resources/weapon-translation";
import { createResourcesPanel } from "../resources-panel";
import type { ResourcesTableColumn } from "../resources-table";
import useFilteredWeaponTranslations from "./use-filtered-weapon-translations";
import WeaponCard from "./weapon-card";
import WeaponsFilters from "./weapon-filters";

//------------------------------------------------------------------------------
// Columns
//------------------------------------------------------------------------------

const columns: Omit<ResourcesTableColumn<WeaponTranslation>, "label">[] = [
  { key: "name" },
  { key: "type", maxW: "5em" },
  { key: "damage_extended", maxW: "5em" },
  { key: "properties_extended", maxW: "14em" },
  { key: "mastery", maxW: "6em" },
  { key: "magic", textAlign: "center", w: "4em" },
  { key: "melee", textAlign: "center", w: "4em" },
  { key: "ranged", textAlign: "center", w: "4em" },
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

  damage_extended: {
    en: "Damage",
    it: "Danni",
  },

  properties_extended: {
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

const WeaponsPanel = createResourcesPanel({
  Filters: WeaponsFilters,
  ResourceCard: WeaponCard,
  listTableColumns: columns,
  listTableColumnsI18nContext: i18nContext,
  listTableDescriptionKey: "notes",
  useIsSelected: useIsWeaponSelected,
  useResources: useFilteredWeaponTranslations,
});

export default WeaponsPanel;
