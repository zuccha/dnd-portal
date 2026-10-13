type RawRecord = Record<string, unknown>;

const featureGrantorCollectionByKind = {
  armor: "armors",
  character_class: "character_classes",
  character_subclass: "character_subclasses",
  feat: "feats",
  item: "items",
  species: "species",
  tool: "tools",
  weapon: "weapons",
} as const;

const featureRelationGroupByKind = {
  armor: "equipments_and_features",
  character_class: "character_classes_and_features",
  character_subclass: "character_subclasses_and_features",
  feat: "feats_and_features",
  item: "equipments_and_features",
  species: "species_and_features",
  tool: "equipments_and_features",
  weapon: "equipments_and_features",
} as const;

type FeatureGrantorKind = keyof typeof featureGrantorCollectionByKind;
type FeatureRelationGroup = (typeof featureRelationGroupByKind)[FeatureGrantorKind];

//------------------------------------------------------------------------------
// Is Record
//------------------------------------------------------------------------------

function isRecord(value: unknown): value is RawRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

//------------------------------------------------------------------------------
// Get Resource Collection
//------------------------------------------------------------------------------

function getCollection(resources: RawRecord, key: string): RawRecord[] {
  const collection = resources[key];
  if (!Array.isArray(collection)) return [];
  return collection.filter(isRecord);
}

//------------------------------------------------------------------------------
// Read Legacy Relation Entries
//------------------------------------------------------------------------------

function getEntries(resource: RawRecord, key: string): RawRecord[] {
  const entries = resource[key];
  if (!Array.isArray(entries)) return [];
  return entries.filter(isRecord);
}

//------------------------------------------------------------------------------
// Get Legacy Id List
//------------------------------------------------------------------------------

function getLegacyIdList(resource: RawRecord, key: string): string[] {
  const ids = resource[key];
  if (!Array.isArray(ids)) return [];
  return ids.filter((id): id is string => typeof id === "string" && id.length > 0);
}

//------------------------------------------------------------------------------
// Get Required String
//------------------------------------------------------------------------------

function getRequiredString(value: unknown, label: string): string {
  if (typeof value !== "string" || !value) {
    throw new Error(`Cannot migrate source bundle relation: missing ${label}`);
  }
  return value;
}

//------------------------------------------------------------------------------
// Is Feature Grantor Kind
//------------------------------------------------------------------------------

function isFeatureGrantorKind(value: string): value is FeatureGrantorKind {
  return Object.hasOwn(featureGrantorCollectionByKind, value);
}

//------------------------------------------------------------------------------
// Migrate Source Bundle Version 6
//------------------------------------------------------------------------------

export function migrateSourceBundleVersion6(bundle: RawRecord): RawRecord {
  const resources = bundle["resources"];
  if (!isRecord(resources))
    throw new Error("Cannot migrate source bundle relations: missing resources");

  const characterClassSpellRelations = new Map<string, RawRecord>();

  for (const characterClass of getCollection(resources, "character_classes")) {
    const classId = getRequiredString(characterClass["id"], "character class id");
    for (const [index, id] of getLegacyIdList(characterClass, "spell_ids").entries()) {
      const key = `${classId}:${id}`;
      const relation = characterClassSpellRelations.get(key) ?? {
        resource_1_id: classId,
        resource_1_kind: "character_class",
        resource_1_position: index,
        resource_2_id: id,
        resource_2_kind: "spell",
        resource_2_position: 0,
      };
      relation["resource_1_position"] = index;
      characterClassSpellRelations.set(key, relation);
    }
  }

  for (const spell of getCollection(resources, "spells")) {
    const spellId = getRequiredString(spell["id"], "spell id");
    for (const [index, id] of getLegacyIdList(spell, "character_class_ids").entries()) {
      const key = `${id}:${spellId}`;
      const relation = characterClassSpellRelations.get(key) ?? {
        resource_1_id: id,
        resource_1_kind: "character_class",
        resource_1_position: 0,
        resource_2_id: spellId,
        resource_2_kind: "spell",
        resource_2_position: index,
      };
      relation["resource_2_position"] = index;
      characterClassSpellRelations.set(key, relation);
    }
    delete spell["character_class_ids"];
  }

  for (const characterClass of getCollection(resources, "character_classes")) {
    delete characterClass["spell_ids"];
  }

  const featureRelations = new Map<FeatureRelationGroup, Map<string, RawRecord>>();
  const featureGrantorKindById = new Map<string, FeatureGrantorKind>();

  for (const [kind, collection] of Object.entries(featureGrantorCollectionByKind) as [
    FeatureGrantorKind,
    string,
  ][]) {
    for (const grantor of getCollection(resources, collection)) {
      featureGrantorKindById.set(getRequiredString(grantor["id"], `${kind} id`), kind);
    }
  }

  //------------------------------------------------------------------------------
  // Add Feature Relation
  //------------------------------------------------------------------------------
  function addFeatureRelation(
    kind: FeatureGrantorKind,
    grantorId: string,
    grantorPosition: number,
    featureId: string,
    featurePosition: number,
    minLevel: unknown,
  ): void {
    const group = featureRelationGroupByKind[kind];
    let rows = featureRelations.get(group);
    if (!rows) {
      rows = new Map();
      featureRelations.set(group, rows);
    }

    const level = typeof minLevel === "number" ? minLevel : 0;
    const key = `${kind}:${grantorId}:${featureId}:${level}`;
    const existing = rows.get(key);

    rows.set(key, {
      resource_1_id: grantorId,
      resource_1_kind: kind,
      resource_1_position: existing?.["resource_1_position"] ?? grantorPosition,
      resource_2_id: featureId,
      resource_2_kind: "feature",
      resource_2_position: existing?.["resource_2_position"] ?? featurePosition,
      min_level: level,
    });
  }

  for (const [kind, collection] of Object.entries(featureGrantorCollectionByKind) as [
    FeatureGrantorKind,
    string,
  ][]) {
    for (const grantor of getCollection(resources, collection)) {
      const grantorId = getRequiredString(grantor["id"], `${kind} id`);
      for (const [index, entry] of getEntries(grantor, "feature_entries").entries()) {
        addFeatureRelation(
          kind,
          grantorId,
          index,
          getRequiredString(entry["id"], "feature id"),
          0,
          entry["min_level"],
        );
      }
      delete grantor["feature_entries"];
    }
  }

  for (const feature of getCollection(resources, "features")) {
    const featureId = getRequiredString(feature["id"], "feature id");
    for (const [index, grant] of getEntries(feature, "granted_by").entries()) {
      const grantorId = getRequiredString(grant["id"], "feature grantor id");
      const legacyKind = grant["kind"];
      const kind =
        typeof legacyKind === "string" && isFeatureGrantorKind(legacyKind)
          ? legacyKind
          : featureGrantorKindById.get(grantorId);
      if (!kind) {
        throw new Error(
          `Cannot migrate feature grant ${grantorId}:${featureId}: grantor kind is unavailable in this bundle`,
        );
      }
      addFeatureRelation(kind, grantorId, 0, featureId, index, grant["min_level"]);
    }
    delete feature["granted_by"];
  }

  return {
    ...bundle,
    bundle_version: 7,
    relations: {
      character_classes_and_spells: [...characterClassSpellRelations.values()],
      character_classes_and_features: [
        ...(featureRelations.get("character_classes_and_features")?.values() ?? []),
      ],
      character_subclasses_and_features: [
        ...(featureRelations.get("character_subclasses_and_features")?.values() ?? []),
      ],
      equipments_and_features: [
        ...(featureRelations.get("equipments_and_features")?.values() ?? []),
      ],
      feats_and_features: [...(featureRelations.get("feats_and_features")?.values() ?? [])],
      species_and_features: [...(featureRelations.get("species_and_features")?.values() ?? [])],
    },
  };
}
