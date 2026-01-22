import z from "zod";
import { createForm } from "~/utils/form";
import { armorTypeSchema } from "../../../types/armor-type";
import {
  equipmentFormDataSchema,
  equipmentFormDataToDB,
} from "../equipment-form";
import { type DBArmor, type DBArmorTranslation } from "./db-armor";

//------------------------------------------------------------------------------
// Armor Form Data
//------------------------------------------------------------------------------

export const armorFormDataSchema = equipmentFormDataSchema.extend({
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
  disadvantage_on_stealth: z.boolean(),
  required_cha: z.number(),
  required_con: z.number(),
  required_dex: z.number(),
  required_int: z.number(),
  required_str: z.number(),
  required_wis: z.number(),
  type: armorTypeSchema,
});

export type ArmorFormData = z.infer<typeof armorFormDataSchema>;

//------------------------------------------------------------------------------
// Armor Form Data To DB
//------------------------------------------------------------------------------

export function armorFormDataToDB(data: Partial<ArmorFormData>): {
  resource: Partial<DBArmor>;
  translation: Partial<DBArmorTranslation>;
} {
  const { resource, translation } = equipmentFormDataToDB(data);

  return {
    resource: {
      ...resource,
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
      disadvantage_on_stealth: data.disadvantage_on_stealth,
      required_cha: data.required_cha,
      required_con: data.required_con,
      required_dex: data.required_dex,
      required_int: data.required_int,
      required_str: data.required_str,
      required_wis: data.required_wis,
      type: data.type,
    },
    translation: {
      ...translation,
    },
  };
}

//------------------------------------------------------------------------------
// Armor Form
//------------------------------------------------------------------------------

export const armorForm = createForm("armor", armorFormDataSchema.parse);
