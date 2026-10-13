import { itemSchema } from "~/models/resources/equipment/items/item";

//------------------------------------------------------------------------------
// Potion of Healing
//------------------------------------------------------------------------------

const healingPotion = itemSchema.parse({
  id: "66aef92e-51c1-47ef-86e4-047f07327fad",
  kind: "item",
  source_code: "PHB24",
  source_id: "14e87a9e-37d6-4589-b369-72416d093449",
  source_version: "dnd5_5",
  image_url:
    "https://gvgzmzuwbecnjeeuxtbw.supabase.co/storage/v1/object/public/resource-assets/images/items/potion-of-healing.webp",
  visibility: "public",
  name: { en: "Potion of Healing", it: "Pozione di Guarigione" },
  page: { en: 228, it: 227 },
  attunement_notes: { en: null, it: null },
  cost: 5000,
  feature_entries: [],
  magic: true,
  modifier_ids: [],
  notes: {
    en: "As a Bonus Action, you can drink it or administer it to another creature within 5 feet of yourself. The creature that drinks the magical red fluid in this vial regains 2d4 + 2 Hit Points.",
    it: "Come azione bonus, il personaggio può berne una o somministrarla a un'altra creatura entro 1,5 metri da sé. Chi beve il fluido magico rosso contenuto in questa fiala recupera 2d4 + 2 punti ferita.",
  },
  rarity: "common",
  required_attunement_slots: 0,
  variant_modifier_ids: [],
  weight: 250,
  charges: 1,
  consumable: true,
  type: "potion",
});

export default healingPotion;
