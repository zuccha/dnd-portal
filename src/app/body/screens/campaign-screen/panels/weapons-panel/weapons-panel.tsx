import { BowArrowIcon, SwordsIcon, WandIcon } from "lucide-react";
import {
  type LocalizedWeapon,
  useLocalizeWeapon,
} from "../../../../../../resources/localized-weapon";
import { type Weapon, weaponsStore } from "../../../../../../resources/weapon";
import type { ResourcesListTableColumn } from "../resources/resources-list-table";
import { createResourcesPanel } from "../resources/resources-panel";
import WeaponCard from "./weapon-card";
import WeaponEditor from "./weapon-editor";
import weaponEditorForm from "./weapon-editor-form";
import WeaponsFilters from "./weapon-filters";

//------------------------------------------------------------------------------
// Columns
//------------------------------------------------------------------------------

const columns: Omit<
  ResourcesListTableColumn<Weapon, LocalizedWeapon>,
  "label"
>[] = [
  { key: "name" },
  { key: "type", maxW: "5em" },
  { key: "damage_extended", maxW: "5em" },
  { key: "properties_extended", maxW: "14em" },
  { key: "mastery", maxW: "6em" },
  { icon: WandIcon, key: "magic", textAlign: "center", w: "4em" },
  { icon: SwordsIcon, key: "melee", textAlign: "center", w: "4em" },
  { icon: BowArrowIcon, key: "ranged", textAlign: "center", w: "4em" },
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
  ResourceEditorContent: WeaponEditor,
  form: weaponEditorForm,
  listTableColumns: columns,
  listTableColumnsI18nContext: i18nContext,
  listTableDescriptionKey: "notes",
  store: weaponsStore,
  useTranslateResource: useLocalizeWeapon,
});

export default WeaponsPanel;
