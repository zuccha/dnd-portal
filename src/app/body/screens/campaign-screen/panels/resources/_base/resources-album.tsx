import { Wrap } from "@chakra-ui/react";
import { useCanEditCampaign } from "~/models/campaign";
import type {
  DBResource,
  DBResourceTranslation,
} from "~/models/resources/db-resource";
import type { LocalizedResource } from "~/models/resources/localized-resource";
import type { Resource } from "~/models/resources/resource";
import type { ResourceFilters } from "~/models/resources/resource-filters";
import type { ResourceStore } from "~/models/resources/resource-store";
import {
  type ResourcesAlbumCardExtra,
  createResourcesAlbumCard,
} from "./resources-album-card";
import type { ResourcesContext } from "./resources-context";
import ResourcesEmpty from "./resources-empty";

//------------------------------------------------------------------------------
// Resources Album Extra
//------------------------------------------------------------------------------

export type ResourcesAlbumExtra<
  R extends Resource,
  L extends LocalizedResource<R>,
> = ResourcesAlbumCardExtra<R, L>;

//------------------------------------------------------------------------------
// Create Resources Album
//------------------------------------------------------------------------------

export type ResourcesAlbumProps = {
  campaignId: string;
};

export function createResourcesAlbum<
  R extends Resource,
  L extends LocalizedResource<R>,
  F extends ResourceFilters,
  DBR extends DBResource,
  DBT extends DBResourceTranslation,
>(
  store: ResourceStore<R, L, F, DBR, DBT>,
  context: ResourcesContext<R>,
  extra: ResourcesAlbumExtra<R, L>,
) {
  const ResourcesAlbumCard = createResourcesAlbumCard(store, context, extra);

  function ResourcesAlbum({ campaignId }: ResourcesAlbumProps) {
    const editable = useCanEditCampaign(campaignId);
    const filteredResourceIds = store.useFilteredResourceIds(campaignId);
    const zoom = context.useZoom();

    if (!filteredResourceIds.length) return <ResourcesEmpty />;

    return (
      <Wrap bgColor="bg.subtle" gap={4} justify="center" p={4} w="full">
        {filteredResourceIds.map((id) => (
          <ResourcesAlbumCard
            campaignId={campaignId}
            editable={editable}
            key={id}
            resourceId={id}
            zoom={zoom}
          />
        ))}
      </Wrap>
    );
  }

  ResourcesAlbum.Card = ResourcesAlbumCard;

  return ResourcesAlbum;
}
