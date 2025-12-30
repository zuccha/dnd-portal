import { type StackProps } from "@chakra-ui/react";
import { createRef, useLayoutEffect, useMemo, useRef, useState } from "react";
import type {
  DBResource,
  DBResourceTranslation,
} from "~/models/resources/db-resource";
import type { LocalizedResource } from "~/models/resources/localized-resource";
import type { Resource } from "~/models/resources/resource";
import type { ResourceFilters } from "~/models/resources/resource-filters";
import type { ResourceStore } from "~/models/resources/resource-store";
import AlbumCard from "~/ui/album-card";
import { dropLast } from "~/ui/array";
import ResourcesAlbumCardFrame, {
  type ResourcesAlbumCardFrameProps,
} from "./resources-album-card-frame";
import type { ResourcesContext } from "./resources-context";

//------------------------------------------------------------------------------
// Resources Album Card Paginated Extra
//------------------------------------------------------------------------------

export type ResourcesAlbumCardPaginatedExtra<
  R extends Resource,
  L extends LocalizedResource<R>,
> = {
  AlbumCardContent: React.FC<StackProps & { localizedResource: L }>;
  getDetails: (localizedResource: L) => string;
};

//------------------------------------------------------------------------------
// Create Resources Album Card Paginated
//------------------------------------------------------------------------------

export type ResourcesAlbumCardPaginatedProps<
  R extends Resource,
  L extends LocalizedResource<R>,
> = Omit<
  ResourcesAlbumCardFrameProps,
  "campaignName" | "campaignPage" | "campaignRole" | "contentRef" | "name"
> & {
  localizedResource: L;
};

export default function createResourcesAlbumCardPaginated<
  R extends Resource,
  L extends LocalizedResource<R>,
  F extends ResourceFilters,
  DBR extends DBResource,
  DBT extends DBResourceTranslation,
>(
  _store: ResourceStore<R, L, F, DBR, DBT>,
  _context: ResourcesContext<R>,
  { AlbumCardContent, getDetails }: ResourcesAlbumCardPaginatedExtra<R, L>,
) {
  return function ResourcesAlbumCardPaginated({
    localizedResource,
    zoom,
    ...rest
  }: ResourcesAlbumCardPaginatedProps<R, L>) {
    const paragraphs = useMemo(() => {
      return localizedResource ? getDetails(localizedResource).split("\n") : [];
    }, [localizedResource]);

    const paragraphToProcessIndexRef = useRef(paragraphs.length);

    const [pages, setPages] = useState<
      {
        ref: React.RefObject<HTMLDivElement | null>;
        paragraphs: string[];
      }[]
    >([{ paragraphs: [], ref: createRef<HTMLDivElement>() }]);

    useLayoutEffect(() => {
      paragraphToProcessIndexRef.current = 0;
      setPages([{ paragraphs: [], ref: createRef<HTMLDivElement>() }]);
    }, [paragraphs]);

    useLayoutEffect(() => {
      if (paragraphs.length === 0) return;
      if (paragraphToProcessIndexRef.current >= paragraphs.length) return;

      const lastPage = pages[pages.length - 1]!;
      const lastPageEl = lastPage.ref.current;
      const overflow =
        !!lastPageEl &&
        lastPageEl.scrollHeight * (zoom ?? 1) >
          lastPageEl.clientHeight * (zoom ?? 1) + 1;

      if (overflow) {
        if (lastPage.paragraphs.length > 1) {
          const lastParagraph = lastPage.paragraphs.at(-1)!;
          setPages([
            ...dropLast(pages),
            { ...lastPage, paragraphs: dropLast(lastPage.paragraphs) },
            { paragraphs: [lastParagraph], ref: createRef() },
          ]);
          return;
        }

        setPages([...pages, { paragraphs: [], ref: createRef() }]);
        return;
      }

      const paragraph = paragraphs[paragraphToProcessIndexRef.current]!;
      setPages([
        ...dropLast(pages),
        { ...lastPage, paragraphs: [...lastPage.paragraphs, paragraph] },
      ]);

      paragraphToProcessIndexRef.current++;
    }, [pages, paragraphs, zoom]);

    return (
      <>
        {pages.map((page, pageIndex) => (
          <ResourcesAlbumCardFrame
            campaignName={localizedResource.campaign}
            campaignPage={localizedResource.page}
            campaignRole={localizedResource._raw.visibility}
            contentRef={page.ref}
            key={pageIndex}
            name={localizedResource.name}
            zoom={zoom}
            {...rest}
          >
            {pageIndex === 0 && (
              <AlbumCardContent
                borderBottomWidth={AlbumCard.size0}
                borderColor="border.emphasized"
                gap={0}
                localizedResource={localizedResource}
                separator={<AlbumCard.SeparatorH />}
                w="full"
              />
            )}

            <AlbumCard.Description paragraphs={page.paragraphs} />
          </ResourcesAlbumCardFrame>
        ))}
      </>
    );
  };
}
