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
  character_classes_and_features: FeatureRelation<"character_class">;
  character_subclasses_and_features: FeatureRelation<"character_subclass">;
  equipments_and_features: FeatureRelation<"armor" | "item" | "tool" | "weapon">;
  feats_and_features: FeatureRelation<"feat">;
  species_and_features: FeatureRelation<"species">;
};

export type RelationGroup = keyof RelationGroupRows;

export type ResourceRelations = { [G in RelationGroup]: RelationGroupRows[G][] };

export type ResourceRelationRow<G extends RelationGroup> = RelationGroupRows[G];

//------------------------------------------------------------------------------
// Relation Endpoint Update
//------------------------------------------------------------------------------

export type RelationEndpointUpdate = {
  group: RelationGroup;
  related: { id: string; kind?: ResourceKind; min_level?: number }[];
};

//------------------------------------------------------------------------------
// Related Resource Entry
//------------------------------------------------------------------------------

export type RelatedResourceEntry = {
  id: string;
  kind: ResourceKind;
  min_level?: number;
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
    return update.group === "character_classes_and_spells"
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

    if (update.group === "character_classes_and_spells") return row;
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
// Get Related Resource Entries
//------------------------------------------------------------------------------

export function getRelatedResourceEntries<G extends RelationGroup>(
  rows: ResourceRelationRow<G>[],
  endpoint: RelationResourceEndpoint,
): RelatedResourceEntry[] {
  const related = (rows as ResourceRelation<ResourceKind, ResourceKind>[])
    .flatMap((row) => {
      if (row.resource_1_kind === endpoint.kind && row.resource_1_id === endpoint.id) {
        return [
          {
            id: row.resource_2_id,
            kind: row.resource_2_kind,
            min_level:
              "min_level" in row && typeof row.min_level === "number" ? row.min_level : undefined,
            position: row.resource_1_position,
          },
        ];
      }
      if (row.resource_2_kind === endpoint.kind && row.resource_2_id === endpoint.id) {
        return [
          {
            id: row.resource_1_id,
            kind: row.resource_1_kind,
            min_level:
              "min_level" in row && typeof row.min_level === "number" ? row.min_level : undefined,
            position: row.resource_2_position,
          },
        ];
      }
      return [];
    })
    .sort((a, b) => a.position - b.position);

  return related.map(({ id, kind, min_level }) => ({ id, kind, min_level }));
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

export const emptyResourceRelations: ResourceRelations = {
  character_classes_and_spells: [],
  character_classes_and_features: [],
  character_subclasses_and_features: [],
  equipments_and_features: [],
  feats_and_features: [],
  species_and_features: [],
};
