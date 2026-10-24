import type { LocalizedSpell } from "~/models/resources/spells/localized-spell";

//------------------------------------------------------------------------------
// Fireball
//------------------------------------------------------------------------------

const fireball: Record<string, LocalizedSpell> = {
  en: {
    descriptor: "Level 3 Evocation",
    description:
      "A bright streak flashes from you to a point you choose within range and then blossoms with a low roar into a fiery explosion. Each creature in a 20-foot-radius Sphere centered on that point makes a Dexterity saving throw, taking 8d6 Fire damage on a failed save or half as much damage on a successful one.\nFlammable objects in the area that aren't being worn or carried start burning.\n##At Higher Levels##\rThe damage increases by 1d6 for each spell slot level above 3.",
    id: "43e42b00-7f98-4d8e-afc9-03d9ca248cc8",
    image_url: null,
    kind: "spell",
    name: "Fireball",
    page: "131",
    source_code: "SRD24",
    source_id: "3bfdf6f7-780e-4d78-8db5-b0d5d05ab6f6",
    source_version: "D&D 5.5",
    is_virtual: false,
    visibility: "public",

    casting_time: {
      label: "Casting",
      value: "Action",
      value_with_ritual: "Action",
    },
    character_class_abbreviations: "Sor. Wiz.",
    character_classes: [],
    character_classes_label: "Classes",
    components: {
      label: "Components",
      value: "V, S, M",
    },
    concentration: false,
    emphasize_casting_time: false,
    duration: {
      label: "Duration",
      value: "Instantaneous",
      value_with_concentration: "Instantaneous",
    },
    level: "3",
    materials: {
      label: "Materials",
      value: "A ball of bat guano and sulfur",
    },
    range: {
      label: "Range",
      value: "45 m",
    },
    ritual: false,
    school: "Evocation",
  },
  it: {
    descriptor: "Invocazione di 3° livello",
    description:
      "Una scia di luce brillante parte dall'incantatore e sfreccia fino a un punto a sua scelta entro gittata, provocando un'esplosione infuocata con un profondo boato. Ogni creatura presente in una sfera dal raggio di 6 metri e centrata su quel punto deve effettuare un tiro salvezza su Destrezza, subendo 8d6 danni da fuoco in caso di fallimento, o la metà dei danni in caso di successo.\nGli oggetti infiammabili nell'area che non sono indossati o trasportati iniziano a bruciare.\n##A Livelli Superiori##\rI danni aumentano di 1d6 per ogni slot di livello superiore al 3°.",
    id: "43e42b00-7f98-4d8e-afc9-03d9ca248cc8",
    image_url: null,
    kind: "spell",
    name: "Palla di Fuoco",
    page: "171",
    source_code: "SRD24",
    source_id: "3bfdf6f7-780e-4d78-8db5-b0d5d05ab6f6",
    source_version: "D&D 5.5",
    is_virtual: false,
    visibility: "public",

    casting_time: {
      label: "Lancio",
      value: "Azione",
      value_with_ritual: "Azione",
    },
    character_class_abbreviations: "Mag. Str.",
    character_classes: [],
    character_classes_label: "Classi",
    components: {
      label: "Componenti",
      value: "V, S, M",
    },
    concentration: false,
    emphasize_casting_time: false,
    duration: {
      label: "Durata",
      value: "Istantaneo",
      value_with_concentration: "Istantaneo",
    },
    level: "3",
    materials: {
      label: "Materiali",
      value: "Una pallina di guano di pipistrello e zolfo",
    },
    range: {
      label: "Gittata",
      value: "45 m",
    },
    ritual: false,
    school: "Invocazione",
  },
};

export default fireball;
