import { createContext } from "react";
import type { RelationEndpointUpdate, RelationResourceEndpoint } from "./resource-relations";

//------------------------------------------------------------------------------
// Resource Relation Draft
//------------------------------------------------------------------------------

export type ResourceRelationDraft = {
  endpoint: RelationResourceEndpoint;
  updates: RelationEndpointUpdate[];
};

export const resourceRelationDraftContext = createContext<ResourceRelationDraft | undefined>(
  undefined,
);
