import { Span, type StackProps, VStack } from "@chakra-ui/react";
import { EyeClosedIcon, EyeIcon } from "lucide-react";
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
import Checkbox from "~/ui/checkbox";
import Icon from "~/ui/icon";
import Link from "~/ui/link";
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

export type ResourcesAlbumCardProps = AlbumCardProps & {
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
  { AlbumCardContent, getDetails }: ResourcesAlbumCardExtra<R, L>,
) {
  function ResourcesAlbumCard({
    campaignId,
    editable = false,
    gradientIntensity = 40,
    palette = defaultPalette,
    printMode = false,
    resourceId,
    zoom,
    ...rest
  }: ResourcesAlbumCardProps) {
    const localizedResource = store.useLocalizedResource(resourceId);
    const selected = store.useResourceSelection(resourceId);

    const bgImage = `radial-gradient(circle, {colors.bg} 0%, {colors.bg} ${gradientIntensity}%, ${palette.gradientBg} 100%)`;

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

    const details = getDetails(localizedResource);

    return (
      <AlbumCard bgImage={bgImage} style={{ zoom }} {...rest}>
        {printMode ?
          <AlbumCard.Header justifyContent="center" textAlign="center">
            {name}
          </AlbumCard.Header>
        : <AlbumCard.Header>
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

            <Checkbox onValueChange={setSelected} size="sm" value={selected} />
          </AlbumCard.Header>
        }

        <VStack flex={1} gap={0} overflow="auto" w="full">
          <AlbumCardContent
            borderBottomWidth={AlbumCard.size0}
            borderColor="border.emphasized"
            gap={0}
            localizedResource={localizedResource}
            separator={<AlbumCard.SeparatorH />}
            w="full"
          />

          {details && <AlbumCard.Description description={details} />}
        </VStack>

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
  }

  ResourcesAlbumCard.height = AlbumCard.height;
  ResourcesAlbumCard.width = AlbumCard.width;

  return ResourcesAlbumCard;
}

//------------------------------------------------------------------------------
// Default Palette
//------------------------------------------------------------------------------

const defaultPalette = {
  footerBg: "gray.700",
  footerFg: "gray.50",
  gradientBg: "{colors.gray.100}",
};
