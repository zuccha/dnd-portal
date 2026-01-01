import { type StackProps } from "@chakra-ui/react";
import { createRef, useLayoutEffect, useRef, useState } from "react";
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
  onPageCountChange: (count: number | undefined) => void;
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
    onPageCountChange,
    zoom,
    ...rest
  }: ResourcesAlbumCardPaginatedProps<R, L>) {
    const changePageCountRef = useRef(onPageCountChange);

    const detailsRef = useRef("");
    const renderCountRef = useRef(0);

    const [pages, setPages] = useState<
      {
        ref: React.RefObject<HTMLDivElement | null>;
        text: string;
        textTemp: string;
      }[]
    >([{ ref: createRef<HTMLDivElement>(), text: "", textTemp: "" }]);

    useLayoutEffect(() => {
      changePageCountRef.current = onPageCountChange;
    }, [onPageCountChange]);

    useLayoutEffect(() => {
      changePageCountRef.current(undefined);
      detailsRef.current = getDetails(localizedResource);
      setPages([{ ref: createRef<HTMLDivElement>(), text: "", textTemp: "" }]);
    }, [localizedResource]);

    useLayoutEffect(() => {
      if (renderCountRef.current > 50) {
        renderCountRef.current = 0;
        requestAnimationFrame(() => setPages([...pages]));
        return;
      }

      renderCountRef.current++;

      const lastPage = pages[pages.length - 1]!;
      const element = lastPage.ref.current;
      if (!element) return changePageCountRef.current(undefined);
      const overflow = element.scrollHeight > element.clientHeight;

      if (overflow) {
        let [left, right] = split(lastPage.textTemp);
        if (!left) [left, right] = [right, ""];

        if (right.length > 1) {
          setPages([...dropLast(pages), { ...lastPage, textTemp: left }]);
          detailsRef.current = right + detailsRef.current;
        } else {
          setPages([
            ...dropLast(pages),
            { ...lastPage, textTemp: "" },
            {
              ref: createRef(),
              text: "",
              textTemp: lastPage.textTemp + detailsRef.current,
            },
          ]);
          detailsRef.current = "";
        }
      } else if (detailsRef.current.length) {
        setPages([
          ...dropLast(pages),
          {
            ...lastPage,
            text: lastPage.text + lastPage.textTemp,
            textTemp: detailsRef.current,
          },
        ]);
        detailsRef.current = "";
      } else {
        changePageCountRef.current(pages.length);
      }
    }, [pages]);

    return pages.map((page, pageIndex) => (
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

        <AlbumCard.Description
          paragraphs={(page.text + page.textTemp)
            .split(/[\r\n]/)
            .map((paragraph) => paragraph.trim())}
        />
      </ResourcesAlbumCardFrame>
    ));
  };
}

function split(text: string): [string, string] {
  const center = Math.ceil(text.length / 2);
  let left = center - 1;
  let right = center;
  while (0 <= left || right < text.length) {
    if (/\s/.test(text[right] ?? ""))
      return [text.slice(0, right), text.slice(right)];
    if (/\s/.test(text[left] ?? ""))
      return [text.slice(0, left), text.slice(left)];
    left--;
    right++;
  }
  return [text.slice(0, center), text.slice(center)];
}
