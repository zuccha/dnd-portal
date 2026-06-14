import type { LocalizedSpell } from "~/models/resources/spells/localized-spell";

//------------------------------------------------------------------------------
// Fireball
//------------------------------------------------------------------------------

const fireball: Record<string, LocalizedSpell> = {
  en: {
    _raw: {
      id: "43e42b00-7f98-4d8e-afc9-03d9ca248cc8",
      image_url: null,
      name: { en: "Fireball", it: "Palla di Fuoco" },
      name_short: { en: "", it: "" },
      page: { en: 131 },
      source_code: "SRD24",
      source_id: "3bfdf6f7-780e-4d78-8db5-b0d5d05ab6f6",
      source_version: "dnd5_5",
      visibility: "public",

      casting_time: "action",
      casting_time_value: null,
      character_class_ids: [
        "1d67243f-0071-41c0-91f3-53f8354c6628",
        "d44c8332-db11-4da9-85de-46c3ebd23e6d",
      ],
      concentration: false,
      description: {
        en: "A bright streak flashes from you to a point you choose within range and then blossoms with a low roar into a fiery explosion. Each creature in a 20-foot-radius Sphere centered on that point makes a Dexterity saving throw, taking 8d6 Fire damage on a failed save or half as much damage on a successful one.\nFlammable objects in the area that aren't being worn or carried start burning.",
      },
      duration: "instantaneous",
      duration_value: null,
      level: 3,
      material: true,
      materials: {
        en: "A ball of bat guano and sulfur",
      },
      range: "value",
      range_value: 4500,
      ritual: false,
      school: "evocation",
      somatic: true,
      upgrade: {
        en: "The damage increases by 1d6 for each spell slot level above 3.",
      },
      verbal: true,
    },
    descriptor: "Level 3 Evocation",
    details:
      "A bright streak flashes from you to a point you choose within range and then blossoms with a low roar into a fiery explosion. Each creature in a 20-foot-radius Sphere centered on that point makes a Dexterity saving throw, taking 8d6 Fire damage on a failed save or half as much damage on a successful one.\nFlammable objects in the area that aren't being worn or carried start burning.\n\n##At Higher Levels##\rThe damage increases by 1d6 for each spell slot level above 3.",
    id: "43e42b00-7f98-4d8e-afc9-03d9ca248cc8",
    name: "Fireball",
    page: "131",
    source: "SRD24",
    sourceVersion: "D&D 5.5",

    casting_time: "Action",
    casting_time_with_ritual: "Action",
    character_classes: "Sor. Wiz.",
    components: "V, S, M",
    concentration: false,
    duration: "Instantaneous",
    duration_with_concentration: "Instantaneous",
    info: "**Materials** A ball of bat guano and sulfur",
    level: "3",
    level_long: "Level 3",
    materials: "A ball of bat guano and sulfur",
    range: "45 m",
    ritual: false,
    school: "Evocation",
  },
  it: {
    _raw: {
      id: "43e42b00-7f98-4d8e-afc9-03d9ca248cc8",
      image_url: null,
      name: { en: "Fireball", it: "Palla di Fuoco" },
      name_short: { en: "", it: "" },
      page: { it: 171 },
      source_code: "PHB24",
      source_id: "3bfdf6f7-780e-4d78-8db5-b0d5d05ab6f6",
      source_version: "dnd5_5",
      visibility: "public",

      casting_time: "action",
      casting_time_value: null,
      character_class_ids: [
        "1d67243f-0071-41c0-91f3-53f8354c6628",
        "d44c8332-db11-4da9-85de-46c3ebd23e6d",
      ],
      concentration: false,
      description: {
        it: "Una scia di luce brillante parte dall'incantatore e sfreccia fino a un punto a sua scelta entro gittata, provocando un'esplosione infuocata con un profondo boato. Ogni creatura presente in una sfera dal raggio di 6 metri e centrata su quel punto deve effettuare un tiro salvezza su Destrezza, subendo 8d6 danni da fuoco in caso di fallimento, o la metà dei danni in caso di successo.\nGli oggetti infiammabili nell'area che non sono indossati o trasportati iniziano a bruciare.",
      },
      duration: "instantaneous",
      duration_value: null,
      level: 3,
      material: true,
      materials: {
        it: "Una pallina di guano di pipistrello e zolfo",
      },
      range: "value",
      range_value: 4500,
      ritual: false,
      school: "evocation",
      somatic: true,
      upgrade: {
        it: "I danni aumentano di 1d6 per ogni slot di livello superiore al 3°.",
      },
      verbal: true,
    },
    descriptor: "Invocazione di 3° livello",
    details:
      "Una scia di luce brillante parte dall'incantatore e sfreccia fino a un punto a sua scelta entro gittata, provocando un'esplosione infuocata con un profondo boato. Ogni creatura presente in una sfera dal raggio di 6 metri e centrata su quel punto deve effettuare un tiro salvezza su Destrezza, subendo 8d6 danni da fuoco in caso di fallimento, o la metà dei danni in caso di successo.\nGli oggetti infiammabili nell'area che non sono indossati o trasportati iniziano a bruciare.\n\n##A Livelli Superiori##\rI danni aumentano di 1d6 per ogni slot di livello superiore al 3°.",
    id: "43e42b00-7f98-4d8e-afc9-03d9ca248cc8",
    name: "Palla di Fuoco",
    page: "171",
    source: "SRD24",
    sourceVersion: "D&D 5.5",

    casting_time: "Azione",
    casting_time_with_ritual: "Azione",
    character_classes: "Mag. Str.",
    components: "V, S, M",
    concentration: false,
    duration: "Istantaneo",
    duration_with_concentration: "Istantaneo",
    info: "**Materiali** Una pallina di guano di pipistrello e zolfo",
    level: "3",
    level_long: "Livello 3",
    materials: "Una pallina di guano di pipistrello e zolfo",
    range: "45 m",
    ritual: false,
    school: "Invocazione",
  },
};

export default fireball;
