import { BowArrowIcon, SwordsIcon, WandIcon } from "lucide-react";
import {
  type DBWeapon,
  type DBWeaponTranslation,
  dbWeaponSchema,
  dbWeaponTranslationSchema,
} from "../../../../../../resources/db-weapon";
import {
  type LocalizedWeapon,
  useLocalizeWeapon,
} from "../../../../../../resources/localized-weapon";
import {
  type Weapon,
  defaultWeapon,
  updateWeapon,
  weaponsStore,
} from "../../../../../../resources/weapon";
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
// Parse Form Data
//------------------------------------------------------------------------------

function parseFormData(
  data: Partial<WeaponEditorFormFields>
):
  | { weapon: Partial<DBWeapon>; translation: Partial<DBWeaponTranslation> }
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

  return { translation: translation.data, weapon: weapon.data };
}

//------------------------------------------------------------------------------
// Submit Editor Form
//------------------------------------------------------------------------------

async function submitEditorForm(
  data: Partial<WeaponEditorFormFields>,
  { id, lang }: { id: string; lang: string }
) {
  const errorOrData = parseFormData(data);
  if (typeof errorOrData === "string") return errorOrData;

  const { weapon, translation } = errorOrData;

  const response = await updateWeapon(id, lang, weapon, translation);
  if (response.error)
    return report(response.error, "form.error.update_failure");

  return undefined;
}

//------------------------------------------------------------------------------
// Submit Creator Form
//------------------------------------------------------------------------------

async function submitCreatorForm(
  data: Partial<WeaponEditorFormFields>,
  { campaignId, lang }: { campaignId: string; lang: string }
) {
  const errorOrData = parseFormData(data);
  if (typeof errorOrData === "string") return errorOrData;

  const { weapon, translation } = errorOrData;

  // const response = await createWeapon(campaignId, lang, weapon, translation);
  // if (response.error) report(response.error, "form.error.creation_failure");
  console.log(campaignId, lang, weapon, translation);

  return undefined;
}

//------------------------------------------------------------------------------
// Weapons Panel
//------------------------------------------------------------------------------

const WeaponsPanel = createResourcesPanel({
  Filters: WeaponsFilters,
  ResourceCard: WeaponCard,
  ResourceEditorContent: WeaponEditor,
  defaultResource: defaultWeapon,
  form: weaponEditorForm,
  listTableColumns: columns,
  listTableColumnsI18nContext: i18nContext,
  listTableDescriptionKey: "notes",
  onSubmitCreatorForm: submitCreatorForm,
  onSubmitEditorForm: submitEditorForm,
  store: weaponsStore,
  useLocalizeResource: useLocalizeWeapon,
});

export default WeaponsPanel;
