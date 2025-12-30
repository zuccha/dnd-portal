import { type StackProps } from "@chakra-ui/react";
import { useCallback } from "react";
import type {
  DBResource,
  DBResourceTranslation,
} from "~/models/resources/db-resource";
import type { LocalizedResource } from "~/models/resources/localized-resource";
import type { Resource } from "~/models/resources/resource";
import type { ResourceFilters } from "~/models/resources/resource-filters";
import type { ResourceStore } from "~/models/resources/resource-store";
import AlbumCard, { type AlbumCardProps } from "~/ui/album-card";
import createResourcesAlbumCardPaginated from "./resources-album-card-paginated";
import createResourcesAlbumCardScrollable from "./resources-album-card-scrollable";
import type { ResourcesContext } from "./resources-context";

//------------------------------------------------------------------------------
// Resources Album Card Extra
//------------------------------------------------------------------------------

export type ResourcesAlbumCardExtra<
  R extends Resource,
  L extends LocalizedResource<R>,
> = {
  AlbumCardContent: React.FC<StackProps & { localizedResource: L }>;
  getDetails: (localizedResource: L) => string;
};

//------------------------------------------------------------------------------
// Create Resources Album Card
//------------------------------------------------------------------------------

export type ResourcesAlbumCardProps = Omit<AlbumCardProps, "children"> & {
  campaignId: string;
  editable?: boolean;
  gradientIntensity?: number;
  initialPageNumber?: number;
  palette?: { footerBg: string; footerFg: string; gradientBg: string };
  printMode?: boolean;
  resourceId: string;
  zoom?: number;
};

export function createResourcesAlbumCard<
  R extends Resource,
  L extends LocalizedResource<R>,
  F extends ResourceFilters,
  DBR extends DBResource,
  DBT extends DBResourceTranslation,
>(
  store: ResourceStore<R, L, F, DBR, DBT>,
  context: ResourcesContext<R>,
  extra: ResourcesAlbumCardExtra<R, L>,
) {
  const ResourcesAlbumCardPaginated = createResourcesAlbumCardPaginated(
    store,
    context,
    extra,
  );

  const ResourcesAlbumCardScrollable = createResourcesAlbumCardScrollable(
    store,
    context,
    extra,
  );

  function ResourcesAlbumCard({
    campaignId,
    editable,
    gradientIntensity = 40,
    palette,
    printMode,
    resourceId,
    zoom,
    ...rest
  }: ResourcesAlbumCardProps) {
    const localizedResource = store.useLocalizedResource(resourceId);
    const selected = store.useResourceSelection(resourceId);

    const setSelected = useCallback(
      (nextSelected: boolean) =>
        store.setResourceSelection(campaignId, resourceId, nextSelected),
      [campaignId, resourceId],
    );

    const edit = useCallback(() => {
      if (localizedResource) context.setEditedResource(localizedResource._raw);
    }, [localizedResource]);

    if (!localizedResource) return null;

    return printMode ?
        <ResourcesAlbumCardPaginated
          editable={editable}
          gradientIntensity={gradientIntensity}
          localizedResource={localizedResource}
          onEdit={edit}
          onSelectionChange={setSelected}
          palette={palette}
          printMode={printMode}
          selected={selected}
          zoom={zoom}
          {...rest}
        />
      : <ResourcesAlbumCardScrollable
          editable={editable}
          gradientIntensity={gradientIntensity}
          localizedResource={localizedResource}
          onEdit={edit}
          onSelectionChange={setSelected}
          palette={palette}
          printMode={printMode}
          selected={selected}
          zoom={zoom}
          {...rest}
        />;
  }

  ResourcesAlbumCard.height = AlbumCard.height;
  ResourcesAlbumCard.width = AlbumCard.width;

  return ResourcesAlbumCard;
}
