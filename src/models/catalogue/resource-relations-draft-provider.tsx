import { useMemo, type ReactNode } from "react";
import { resourceRelationDraftContext } from "./resource-relations-draft-context";
import type { RelationEndpointUpdate, RelationResourceEndpoint } from "./resource-relations";

//------------------------------------------------------------------------------
// Resource Relations Draft Provider
//------------------------------------------------------------------------------

export type ResourceRelationsDraftProviderProps = {
  children: ReactNode;
  endpoint: RelationResourceEndpoint;
  updates: RelationEndpointUpdate[];
};

export default function ResourceRelationsDraftProvider({
  children,
  endpoint,
  updates,
}: ResourceRelationsDraftProviderProps) {
  const value = useMemo(() => ({ endpoint, updates }), [endpoint, updates]);
  return (
    <resourceRelationDraftContext.Provider value={value}>
      {children}
    </resourceRelationDraftContext.Provider>
  );
}
