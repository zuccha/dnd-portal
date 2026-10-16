import { armorSchema } from "~/models/resources/equipment/armors/armor";

//------------------------------------------------------------------------------
// Breastplate
//------------------------------------------------------------------------------

const breastplate = armorSchema.parse({
  id: "149e9eae-f609-47df-830e-2f8c090fbc2a",
  kind: "armor",
  source_code: "PHB24",
  source_id: "14e87a9e-37d6-4589-b369-72416d093449",
  source_version: "dnd5_5",
  image_url:
    "https://gvgzmzuwbecnjeeuxtbw.supabase.co/storage/v1/object/public/resource-assets/images/armors/breastplate.webp",
  visibility: "public",
  name: { en: "Breastplate", it: "Corazza a Piastre" },
  page: { en: 219, it: 219 },
  attunement_notes: { en: null, it: null },
  cost: 20000,
  feature_entries: [],
  is_magic: false,
  modifier_ids: [],
  description: { en: "", it: "" },
  rarity: "common",
  required_attunement_slots: 0,
  variant_modifier_ids: [],
  weight: 10000,
  armor_class_max_cha_modifier: 0,
  armor_class_max_con_modifier: 0,
  armor_class_max_dex_modifier: 2,
  armor_class_max_int_modifier: 0,
  armor_class_max_str_modifier: 0,
  armor_class_max_wis_modifier: 0,
  armor_class_modifier: 0,
  base_armor_class: 14,
  imposes_stealth_disadvantage: false,
  required_cha: 0,
  required_con: 0,
  required_dex: 0,
  required_int: 0,
  required_str: 0,
  required_wis: 0,
  type: "medium",
});

export default breastplate;
