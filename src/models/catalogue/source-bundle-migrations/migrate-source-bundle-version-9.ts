//------------------------------------------------------------------------------
// Raw Record
//------------------------------------------------------------------------------

type RawRecord = Record<string, unknown>;

//------------------------------------------------------------------------------
// Is Record
//------------------------------------------------------------------------------

function isRecord(value: unknown): value is RawRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

//------------------------------------------------------------------------------
// Rename Fields
//------------------------------------------------------------------------------

function renameFields(record: RawRecord, fields: Record<string, string>): void {
  for (const [oldName, newName] of Object.entries(fields)) {
    if (!(newName in record) && oldName in record) record[newName] = record[oldName];
    delete record[oldName];
  }
}

//------------------------------------------------------------------------------
// Migrate Source Bundle Version 9
//------------------------------------------------------------------------------

export function migrateSourceBundleVersion9(bundle: RawRecord): RawRecord {
  const resources = bundle["resources"];
  if (!isRecord(resources)) return bundle;

  for (const value of Object.values(resources)) {
    if (!Array.isArray(value)) continue;
    for (const resource of value) {
      if (isRecord(resource)) renameFields(resource, { virtual: "is_virtual" });
    }
  }

  const resourceFieldsByKey: Record<string, Record<string, string>> = {
    armors: {
      disadvantage_on_stealth: "imposes_stealth_disadvantage",
      magic: "is_magic",
      notes: "description",
    },
    character_classes: {
      hp_die: "hit_point_die",
    },
    creatures: {
      ac: "armor_class",
      armor_class_adds_spell_level: "adds_spell_level_to_armor_class",
      cr: "challenge_rating",
      exp: "experience_points",
      hp: "hit_points",
      hp_formula: "hit_points_formula",
      hover: "can_hover",
      lair_exp: "lair_experience_points",
      pb: "proficiency_bonus",
      summoned_from_spell: "is_summoned_from_spell",
    },
    eldritch_invocations: {
      min_warlock_level: "minimum_warlock_level",
    },
    feats: {
      min_level: "minimum_level",
    },
    armor_modifiers: {
      make_magic: "makes_equipment_magic",
      notes_delta: "description_delta",
    },
    item_modifiers: {
      make_magic: "makes_equipment_magic",
      notes_delta: "description_delta",
    },
    items: {
      consumable: "is_consumable",
      magic: "is_magic",
      notes: "description",
    },
    spells: {
      concentration: "has_concentration",
      material: "is_material",
      ritual: "has_ritual",
      somatic: "is_somatic",
      verbal: "is_verbal",
    },
    tool_modifiers: {
      make_magic: "makes_equipment_magic",
      notes_delta: "description_delta",
    },
    tools: {
      magic: "is_magic",
      notes: "description",
    },
    vehicles: {
      ac: "armor_class",
      hp: "hit_points",
    },
    weapon_modifiers: {
      make_magic: "makes_equipment_magic",
      notes_delta: "description_delta",
    },
    weapons: {
      magic: "is_magic",
      melee: "is_melee",
      notes: "description",
      ranged: "is_ranged",
    },
  };

  for (const [key, fields] of Object.entries(resourceFieldsByKey)) {
    const values = resources[key];
    if (!Array.isArray(values)) continue;
    for (const resource of values) {
      if (isRecord(resource)) renameFields(resource, fields);
    }
  }

  const relations = bundle["relations"];
  if (isRecord(relations)) {
    for (const value of Object.values(relations)) {
      if (!Array.isArray(value)) continue;
      for (const relation of value) {
        if (isRecord(relation)) renameFields(relation, { min_level: "minimum_level" });
      }
    }
  }

  return { ...bundle, bundle_version: 10 };
}
