import { useMemo } from "react";
import type {
  DBResource,
  DBResourceTranslation,
} from "~/models/resources/db-resource";
import type { LocalizedResource } from "~/models/resources/localized-resource";
import type { Resource } from "~/models/resources/resource";
import type { ResourceFilters } from "~/models/resources/resource-filters";
import type { ResourceStore } from "~/models/resources/resource-store";
import type { Palette } from "~/utils/palette";
import type { ResourcePokerCardProps } from "./resource-poker-card";
import type { ResourcesContext } from "./resources-context";

//------------------------------------------------------------------------------
// Resource Card Printable Extra
//------------------------------------------------------------------------------

export type ResourceCardPrintableExtra<
  R extends Resource,
  L extends LocalizedResource<R>,
> = {
  AlbumCard: React.FC<
    Omit<
      ResourcePokerCardProps<R, L>,
      "afterDetails" | "beforeDetails" | "firstPageInfo"
    >
  > & { h: number; w: number };
};

//------------------------------------------------------------------------------
// Create Resource Card Printable
//------------------------------------------------------------------------------

export type ResourceCardPrintableProps<
  R extends Resource,
  L extends LocalizedResource<R>,
> = {
  alwaysEvenPages?: boolean;
  bgColor?: string;
  css?: ResourcePokerCardProps<R, L>["css"];
  localizeResource: (resource: R) => L;
  onPageCountChange?: (count: number | undefined) => void;
  palette: Palette;
  resourceId: string;
  showImage: boolean;
  zoom?: number;
};

export function createResourceCardPrintable<
  R extends Resource,
  L extends LocalizedResource<R>,
  F extends ResourceFilters,
  DBR extends DBResource,
  DBT extends DBResourceTranslation,
>(
  store: ResourceStore<R, L, F, DBR, DBT>,
  _context: ResourcesContext<R>,
  extra: ResourceCardPrintableExtra<R, L>,
) {
  const { useResource } = store;

  const AlbumCard = extra.AlbumCard;

  function ResourcesAlbumCardPrintable({
    localizeResource,
    resourceId,
    ...rest
  }: ResourceCardPrintableProps<R, L>) {
    const [resource] = useResource(resourceId);
    const localizedResource = useMemo(
      () => localizeResource(resource),
      [localizeResource, resource],
    );

    return (
      <AlbumCard
        borderRadius={0}
        localizedResource={localizedResource}
        {...rest}
      />
    );
  }

  ResourcesAlbumCardPrintable.h = AlbumCard.h;
  ResourcesAlbumCardPrintable.w = AlbumCard.w;

  return ResourcesAlbumCardPrintable;
}
