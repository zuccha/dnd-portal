import type { LocalizedSpell } from "~/models/resources/spells/localized-spell";

//------------------------------------------------------------------------------
// Fireball
//------------------------------------------------------------------------------

const fireball: Record<string, LocalizedSpell> = {
  en: {
    descriptor: "Level 3 Evocation",
    details:
      "A bright streak flashes from you to a point you choose within range and then blossoms with a low roar into a fiery explosion. Each creature in a 20-foot-radius Sphere centered on that point makes a Dexterity saving throw, taking 8d6 Fire damage on a failed save or half as much damage on a successful one.\nFlammable objects in the area that aren't being worn or carried start burning.\n\n##At Higher Levels##\rThe damage increases by 1d6 for each spell slot level above 3.",
    id: "43e42b00-7f98-4d8e-afc9-03d9ca248cc8",
    imageUrl: null,
    kind: "spell",
    name: "Fireball",
    page: "131",
    sourceCode: "SRD24",
    sourceId: "3bfdf6f7-780e-4d78-8db5-b0d5d05ab6f6",
    sourceVersion: "D&D 5.5",
    virtual: false,
    visibility: "public",

    castingTime: {
      label: "Casting",
      value: "Action",
      valueWithRitual: "Action",
    },
    characterClassAbbreviations: "Sor. Wiz.",
    characterClasses: [],
    characterClassesLabel: "Classes",
    components: {
      label: "Components",
      value: "V, S, M",
    },
    concentration: false,
    emphasizeCastingTime: false,
    duration: {
      label: "Duration",
      value: "Instantaneous",
      valueWithConcentration: "Instantaneous",
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
    details:
      "Una scia di luce brillante parte dall'incantatore e sfreccia fino a un punto a sua scelta entro gittata, provocando un'esplosione infuocata con un profondo boato. Ogni creatura presente in una sfera dal raggio di 6 metri e centrata su quel punto deve effettuare un tiro salvezza su Destrezza, subendo 8d6 danni da fuoco in caso di fallimento, o la metà dei danni in caso di successo.\nGli oggetti infiammabili nell'area che non sono indossati o trasportati iniziano a bruciare.\n\n##A Livelli Superiori##\rI danni aumentano di 1d6 per ogni slot di livello superiore al 3°.",
    id: "43e42b00-7f98-4d8e-afc9-03d9ca248cc8",
    imageUrl: null,
    kind: "spell",
    name: "Palla di Fuoco",
    page: "171",
    sourceCode: "SRD24",
    sourceId: "3bfdf6f7-780e-4d78-8db5-b0d5d05ab6f6",
    sourceVersion: "D&D 5.5",
    virtual: false,
    visibility: "public",

    castingTime: {
      label: "Lancio",
      value: "Azione",
      valueWithRitual: "Azione",
    },
    characterClassAbbreviations: "Mag. Str.",
    characterClasses: [],
    characterClassesLabel: "Classi",
    components: {
      label: "Componenti",
      value: "V, S, M",
    },
    concentration: false,
    emphasizeCastingTime: false,
    duration: {
      label: "Durata",
      value: "Istantaneo",
      valueWithConcentration: "Istantaneo",
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
