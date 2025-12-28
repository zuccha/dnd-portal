import { HStack, Separator, Span, type StackProps } from "@chakra-ui/react";
import { EyeClosedIcon, EyeIcon, RefreshCwIcon } from "lucide-react";
import { useCallback, useState } from "react";
import type {
  DBResource,
  DBResourceTranslation,
} from "~/models/resources/db-resource";
import type { LocalizedResource } from "~/models/resources/localized-resource";
import type { Resource, ResourceFilters } from "~/models/resources/resource";
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
};

//------------------------------------------------------------------------------
// Create Resources Album Card
//------------------------------------------------------------------------------

export type ResourcesAlbumCardProps = {
  editable: boolean;
  resourceId: string;
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
  { pages }: ResourcesAlbumCardExtra<R, L>,
) {
  return function ResourcesAlbumCard({
    editable,
    resourceId,
  }: {
    editable: boolean;
    resourceId: string;
  }) {
    const localizedResource = store.useLocalizedResource(resourceId);
    const [selected, setSelected] = store.useResourceSelection(resourceId);

    const [pageNumber, setPageNumber] = useState(0);

    const cyclePage = useCallback(() => {
      setPageNumber((prev) => (prev + 1) % pages.length);
    }, []);

    const edit = useCallback(() => {
      if (localizedResource) context.setEditedResource(localizedResource._raw);
    }, [localizedResource]);

    if (!localizedResource) return null;

    const { name } = localizedResource;
    const { visibility } = localizedResource._raw;

    const AlbumCardContent = pages[pageNumber]!;

    return (
      <AlbumCard>
        <AlbumCard.Header lineHeight={1.2}>
          {editable ?
            <HStack align="flex-start" flex={1}>
              <Icon
                Icon={visibility === "player" ? EyeIcon : EyeClosedIcon}
                color="fg.muted"
                h="1.2em"
                mt="1px"
                size="sm"
              />
              <Link onClick={edit}>{name}</Link>
            </HStack>
          : <Span>{name}</Span>}

          <HStack h="1.2em">
            {pages.length > 1 && (
              <IconButton
                Icon={RefreshCwIcon}
                onClick={cyclePage}
                size="2xs"
                variant="ghost"
              />
            )}
            <Checkbox onValueChange={setSelected} size="sm" value={selected} />
          </HStack>
        </AlbumCard.Header>

        <AlbumCardContent
          flex={1}
          gap={0}
          localizedResource={localizedResource}
          overflow="auto"
          separator={<Separator w="full" />}
          w="full"
        />

        <AlbumCard.Caption>
          <Span>{localizedResource.campaign}</Span>
          <Span>{localizedResource.page}</Span>
        </AlbumCard.Caption>
      </AlbumCard>
    );
  };
}
