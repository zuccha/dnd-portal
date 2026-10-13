import { weaponSchema } from "~/models/resources/equipment/weapons/weapon";

//------------------------------------------------------------------------------
// Light Crossbow
//------------------------------------------------------------------------------

const lightCrossbow = weaponSchema.parse({
  id: "b2c31ea7-3174-49b1-8700-183f9ded0152",
  kind: "weapon",
  source_code: "PHB24",
  source_id: "14e87a9e-37d6-4589-b369-72416d093449",
  source_version: "dnd5_5",
  image_url:
    "https://gvgzmzuwbecnjeeuxtbw.supabase.co/storage/v1/object/public/resource-assets/images/weapons/light-crossbow.webp",
  visibility: "public",
  name: { en: "Light Crossbow", it: "Balestra Leggera" },
  page: { en: 215, it: 215 },
  attunement_notes: { en: null, it: null },
  cost: 2500,
  feature_entries: [],
  magic: false,
  modifier_ids: [],
  notes: { en: "", it: "" },
  rarity: "common",
  required_attunement_slots: 0,
  variant_modifier_ids: [],
  weight: 2500,
  ammunition_ids: ["06653ae8-374a-4624-b7bc-2b3511e0a562"],
  damage: "1d8",
  damage_type: "piercing",
  damage_versatile: null,
  mastery: "slow",
  melee: false,
  properties: ["ammunition", "two-handed", "loading"],
  range_long: 9600,
  range_short: 2400,
  ranged: true,
  type: "simple",
});

export default lightCrossbow;
