import { z } from "zod";
import type { ResourceKind } from "../types/resource-kind";

//------------------------------------------------------------------------------
// Resource Relation
//------------------------------------------------------------------------------

export type ResourceRelation<K1 extends ResourceKind, K2 extends ResourceKind> = {
  resource_1_id: string;
  resource_1_kind: K1;
  resource_1_position: number;
  resource_2_id: string;
  resource_2_kind: K2;
  resource_2_position: number;
};

//------------------------------------------------------------------------------
// Feature Relation
//------------------------------------------------------------------------------

export type FeatureRelation<K extends ResourceKind> = ResourceRelation<K, "feature"> & {
  min_level: number;
};

//------------------------------------------------------------------------------
// Relation Group Rows
//------------------------------------------------------------------------------

export type RelationGroupRows = {
  character_classes_and_spells: ResourceRelation<"character_class", "spell">;
  creature_families_and_creature_habitats: ResourceRelation<"creature_family", "creature_habitat">;
  creature_families_and_creature_treasures: ResourceRelation<
    "creature_family",
    "creature_treasure"
  >;
  character_classes_and_features: FeatureRelation<"character_class">;
  character_subclasses_and_features: FeatureRelation<"character_subclass">;
  equipments_and_features: FeatureRelation<"armor" | "item" | "tool" | "weapon">;
  feats_and_features: FeatureRelation<"feat">;
  species_and_features: FeatureRelation<"species">;
};

//------------------------------------------------------------------------------
// Related Resource Group
//------------------------------------------------------------------------------

export type RelationGroup = keyof RelationGroupRows;

//------------------------------------------------------------------------------
// Related Entry
//------------------------------------------------------------------------------

type RelatedEntry<K extends ResourceKind> = { id: string; kind: K };

//------------------------------------------------------------------------------
// Feature Related Entry
//------------------------------------------------------------------------------

type FeatureRelatedEntry<K extends ResourceKind> = RelatedEntry<K> & { min_level: number };

//------------------------------------------------------------------------------
// Related Resource Entries By Kind
//------------------------------------------------------------------------------

export type RelatedResourceEntriesByKind = {
  armor: {
    features: FeatureRelatedEntry<"feature">;
  };
  armor_modifier: {};
  background: {};
  character_class: {
    features: FeatureRelatedEntry<"feature">;
    spells: RelatedEntry<"spell">;
  };
  character_subclass: {
    features: FeatureRelatedEntry<"feature">;
  };
  creature: {};
  creature_family: {
    habitats: RelatedEntry<"creature_habitat">;
    treasures: RelatedEntry<"creature_treasure">;
  };
  creature_habitat: {
    families: RelatedEntry<"creature_family">;
  };
  creature_tag: {};
  creature_treasure: {
    families: RelatedEntry<"creature_family">;
  };
  eldritch_invocation: {};
  feat: {
    features: FeatureRelatedEntry<"feature">;
  };
  feature: {
    character_classes: FeatureRelatedEntry<"character_class">;
    character_subclasses: FeatureRelatedEntry<"character_subclass">;
    equipments: FeatureRelatedEntry<"armor" | "item" | "tool" | "weapon">;
    feats: FeatureRelatedEntry<"feat">;
    species: FeatureRelatedEntry<"species">;
  };
  item: {
    features: FeatureRelatedEntry<"feature">;
  };
  item_modifier: {};
  language: {};
  maneuver: {};
  metamagic: {};
  plane: {};
  service: {};
  species: {
    features: FeatureRelatedEntry<"feature">;
  };
  spell: {
    character_classes: RelatedEntry<"character_class">;
  };
  tool: {
    features: FeatureRelatedEntry<"feature">;
  };
  tool_modifier: {};
  vehicle: {};
  weapon: {
    features: FeatureRelatedEntry<"feature">;
  };
  weapon_modifier: {};
};

//------------------------------------------------------------------------------
// Related Resource Name
//------------------------------------------------------------------------------

export type RelatedResourceName<K extends ResourceKind> =
  K extends keyof RelatedResourceEntriesByKind
    ? keyof RelatedResourceEntriesByKind[K] & string
    : never;

//------------------------------------------------------------------------------
// Related Resource Entry By Name
//------------------------------------------------------------------------------

export type RelatedResourceEntryByName<
  K extends ResourceKind,
  N extends RelatedResourceName<K>,
> = K extends keyof RelatedResourceEntriesByKind
  ? N extends keyof RelatedResourceEntriesByKind[K]
    ? RelatedResourceEntriesByKind[K][N]
    : never
  : never;

//------------------------------------------------------------------------------
// Related Resource Entries
//------------------------------------------------------------------------------

export type RelatedResourceEntries<K extends ResourceKind> = {
  [N in RelatedResourceName<K>]: RelatedResourceEntryByName<K, N>[];
};

//------------------------------------------------------------------------------
// Relation Group By Resource Kind
//------------------------------------------------------------------------------

export const relationGroupByResourceKind = {
  armor: {
    features: "equipments_and_features",
  },
  armor_modifier: {},
  background: {},
  character_class: {
    features: "character_classes_and_features",
    spells: "character_classes_and_spells",
  },
  character_subclass: {
    features: "character_subclasses_and_features",
  },
  creature: {},
  creature_family: {
    habitats: "creature_families_and_creature_habitats",
    treasures: "creature_families_and_creature_treasures",
  },
  creature_habitat: {
    families: "creature_families_and_creature_habitats",
  },
  creature_tag: {},
  creature_treasure: {
    families: "creature_families_and_creature_treasures",
  },
  eldritch_invocation: {},
  feat: {
    features: "feats_and_features",
  },
  feature: {
    character_classes: "character_classes_and_features",
    character_subclasses: "character_subclasses_and_features",
    equipments: "equipments_and_features",
    feats: "feats_and_features",
    species: "species_and_features",
  },
  item: { features: "equipments_and_features" },
  item_modifier: {},
  language: {},
  maneuver: {},
  metamagic: {},
  plane: {},
  service: {},
  species: {
    features: "species_and_features",
  },
  spell: {
    character_classes: "character_classes_and_spells",
  },
  tool: {
    features: "equipments_and_features",
  },
  tool_modifier: {},
  vehicle: {},
  weapon: {
    features: "equipments_and_features",
  },
  weapon_modifier: {},
} as const satisfies {
  [K in ResourceKind]: Record<RelatedResourceName<K>, RelationGroup>;
};

//------------------------------------------------------------------------------
// Get Relation Group
//------------------------------------------------------------------------------

export function getRelationGroup<K extends ResourceKind, N extends RelatedResourceName<K>>(
  kind: K,
  name: N,
): RelationGroup {
  const definitions = relationGroupByResourceKind as Partial<
    Record<ResourceKind, Partial<Record<string, RelationGroup>>>
  >;
  const group = definitions[kind]?.[name];
  if (!group) throw new Error(`Unknown relation ${kind}.${name}`);
  return group;
}

//------------------------------------------------------------------------------
// Resource Relations
//------------------------------------------------------------------------------

export type ResourceRelations = { [G in RelationGroup]: RelationGroupRows[G][] };

//------------------------------------------------------------------------------
// Resource Relation Row
//------------------------------------------------------------------------------

export type ResourceRelationRow<G extends RelationGroup> = RelationGroupRows[G];

//------------------------------------------------------------------------------
// Relation Endpoint Update
//------------------------------------------------------------------------------

export type RelationEndpointUpdate = {
  group: RelationGroup;
  related: { id: string; kind?: ResourceKind; min_level?: number }[];
};

//------------------------------------------------------------------------------
// Relation Resource Endpoint
//------------------------------------------------------------------------------

export type RelationResourceEndpoint = {
  id: string;
  kind: ResourceKind;
};

//------------------------------------------------------------------------------
// Relation Endpoint Kinds
//------------------------------------------------------------------------------

const relationEndpointKinds: Record<RelationGroup, [ResourceKind[], ResourceKind[]]> = {
  character_classes_and_spells: [["character_class"], ["spell"]],
  creature_families_and_creature_habitats: [["creature_family"], ["creature_habitat"]],
  creature_families_and_creature_treasures: [["creature_family"], ["creature_treasure"]],
  character_classes_and_features: [["character_class"], ["feature"]],
  character_subclasses_and_features: [["character_subclass"], ["feature"]],
  equipments_and_features: [["armor", "item", "tool", "weapon"], ["feature"]],
  feats_and_features: [["feat"], ["feature"]],
  species_and_features: [["species"], ["feature"]],
};

//------------------------------------------------------------------------------
// Apply Relation Endpoint Update
//------------------------------------------------------------------------------

export function applyRelationEndpointUpdate<G extends RelationGroup>(
  rows: ResourceRelationRow<G>[],
  endpoint: RelationResourceEndpoint,
  update: RelationEndpointUpdate,
): ResourceRelationRow<G>[] {
  const [resource1Kinds, resource2Kinds] = relationEndpointKinds[update.group];
  const resource1Side = resource1Kinds.includes(endpoint.kind);
  const resource2Side = resource2Kinds.includes(endpoint.kind);
  if (!resource1Side && !resource2Side) {
    throw new Error(`Invalid endpoint kind ${endpoint.kind} for ${update.group}`);
  }

  const existing = rows as ResourceRelation<ResourceKind, ResourceKind>[];
  const retained = existing.filter((row) =>
    resource1Side
      ? !(row.resource_1_kind === endpoint.kind && row.resource_1_id === endpoint.id)
      : !(row.resource_2_kind === endpoint.kind && row.resource_2_id === endpoint.id),
  );

  const endpointRows = existing.filter((row) =>
    resource1Side
      ? row.resource_1_kind === endpoint.kind && row.resource_1_id === endpoint.id
      : row.resource_2_kind === endpoint.kind && row.resource_2_id === endpoint.id,
  );
  function relationKey(row: ResourceRelation<ResourceKind, ResourceKind>): string {
    const relatedId = resource1Side ? row.resource_2_id : row.resource_1_id;
    return "min_level" in row ? `${relatedId}:${row.min_level}` : relatedId;
  }

  function updateKey(related: RelationEndpointUpdate["related"][number]): string {
    return update.group === "character_classes_and_spells" ||
      update.group === "creature_families_and_creature_habitats" ||
      update.group === "creature_families_and_creature_treasures"
      ? related.id
      : `${related.id}:${related.min_level}`;
  }

  const existingByRelatedId = new Map(
    endpointRows.map((row) => [
      relationKey(row),
      resource1Side ? row.resource_2_position : row.resource_1_position,
    ]),
  );
  const nextPositionByRelatedId = new Map<string, number>();

  const nextRows = update.related.map((related, index) => {
    const existingRow = endpointRows.find((row) => relationKey(row) === updateKey(related));
    const otherKind = resource1Side
      ? (existingRow?.resource_2_kind ?? related.kind ?? resource2Kinds[0]!)
      : (existingRow?.resource_1_kind ?? related.kind ?? resource1Kinds[0]!);
    if (!(resource1Side ? resource2Kinds : resource1Kinds).includes(otherKind)) {
      throw new Error(`Invalid related kind ${otherKind} for ${update.group}`);
    }
    let otherPosition = existingByRelatedId.get(updateKey(related));
    if (otherPosition === undefined) {
      const nextPosition = nextPositionByRelatedId.get(related.id);
      otherPosition =
        nextPosition ??
        Math.max(
          -1,
          ...existing
            .filter((row) =>
              resource1Side
                ? row.resource_2_kind === otherKind && row.resource_2_id === related.id
                : row.resource_1_kind === otherKind && row.resource_1_id === related.id,
            )
            .map((row) => (resource1Side ? row.resource_2_position : row.resource_1_position)),
        ) + 1;
      nextPositionByRelatedId.set(related.id, otherPosition + 1);
    }

    const row = resource1Side
      ? {
          resource_1_id: endpoint.id,
          resource_1_kind: endpoint.kind,
          resource_1_position: index,
          resource_2_id: related.id,
          resource_2_kind: otherKind,
          resource_2_position: otherPosition,
        }
      : {
          resource_1_id: related.id,
          resource_1_kind: otherKind,
          resource_1_position: otherPosition,
          resource_2_id: endpoint.id,
          resource_2_kind: endpoint.kind,
          resource_2_position: index,
        };

    if (
      update.group === "character_classes_and_spells" ||
      update.group === "creature_families_and_creature_habitats" ||
      update.group === "creature_families_and_creature_treasures"
    )
      return row;
    if (typeof related.min_level !== "number") {
      throw new Error(`Missing min_level for ${update.group} relation ${related.id}`);
    }
    return { ...row, min_level: related.min_level };
  });

  return [...retained, ...nextRows] as ResourceRelationRow<G>[];
}

//------------------------------------------------------------------------------
// Update Resource Relations
//------------------------------------------------------------------------------

export function updateResourceRelations(
  relations: ResourceRelations,
  endpoint: RelationResourceEndpoint,
  updates: RelationEndpointUpdate[],
): ResourceRelations {
  const next = { ...relations } as ResourceRelations;
  for (const update of updates) {
    next[update.group] = applyRelationEndpointUpdate(
      next[update.group] as never,
      endpoint,
      update,
    ) as never;
  }
  return next;
}

//------------------------------------------------------------------------------
// Remove Resource Relations
//------------------------------------------------------------------------------

export function removeResourceRelations(
  relations: ResourceRelations,
  endpoint: RelationResourceEndpoint,
): ResourceRelations {
  return Object.fromEntries(
    Object.entries(relations).map(([group, rows]) => [
      group,
      rows.filter(
        (row) =>
          !(row.resource_1_kind === endpoint.kind && row.resource_1_id === endpoint.id) &&
          !(row.resource_2_kind === endpoint.kind && row.resource_2_id === endpoint.id),
      ),
    ]),
  ) as ResourceRelations;
}

//------------------------------------------------------------------------------
// Relation Schemas
//------------------------------------------------------------------------------

const relationFields = {
  resource_1_id: z.uuid(),
  resource_1_position: z.number().int().min(0),
  resource_2_id: z.uuid(),
  resource_2_position: z.number().int().min(0),
};

//------------------------------------------------------------------------------
// Feature Relation Schema
//------------------------------------------------------------------------------

function featureRelationSchema<K extends ResourceKind>(kind: K) {
  return z.object({
    ...relationFields,
    min_level: z.number().min(0).max(20),
    resource_1_kind: z.literal(kind),
    resource_2_kind: z.literal("feature"),
  });
}

//------------------------------------------------------------------------------
// Resource Relations Schema
//------------------------------------------------------------------------------

export const resourceRelationsSchema = z.object({
  character_classes_and_spells: z
    .object({
      ...relationFields,
      resource_1_kind: z.literal("character_class"),
      resource_2_kind: z.literal("spell"),
    })
    .array()
    .default([]),
  creature_families_and_creature_habitats: z
    .object({
      ...relationFields,
      resource_1_kind: z.literal("creature_family"),
      resource_2_kind: z.literal("creature_habitat"),
    })
    .array()
    .default([]),
  creature_families_and_creature_treasures: z
    .object({
      ...relationFields,
      resource_1_kind: z.literal("creature_family"),
      resource_2_kind: z.literal("creature_treasure"),
    })
    .array()
    .default([]),
  character_classes_and_features: featureRelationSchema("character_class").array().default([]),
  character_subclasses_and_features: featureRelationSchema("character_subclass")
    .array()
    .default([]),
  equipments_and_features: z
    .discriminatedUnion("resource_1_kind", [
      featureRelationSchema("armor"),
      featureRelationSchema("item"),
      featureRelationSchema("tool"),
      featureRelationSchema("weapon"),
    ])
    .array()
    .default([]),
  feats_and_features: featureRelationSchema("feat").array().default([]),
  species_and_features: featureRelationSchema("species").array().default([]),
});

//------------------------------------------------------------------------------
// Empty Resource Relations
//------------------------------------------------------------------------------

export const emptyResourceRelations: ResourceRelations = {
  character_classes_and_spells: [],
  creature_families_and_creature_habitats: [],
  creature_families_and_creature_treasures: [],
  character_classes_and_features: [],
  character_subclasses_and_features: [],
  equipments_and_features: [],
  feats_and_features: [],
  species_and_features: [],
};
