import { type StackProps } from "@chakra-ui/react";
import { useMemo } from "react";
import type {
  DBResource,
  DBResourceTranslation,
} from "~/models/resources/db-resource";
import type { LocalizedResource } from "~/models/resources/localized-resource";
import type { Resource } from "~/models/resources/resource";
import type { ResourceFilters } from "~/models/resources/resource-filters";
import type { ResourceStore } from "~/models/resources/resource-store";
import AlbumCard from "~/ui/album-card";
import ResourcesAlbumCardFrame, {
  type ResourcesAlbumCardFrameProps,
} from "./resources-album-card-frame";
import type { ResourcesContext } from "./resources-context";

//------------------------------------------------------------------------------
// Resources Album Card Scrollable Extra
//------------------------------------------------------------------------------

export type ResourcesAlbumCardExtra<
  R extends Resource,
  L extends LocalizedResource<R>,
> = {
  AlbumCardContent: React.FC<StackProps & { localizedResource: L }>;
  getDetails: (localizedResource: L) => string;
};

//------------------------------------------------------------------------------
// Create Resources Album Card Scrollable
//------------------------------------------------------------------------------

export type ResourcesAlbumCardScrollableProps<
  R extends Resource,
  L extends LocalizedResource<R>,
> = Omit<
  ResourcesAlbumCardFrameProps,
  "campaignName" | "campaignPage" | "campaignRole" | "contentRef" | "name"
> & {
  localizedResource: L;
};

export default function createResourcesAlbumCardScrollable<
  R extends Resource,
  L extends LocalizedResource<R>,
  F extends ResourceFilters,
  DBR extends DBResource,
  DBT extends DBResourceTranslation,
>(
  _store: ResourceStore<R, L, F, DBR, DBT>,
  _context: ResourcesContext<R>,
  { AlbumCardContent, getDetails }: ResourcesAlbumCardExtra<R, L>,
) {
  return function ResourcesAlbumCardScrollable({
    localizedResource,
    zoom,
    ...rest
  }: ResourcesAlbumCardScrollableProps<R, L>) {
    const paragraphs = useMemo(() => {
      return getDetails(localizedResource).split("\n");
    }, [localizedResource]);

    return (
      <ResourcesAlbumCardFrame
        campaignName={localizedResource.campaign}
        campaignPage={localizedResource.page}
        campaignRole={localizedResource._raw.visibility}
        name={localizedResource.name}
        zoom={zoom}
        {...rest}
      >
        <AlbumCardContent
          borderBottomWidth={AlbumCard.size0}
          borderColor="border.emphasized"
          gap={0}
          localizedResource={localizedResource}
          separator={<AlbumCard.SeparatorH />}
          w="full"
        />

        <AlbumCard.Description paragraphs={paragraphs} />
      </ResourcesAlbumCardFrame>
    );
  };
}
