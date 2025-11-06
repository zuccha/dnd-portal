import { BowArrowIcon, SwordsIcon, WandIcon } from "lucide-react";
import {
  type DBWeapon,
  type DBWeaponTranslation,
  dbWeaponSchema,
  dbWeaponTranslationSchema,
} from "../../../../../../resources/weapons/db-weapon";
import { type LocalizedWeapon } from "../../../../../../resources/weapons/localized-weapon";
import {
  type Weapon,
  defaultWeapon,
} from "../../../../../../resources/weapons/weapon";
import { weaponsStore } from "../../../../../../resources/weapons/weapons-store";
import { report } from "../../../../../../utils/error";
import type { ResourcesListTableColumn } from "../resources/resources-list-table";
import { createResourcesPanel } from "../resources/resources-panel";
import WeaponCard from "./weapon-card";
import WeaponEditor from "./weapon-editor";
import weaponEditorForm, {
  type WeaponEditorFormFields,
} from "./weapon-editor-form";
import WeaponsFilters from "./weapon-filters";

//------------------------------------------------------------------------------
// Columns
//------------------------------------------------------------------------------

const columns: ResourcesListTableColumn<Weapon, LocalizedWeapon>[] = [
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
    key: "properties_extended",
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
    maxW: "3em",
    textAlign: "right",
  },
] as const;

//------------------------------------------------------------------------------
// Parse Form Data
//------------------------------------------------------------------------------

function parseFormData(
  data: Partial<WeaponEditorFormFields>
):
  | { resource: Partial<DBWeapon>; translation: Partial<DBWeaponTranslation> }
  | string {
  const maybeWeapon = {
    cost: data.cost,
    damage: data.damage,
    damage_type: data.damage_type,
    damage_versatile: data.damage_versatile,
    magic: data.magic,
    mastery: data.mastery,
    melee: data.melee,
    properties: data.properties,
    range_ft_long: data.range_ft_long,
    range_ft_short: data.range_ft_short,
    range_m_long: data.range_m_long,
    range_m_short: data.range_m_short,
    ranged: data.ranged,
    type: data.type,
    visibility: data.visibility,
    weight_kg: data.weight_kg,
    weight_lb: data.weight_lb,
  };

  const maybeTranslation = {
    ammunition: data.ammunition,
    name: data.name,
    notes: data.notes,
  };

  const weapon = dbWeaponSchema.partial().safeParse(maybeWeapon);
  if (!weapon.success) return report(weapon.error, "form.error.invalid");

  const translation = dbWeaponTranslationSchema
    .partial()
    .safeParse(maybeTranslation);
  if (!translation.success)
    return report(translation.error, "form.error.invalid_translation");

  return { resource: weapon.data, translation: translation.data };
}

//------------------------------------------------------------------------------
// Weapons Panel
//------------------------------------------------------------------------------

const WeaponsPanel = createResourcesPanel({
  Card: WeaponCard,
  EditorContent: WeaponEditor,
  Filters: WeaponsFilters,
  defaultResource: defaultWeapon,
  form: weaponEditorForm,
  listTableColumns: columns,
  listTableDescriptionKey: "description",
  name: { en: "weapons", it: "armi" },
  parseFormData,
  store: weaponsStore,
});

export default WeaponsPanel;
