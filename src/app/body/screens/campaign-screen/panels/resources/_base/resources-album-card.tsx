import { Span, type StackProps } from "@chakra-ui/react";
import { EyeClosedIcon, EyeIcon, RefreshCwIcon } from "lucide-react";
import { useCallback, useState } from "react";
import type {
  DBResource,
  DBResourceTranslation,
} from "~/models/resources/db-resource";
import type { LocalizedResource } from "~/models/resources/localized-resource";
import type { Resource } from "~/models/resources/resource";
import type { ResourceFilters } from "~/models/resources/resource-filters";
import type { ResourceStore } from "~/models/resources/resource-store";
import AlbumCard from "~/ui/album-card";
import Checkbox from "~/ui/checkbox";
import Icon from "~/ui/icon";
import IconButton from "~/ui/icon-button";
import Link from "~/ui/link";
import type { ResourcesContext } from "./resources-context";

//------------------------------------------------------------------------------
// Resources Album Card Extra
//------------------------------------------------------------------------------

export type ResourcesAlbumCardExtra<
  R extends Resource,
  L extends LocalizedResource<R>,
> = {
  pages: React.FC<StackProps & { localizedResource: L }>[];
  palette?: { footerBg: string; footerFg: string; gradientBg: string };
};

//------------------------------------------------------------------------------
// Create Resources Album Card
//------------------------------------------------------------------------------

export type ResourcesAlbumCardProps = {
  campaignId: string;
  editable: boolean;
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
  { pages, palette }: ResourcesAlbumCardExtra<R, L>,
) {
  palette ??= {
    footerBg: "gray.700",
    footerFg: "gray.50",
    gradientBg: "{colors.gray.100}",
  };

  const bgImage = `radial-gradient(circle, {colors.bg} 0%, {colors.bg} 40%, ${palette.gradientBg} 100%)`;

  return function ResourcesAlbumCard({
    campaignId,
    editable,
    resourceId,
    zoom,
  }: ResourcesAlbumCardProps) {
    const localizedResource = store.useLocalizedResource(resourceId);
    const selected = store.useResourceSelection(resourceId);

    const [pageNumber, setPageNumber] = useState(0);

    const cyclePage = useCallback(() => {
      setPageNumber((prev) => (prev + 1) % pages.length);
    }, []);

    const setSelected = useCallback(
      (nextSelected: boolean) =>
        store.setResourceSelection(campaignId, resourceId, nextSelected),
      [campaignId, resourceId],
    );

    const edit = useCallback(() => {
      if (localizedResource) context.setEditedResource(localizedResource._raw);
    }, [localizedResource]);

    if (!localizedResource) return null;

    const { name } = localizedResource;
    const { visibility } = localizedResource._raw;

    const AlbumCardContent = pages[pageNumber]!;

    return (
      <AlbumCard bgImage={bgImage} style={{ zoom }}>
        <AlbumCard.Header>
          {editable ?
            <>
              <Icon
                Icon={visibility === "player" ? EyeIcon : EyeClosedIcon}
                h="full"
                opacity={0.8}
                size="xs"
              />
              <Link color="inherit" onClick={edit}>
                {name}
              </Link>
            </>
          : <Span color="inherit">{name}</Span>}

          <Span flex={1} />

          {pages.length > 1 && (
            <IconButton
              Icon={RefreshCwIcon}
              h="full"
              onClick={cyclePage}
              size="2xs"
              variant="ghost"
            />
          )}
          <Checkbox onValueChange={setSelected} size="sm" value={selected} />
        </AlbumCard.Header>

        <AlbumCardContent
          flex={1}
          gap={0}
          localizedResource={localizedResource}
          overflow="auto"
          separator={<AlbumCard.SeparatorH />}
          w="full"
        />

        <AlbumCard.Caption
          bgColor={palette.footerBg}
          color={palette.footerFg}
          fontWeight="bold"
        >
          <Span>{localizedResource.campaign}</Span>
          <Span textTransform="uppercase">{localizedResource.page}</Span>
        </AlbumCard.Caption>
      </AlbumCard>
    );
  };
}
