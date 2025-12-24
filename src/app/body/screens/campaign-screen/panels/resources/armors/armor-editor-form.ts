import { z } from "zod";
import { armorTypeSchema } from "~/models/types/armor-type";
import { campaignRoleSchema } from "~/models/types/campaign-role";
import { createForm } from "~/utils/form";

//------------------------------------------------------------------------------
// Armor Editor Form Fields
//------------------------------------------------------------------------------

export const armorEditorFormFieldsSchema = z.object({
  armor_class_includes_cha_modifier: z.boolean(),
  armor_class_includes_con_modifier: z.boolean(),
  armor_class_includes_dex_modifier: z.boolean(),
  armor_class_includes_int_modifier: z.boolean(),
  armor_class_includes_str_modifier: z.boolean(),
  armor_class_includes_wis_modifier: z.boolean(),
  armor_class_max_cha_modifier: z.number(),
  armor_class_max_con_modifier: z.number(),
  armor_class_max_dex_modifier: z.number(),
  armor_class_max_int_modifier: z.number(),
  armor_class_max_str_modifier: z.number(),
  armor_class_max_wis_modifier: z.number(),
  armor_class_modifier: z.number(),
  base_armor_class: z.number(),
  cost: z.number(),
  disadvantage_on_stealth: z.boolean(),
  name: z.string(),
  notes: z.string(),
  page: z.number(),
  required_cha: z.number(),
  required_con: z.number(),
  required_dex: z.number(),
  required_int: z.number(),
  required_str: z.number(),
  required_wis: z.number(),
  type: armorTypeSchema,
  visibility: campaignRoleSchema,
  weight: z.number(),
});

export type ArmorEditorFormFields = z.infer<typeof armorEditorFormFieldsSchema>;

//------------------------------------------------------------------------------
// Armor Editor Form
//------------------------------------------------------------------------------

export const armorEditorForm = createForm(
  "armor_editor",
  armorEditorFormFieldsSchema.parse,
);

export const { useField: useArmorEditorFormField } = armorEditorForm;

export default armorEditorForm;

//------------------------------------------------------------------------------
// Armor Class Includes <Ability> Modifier
//------------------------------------------------------------------------------

export const useArmorEditorFormArmorClassIncludesChaModifier = (
  defaultArmorClassIncludesChaModifier: ArmorEditorFormFields["armor_class_includes_cha_modifier"],
) =>
  useArmorEditorFormField(
    "armor_class_includes_cha_modifier",
    defaultArmorClassIncludesChaModifier,
  );

export const useArmorEditorFormArmorClassIncludesConModifier = (
  defaultArmorClassIncludesConModifier: ArmorEditorFormFields["armor_class_includes_con_modifier"],
) =>
  useArmorEditorFormField(
    "armor_class_includes_con_modifier",
    defaultArmorClassIncludesConModifier,
  );

export const useArmorEditorFormArmorClassIncludesDexModifier = (
  defaultArmorClassIncludesDexModifier: ArmorEditorFormFields["armor_class_includes_dex_modifier"],
) =>
  useArmorEditorFormField(
    "armor_class_includes_dex_modifier",
    defaultArmorClassIncludesDexModifier,
  );

export const useArmorEditorFormArmorClassIncludesIntModifier = (
  defaultArmorClassIncludesIntModifier: ArmorEditorFormFields["armor_class_includes_int_modifier"],
) =>
  useArmorEditorFormField(
    "armor_class_includes_int_modifier",
    defaultArmorClassIncludesIntModifier,
  );

export const useArmorEditorFormArmorClassIncludesStrModifier = (
  defaultArmorClassIncludesStrModifier: ArmorEditorFormFields["armor_class_includes_str_modifier"],
) =>
  useArmorEditorFormField(
    "armor_class_includes_str_modifier",
    defaultArmorClassIncludesStrModifier,
  );

export const useArmorEditorFormArmorClassIncludesWisModifier = (
  defaultArmorClassIncludesWisModifier: ArmorEditorFormFields["armor_class_includes_wis_modifier"],
) =>
  useArmorEditorFormField(
    "armor_class_includes_wis_modifier",
    defaultArmorClassIncludesWisModifier,
  );

//------------------------------------------------------------------------------
// Armor Class Max <Ability> Modifier
//------------------------------------------------------------------------------

export const useArmorEditorFormArmorClassMaxChaModifier = (
  defaultArmorClassMaxChaModifier: ArmorEditorFormFields["armor_class_max_cha_modifier"],
) =>
  useArmorEditorFormField(
    "armor_class_max_cha_modifier",
    defaultArmorClassMaxChaModifier,
  );

export const useArmorEditorFormArmorClassMaxConModifier = (
  defaultArmorClassMaxConModifier: ArmorEditorFormFields["armor_class_max_con_modifier"],
) =>
  useArmorEditorFormField(
    "armor_class_max_con_modifier",
    defaultArmorClassMaxConModifier,
  );

export const useArmorEditorFormArmorClassMaxDexModifier = (
  defaultArmorClassMaxDexModifier: ArmorEditorFormFields["armor_class_max_dex_modifier"],
) =>
  useArmorEditorFormField(
    "armor_class_max_dex_modifier",
    defaultArmorClassMaxDexModifier,
  );

export const useArmorEditorFormArmorClassMaxIntModifier = (
  defaultArmorClassMaxIntModifier: ArmorEditorFormFields["armor_class_max_int_modifier"],
) =>
  useArmorEditorFormField(
    "armor_class_max_int_modifier",
    defaultArmorClassMaxIntModifier,
  );

export const useArmorEditorFormArmorClassMaxStrModifier = (
  defaultArmorClassMaxStrModifier: ArmorEditorFormFields["armor_class_max_str_modifier"],
) =>
  useArmorEditorFormField(
    "armor_class_max_str_modifier",
    defaultArmorClassMaxStrModifier,
  );

export const useArmorEditorFormArmorClassMaxWisModifier = (
  defaultArmorClassMaxWisModifier: ArmorEditorFormFields["armor_class_max_wis_modifier"],
) =>
  useArmorEditorFormField(
    "armor_class_max_wis_modifier",
    defaultArmorClassMaxWisModifier,
  );

//------------------------------------------------------------------------------
// Armor Class Modifier
//------------------------------------------------------------------------------

export const useArmorEditorFormArmorClassModifier = (
  defaultArmorClassModifier: ArmorEditorFormFields["armor_class_modifier"],
) => useArmorEditorFormField("armor_class_modifier", defaultArmorClassModifier);

//------------------------------------------------------------------------------
// Base Armor Class
//------------------------------------------------------------------------------

export const useArmorEditorFormBaseArmorClass = (
  defaultBaseArmorClass: ArmorEditorFormFields["base_armor_class"],
) => useArmorEditorFormField("base_armor_class", defaultBaseArmorClass);

//------------------------------------------------------------------------------
// Cost
//------------------------------------------------------------------------------

export const useArmorEditorFormCost = (
  defaultCost: ArmorEditorFormFields["cost"],
) => useArmorEditorFormField("cost", defaultCost);

//------------------------------------------------------------------------------
// Disadvantage on Stealth
//------------------------------------------------------------------------------

export const useArmorEditorFormDisadvantageOnStealth = (
  defaultDisadvantageOnStealth: ArmorEditorFormFields["disadvantage_on_stealth"],
) =>
  useArmorEditorFormField(
    "disadvantage_on_stealth",
    defaultDisadvantageOnStealth,
  );

//------------------------------------------------------------------------------
// Name
//------------------------------------------------------------------------------

function validateName(name: string) {
  return name ? undefined : "name.error.empty";
}

export const useArmorEditorFormName = (
  defaultName: ArmorEditorFormFields["name"],
) => useArmorEditorFormField("name", defaultName, validateName);

//------------------------------------------------------------------------------
// Notes
//------------------------------------------------------------------------------

export const useArmorEditorFormNotes = (
  defaultNotes: ArmorEditorFormFields["notes"],
) => useArmorEditorFormField("notes", defaultNotes);

//------------------------------------------------------------------------------
// Page
//------------------------------------------------------------------------------

export const useArmorEditorFormPage = (
  defaultPage: ArmorEditorFormFields["page"],
) => useArmorEditorFormField("page", defaultPage);

//------------------------------------------------------------------------------
// Required <Ability>
//------------------------------------------------------------------------------

export const useArmorEditorFormRequiredCha = (
  defaultRequiredCha: ArmorEditorFormFields["required_cha"],
) => useArmorEditorFormField("required_cha", defaultRequiredCha);

export const useArmorEditorFormRequiredCon = (
  defaultRequiredCon: ArmorEditorFormFields["required_con"],
) => useArmorEditorFormField("required_con", defaultRequiredCon);

export const useArmorEditorFormRequiredDex = (
  defaultRequiredDex: ArmorEditorFormFields["required_dex"],
) => useArmorEditorFormField("required_dex", defaultRequiredDex);

export const useArmorEditorFormRequiredInt = (
  defaultRequiredInt: ArmorEditorFormFields["required_int"],
) => useArmorEditorFormField("required_int", defaultRequiredInt);

export const useArmorEditorFormRequiredStr = (
  defaultRequiredStr: ArmorEditorFormFields["required_str"],
) => useArmorEditorFormField("required_str", defaultRequiredStr);

export const useArmorEditorFormRequiredWis = (
  defaultRequiredWis: ArmorEditorFormFields["required_wis"],
) => useArmorEditorFormField("required_wis", defaultRequiredWis);

//------------------------------------------------------------------------------
// Type
//------------------------------------------------------------------------------

export const useArmorEditorFormType = (
  defaultType: ArmorEditorFormFields["type"],
) => useArmorEditorFormField("type", defaultType);

//------------------------------------------------------------------------------
// Visibility
//------------------------------------------------------------------------------

export const useArmorEditorFormVisibility = (
  defaultVisibility: ArmorEditorFormFields["visibility"],
) => useArmorEditorFormField("visibility", defaultVisibility);

//------------------------------------------------------------------------------
// Weight
//------------------------------------------------------------------------------

export const useArmorEditorFormWeight = (
  defaultWeight: ArmorEditorFormFields["weight"],
) => useArmorEditorFormField("weight", defaultWeight);
