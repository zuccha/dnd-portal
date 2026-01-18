import { Box, Theme, VStack } from "@chakra-ui/react";
import { EditIcon, SquareIcon } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import SquareCheckIcon from "~/icons/square-check-icon";
import type {
  DBResource,
  DBResourceTranslation,
} from "~/models/resources/db-resource";
import type { LocalizedResource } from "~/models/resources/localized-resource";
import type { Resource } from "~/models/resources/resource";
import type { ResourceFilters } from "~/models/resources/resource-filters";
import type { ResourceStore } from "~/models/resources/resource-store";
import IconButton from "~/ui/icon-button";
import PokerCard from "~/ui/poker-card";
import { type Palette, defaultPalette } from "~/utils/palette";
import type { ResourcePokerCardProps } from "./resource-poker-card";
import type { ResourcesContext } from "./resources-context";

//------------------------------------------------------------------------------
// Resource Card Interactive Extra
//------------------------------------------------------------------------------

export type ResourceCardInteractiveExtra<
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
// Create Resource Card Interactive
//------------------------------------------------------------------------------

export type ResourceCardInteractiveProps = {
  campaignId: string;
  editable?: boolean;
  palette?: Palette;
  resourceId: string;
  zoom?: number;
};

export function createResourceCardInteractive<
  R extends Resource,
  L extends LocalizedResource<R>,
  F extends ResourceFilters,
  DBR extends DBResource,
  DBT extends DBResourceTranslation,
>(
  store: ResourceStore<R, L, F, DBR, DBT>,
  context: ResourcesContext<R>,
  extra: ResourceCardInteractiveExtra<R, L>,
) {
  const {
    useLocalizedResource,
    useResourceSelection,
    useResourceSelectionMethods,
  } = store;

  const AlbumCard = extra.AlbumCard;

  function ResourcesAlbumCardInteractive({
    campaignId,
    editable,
    palette = defaultPalette,
    resourceId,
    zoom,
  }: ResourceCardInteractiveProps) {
    const localizedResource = useLocalizedResource(campaignId, resourceId);

    const [selectedPageIndex, setSelectedPageIndex] = useState(0);
    const pageCountRef = useRef(0);
    const handlePageCountChange = useCallback((count: number | undefined) => {
      pageCountRef.current = count ?? 0;
    }, []);

    const pointerDownRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

    const cycleLeft = useCallback(() => {
      setSelectedPageIndex((prev) =>
        prev > 0 ? prev - 1 : pageCountRef.current - 1,
      );
    }, []);

    const cycleRight = useCallback(() => {
      setSelectedPageIndex((prev) => (prev + 1) % pageCountRef.current);
    }, []);

    const selected = useResourceSelection(resourceId);
    const { setResourceSelection } = useResourceSelectionMethods(resourceId);

    const edit = useCallback(() => {
      if (localizedResource) context.setEditedResource(localizedResource._raw);
    }, [localizedResource]);

    if (!localizedResource) return null;

    return (
      <Box
        className="group"
        h={`${AlbumCard.h}in`}
        onPointerDown={(e) => {
          pointerDownRef.current = { x: e.clientX, y: e.clientY };
        }}
        onPointerUp={(e) => {
          const dx = Math.abs(e.clientX - pointerDownRef.current.x);
          const dy = Math.abs(e.clientY - pointerDownRef.current.y);
          const selection = window.getSelection()?.toString() ?? "";
          if (selection) return; // user selected text
          if (dx > 4 || dy > 4) return; // treat as drag
          const el = e.currentTarget;
          const rect = el.getBoundingClientRect();
          const isLeft = e.clientX < rect.left + rect.width / 2;
          if (isLeft) cycleLeft();
          else cycleRight();
        }}
        position="relative"
        w={`${AlbumCard.w}in`}
        zoom={zoom}
      >
        <AlbumCard
          left={0}
          localizedResource={localizedResource}
          onPageCountChange={handlePageCountChange}
          palette={palette}
          position="absolute"
          selectedPageIndex={selectedPageIndex}
          top={0}
        />
        <Theme appearance="light">
          <VStack
            _groupHover={{ visibility: "visible" }}
            left={PokerCard.rem0500}
            position="absolute"
            top={PokerCard.rem0500}
            visibility="hidden"
            zIndex={2}
          >
            {editable && (
              <IconButton
                Icon={EditIcon}
                _hover={{ bgColor: palette[100] }}
                className="light"
                onPointerDown={(e) => {
                  e.stopPropagation();
                  edit();
                }}
                size="2xs"
                variant="ghost"
              />
            )}
          </VStack>

          <IconButton
            Icon={selected ? SquareCheckIcon : SquareIcon}
            _groupHover={{ visibility: "visible" }}
            onPointerDown={(e) => {
              e.stopPropagation();
              setResourceSelection(!selected);
            }}
            position="absolute"
            right={PokerCard.rem0500}
            size="2xs"
            top={PokerCard.rem0500}
            variant="plain"
            visibility={selected ? "visible" : "hidden"}
            zIndex={2}
          />
        </Theme>
      </Box>
    );
  }

  ResourcesAlbumCardInteractive.h = AlbumCard.h;
  ResourcesAlbumCardInteractive.w = AlbumCard.w;

  return ResourcesAlbumCardInteractive;
}
