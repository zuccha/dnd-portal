import { WandIcon } from "lucide-react";
import {
  type Armor,
  defaultArmor,
} from "~/models/resources/equipment/armors/armor";
import { armorsStore } from "~/models/resources/equipment/armors/armors-store";
import {
  type DBArmor,
  type DBArmorTranslation,
  dbArmorSchema,
  dbArmorTranslationSchema,
} from "~/models/resources/equipment/armors/db-armor";
import { type LocalizedArmor } from "~/models/resources/equipment/armors/localized-armor";
import { report } from "~/utils/error";
import type { ResourcesListTableColumn } from "../_base/resources-list-table";
import { createResourcesPanel } from "../_base/resources-panel";
import ArmorCard from "./armor-card";
import ArmorEditor from "./armor-editor";
import armorEditorForm, {
  type ArmorEditorFormFields,
} from "./armor-editor-form";
import ArmorsFilters from "./armors-filters";

//------------------------------------------------------------------------------
// Columns
//------------------------------------------------------------------------------

const columns: ResourcesListTableColumn<Armor, LocalizedArmor>[] = [
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
    key: "armor_class",
    label: { en: "Armor Class", it: "Classe Armatura" },
  },
  {
    key: "required_str",
    label: { en: "Str", it: "For" },
    textAlign: "right",
  },
  {
    key: "required_dex",
    label: { en: "Dex", it: "Des" },
    textAlign: "right",
  },
  {
    key: "required_con",
    label: { en: "Con", it: "Cos" },
    textAlign: "right",
  },
  {
    key: "required_int",
    label: { en: "Int", it: "Int" },
    textAlign: "right",
  },
  {
    key: "required_wis",
    label: { en: "Wis", it: "Sag" },
    textAlign: "right",
  },
  {
    key: "required_cha",
    label: { en: "Cha", it: "Car" },
    textAlign: "right",
  },
  {
    key: "stealth",
    label: { en: "Stealth", it: "Furtività" },
  },
  {
    icon: WandIcon,
    key: "magic",
    label: { en: "🪄", it: "🪄" },
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
// Parse Form Data
//------------------------------------------------------------------------------

function parseFormData(
  data: Partial<ArmorEditorFormFields>,
):
  | { resource: Partial<DBArmor>; translation: Partial<DBArmorTranslation> }
  | string {
  const maybeArmor = {
    armor_class_max_cha_modifier:
      data.armor_class_includes_cha_modifier ?
        data.armor_class_max_cha_modifier
      : null,
    armor_class_max_con_modifier:
      data.armor_class_includes_con_modifier ?
        data.armor_class_max_con_modifier
      : null,
    armor_class_max_dex_modifier:
      data.armor_class_includes_dex_modifier ?
        data.armor_class_max_dex_modifier
      : null,
    armor_class_max_int_modifier:
      data.armor_class_includes_int_modifier ?
        data.armor_class_max_int_modifier
      : null,
    armor_class_max_str_modifier:
      data.armor_class_includes_str_modifier ?
        data.armor_class_max_str_modifier
      : null,
    armor_class_max_wis_modifier:
      data.armor_class_includes_wis_modifier ?
        data.armor_class_max_wis_modifier
      : null,
    armor_class_modifier: data.armor_class_modifier,
    base_armor_class: data.base_armor_class,
    cost: data.cost,
    disadvantage_on_stealth: data.disadvantage_on_stealth,
    required_cha: data.required_cha,
    required_con: data.required_con,
    required_dex: data.required_dex,
    required_int: data.required_int,
    required_str: data.required_str,
    required_wis: data.required_wis,
    type: data.type,
    visibility: data.visibility,
    weight: data.weight,
  };

  const maybeTranslation = {
    name: data.name,
    notes: data.notes,
    page: data.page || null,
  };

  const armor = dbArmorSchema.partial().safeParse(maybeArmor);
  if (!armor.success) return report(armor.error, "form.error.invalid");

  const translation = dbArmorTranslationSchema
    .partial()
    .safeParse(maybeTranslation);
  if (!translation.success)
    return report(translation.error, "form.error.invalid_translation");

  return { resource: armor.data, translation: translation.data };
}

//------------------------------------------------------------------------------
// Armors Panel
//------------------------------------------------------------------------------

const ArmorsPanel = createResourcesPanel({
  Card: ArmorCard,
  EditorContent: ArmorEditor,
  Filters: ArmorsFilters,
  defaultResource: defaultArmor,
  form: armorEditorForm,
  listTableColumns: columns,
  listTableDescriptionKey: "description",
  name: { en: "armors", it: "armi" },
  parseFormData,
  store: armorsStore,
});

export default ArmorsPanel;
