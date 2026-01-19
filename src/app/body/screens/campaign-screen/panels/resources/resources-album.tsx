import { Box, Flex, Wrap } from "@chakra-ui/react";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
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
  type ResourceCardInteractiveExtra,
  createResourceCardInteractive,
} from "./resource-card-interactive";
import type { ResourcesContext } from "./resources-context";
import ResourcesEmpty from "./resources-empty";

//------------------------------------------------------------------------------
// Resources Album Extra
//------------------------------------------------------------------------------

export type ResourcesAlbumExtra<
  R extends Resource,
  L extends LocalizedResource<R>,
> = ResourceCardInteractiveExtra<R, L>;

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
  const ResourceCardInteractive = createResourceCardInteractive(
    store,
    context,
    extra,
  );

  function ResourcesAlbum({ campaignId }: ResourcesAlbumProps) {
    const editable = useCanEditCampaign(campaignId);
    const filteredResourceIds = store.useFilteredResourceIds(campaignId);
    const zoom = context.useZoom();

    const containerRef = useRef<HTMLDivElement | null>(null);
    const [visibleById, setVisibleById] = useState<Record<string, boolean>>({});

    const virtualize = useCallback(() => {
      const container = containerRef.current;
      if (!container) return;

      const scrollTop = container.scrollTop;

      const containerH = container.clientHeight;
      const containerW = container.clientWidth;

      const cardH = ResourceCardInteractive.h * zoom * 96;
      const cardW = ResourceCardInteractive.w * zoom * 96;

      const rowH = cardH + gap;
      const columns = computeFit(containerW, cardW, gap, gap) || 1;

      const overscan = 2;
      const startRow = Math.floor(scrollTop / rowH) - overscan;
      const endRow = Math.floor((scrollTop + containerH) / rowH) + overscan;

      const last = filteredResourceIds.length - 1;
      const start = Math.max(0, startRow * columns);
      const end = Math.min(last, (endRow + 1) * columns - 1);

      setVisibleById((prev) => {
        const next = { ...prev };
        for (let i = start; i <= end; ++i) next[filteredResourceIds[i]!] = true;
        return next;
      });
    }, [filteredResourceIds, zoom]);

    useLayoutEffect(() => {
      setVisibleById({});
    }, [filteredResourceIds]);

    useEffect(() => {
      if (!containerRef.current) return;
      const resizeObserver = new ResizeObserver(virtualize);
      resizeObserver.observe(containerRef.current);
      return () => resizeObserver.disconnect();
    }, [virtualize]);

    if (!filteredResourceIds.length) return <ResourcesEmpty />;

    return (
      <Flex
        flex={1}
        onScroll={virtualize}
        overflow="scroll"
        ref={containerRef}
        w="full"
      >
        <Box bgColor="bg.subtle" w="full">
          <Wrap
            bgColor="bg.subtle"
            gap={`${gap}px`}
            justify="center"
            p={`${gap}px`}
            w="full"
          >
            {filteredResourceIds.map((id) => {
              return visibleById[id] ?
                  <ResourceCardInteractive
                    campaignId={campaignId}
                    editable={editable}
                    key={id}
                    resourceId={id}
                    zoom={zoom}
                  />
                : <ResourceCardInteractive.Placeholder
                    campaignId={campaignId}
                    key={id}
                    resourceId={id}
                    zoom={zoom}
                  />;
            })}
          </Wrap>
        </Box>
      </Flex>
    );
  }

  ResourcesAlbum.Card = ResourceCardInteractive;

  return ResourcesAlbum;
}

//------------------------------------------------------------------------------
// Constants
//------------------------------------------------------------------------------

const gap = 16;

//------------------------------------------------------------------------------
// Compute Fit
//------------------------------------------------------------------------------

function computeFit(
  containerWidth: number,
  contentWidth: number,
  padding: number,
  gap: number,
): number {
  const available = containerWidth - 2 * padding;
  const fit = Math.floor((available + gap) / (contentWidth + gap));
  return Math.max(1, fit);
}
