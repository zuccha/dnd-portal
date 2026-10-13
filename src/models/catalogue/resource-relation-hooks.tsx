import { useContext, useMemo } from "react";
import { useActiveSourceRelations, useRelations } from "./catalogue";
import {
  applyRelationEndpointUpdate,
  getRelatedResourceEntries,
  type RelationGroup,
  type RelationResourceEndpoint,
  type RelatedResourceEntry,
  type ResourceRelationRow,
} from "./resource-relations";
import { resourceRelationDraftContext } from "./resource-relations-draft-context";

//------------------------------------------------------------------------------
// Use Source Related Resource Entries
//------------------------------------------------------------------------------

export function useSourceRelatedResourceEntries<G extends RelationGroup>(
  sourceId: string,
  group: G,
  endpoint: RelationResourceEndpoint,
): RelatedResourceEntry[] {
  const sourceIds = useMemo(() => [sourceId], [sourceId]);
  const rows = useRelations(sourceIds, group);
  const { id, kind } = endpoint;
  return useMemo(() => getRelatedResourceEntries(rows, { id, kind }), [id, kind, rows]);
}

//------------------------------------------------------------------------------
// Use Active Source Related Resource Entries
//------------------------------------------------------------------------------

export function useActiveSourceRelatedResourceEntries<G extends RelationGroup>(
  group: G,
  endpoint: RelationResourceEndpoint,
): RelatedResourceEntry[] {
  const rows = useActiveSourceRelations(group);
  const draft = useContext(resourceRelationDraftContext);
  const { id, kind } = endpoint;
  const effectiveRows = useMemo(() => {
    if (!draft || draft.endpoint.id !== id || draft.endpoint.kind !== kind) {
      return rows;
    }
    const update = draft.updates.find((entry) => entry.group === group);
    return update
      ? (applyRelationEndpointUpdate(rows, { id, kind }, update) as ResourceRelationRow<G>[])
      : rows;
  }, [draft, group, id, kind, rows]);
  return useMemo(
    () => getRelatedResourceEntries(effectiveRows, { id, kind }),
    [effectiveRows, id, kind],
  );
}
