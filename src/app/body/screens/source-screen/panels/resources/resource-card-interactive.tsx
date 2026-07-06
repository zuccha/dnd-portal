import { Badge, Box, Theme, VStack } from "@chakra-ui/react";
import { EditIcon, PrinterIcon } from "lucide-react";
import { useCallback, useMemo, useRef, useState } from "react";
import { useI18nLang } from "~/i18n/i18n-lang";
import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import { translate } from "~/i18n/i18n-string";
import SquareCheckIcon from "~/icons/square-check-icon";
import SquareIcon from "~/icons/square-icon";
import { printDeck } from "~/models/print-deck/print-deck-store";
import type {
  DBResource,
  DBResourceTranslation,
} from "~/models/resources/db-resource";
import type { LocalizedResource } from "~/models/resources/localized-resource";
import type { Resource } from "~/models/resources/resource";
import type { ResourceFilters } from "~/models/resources/resource-filters";
import type { ResourceStore } from "~/models/resources/resource-store";
import { localizedResourceUnionSchema } from "~/models/resources/resource-union";
import IconButton from "~/ui/icon-button";
import PokerCard from "~/ui/poker-card";
import { toaster } from "~/ui/toaster";
import { clamp } from "~/utils/math";
import { type Palette, defaultPalette } from "~/utils/palette";
import type {
  ResourcePokerCardPlaceholderProps,
  ResourcePokerCardProps,
} from "./resource-poker-card";
import type { ResourcesContext } from "./resources-context";
import type { ResourceAction } from "./resources-table-row";

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
  > & {
    Placeholder: React.FC<ResourcePokerCardPlaceholderProps>;
    h: number;
    w: number;
  };
  actions?: ResourceAction<R>[];
};

//------------------------------------------------------------------------------
// Create Resource Card Interactive
//------------------------------------------------------------------------------

export type ResourceCardInteractiveProps<
  R extends Resource,
  L extends LocalizedResource<R>,
> = {
  editable?: boolean;
  localizeResource: (resource: R) => L;
  palette?: Palette;
  resourceId: string;
  zoom?: number;
};

export type ResourceCardInteractivePlaceholderProps = {
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
    useResource,
    useResourceLookup,
    useResourceSelection,
    useResourceSelectionMethods,
  } = store;

  const AlbumCard = extra.AlbumCard;
  const { useCardMode, usePaletteName, useShowImage } = context;

  function ResourcesAlbumCardInteractive({
    editable,
    localizeResource,
    palette = defaultPalette,
    resourceId,
    zoom,
  }: ResourceCardInteractiveProps<R, L>) {
    const { lang, t } = useI18nLangContext(i18nContext);
    const [resource] = useResource(resourceId);
    const paletteName = usePaletteName();
    const localizedResource = useMemo(
      () => localizeResource(resource),
      [localizeResource, resource],
    );
    const visibleActions =
      extra.actions?.filter(
        ({ isVisible }) => !isVisible || isVisible(localizedResource._raw),
      ) ?? [];

    const cardMode = useCardMode();
    const [selectedPageIndex, setSelectedPageIndex] = useState(0);
    const pageCountRef = useRef(0);
    const handlePageCountChange = useCallback((count: number | undefined) => {
      pageCountRef.current = count ?? 0;
    }, []);

    const showImage = useShowImage();

    const pointerDownRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

    const cycleLeft = useCallback(() => {
      setSelectedPageIndex((prev) => {
        const last = Math.max(0, pageCountRef.current - 1);
        const next = prev > 0 ? prev - 1 : last;
        return clamp(next, 0, last);
      });
    }, []);

    const cycleRight = useCallback(() => {
      setSelectedPageIndex((prev) => {
        const count = pageCountRef.current;
        if (count <= 0) return prev;
        return (prev + 1) % count;
      });
    }, []);

    const selected = useResourceSelection(resourceId);
    const { setResourceSelection } = useResourceSelectionMethods(resourceId);

    const edit = useCallback(() => {
      if (localizedResource) context.setEditedResource(localizedResource._raw);
    }, [localizedResource]);

    const addToPrintDeck = useCallback(() => {
      printDeck.addEntry({
        lang,
        localized_resource:
          localizedResourceUnionSchema.parse(localizedResource),
        palette_name: paletteName,
      });

      toaster.info({
        description: localizedResource.name,
        title: t("print_deck.added"),
      });
    }, [lang, localizedResource, paletteName, t]);

    return (
      <Box
        className="group"
        h={`${AlbumCard.h}in`}
        onPointerDown={
          cardMode === "paginated" ?
            (e) => {
              pointerDownRef.current = { x: e.clientX, y: e.clientY };
            }
          : undefined
        }
        onPointerUp={
          cardMode === "paginated" ?
            (e) => {
              const dx = Math.abs(e.clientX - pointerDownRef.current.x);
              const dy = Math.abs(e.clientY - pointerDownRef.current.y);
              const selection = window.getSelection()?.toString() ?? "";
              if (selection) return;
              if (dx > 4 || dy > 4) return;
              const el = e.currentTarget;
              const rect = el.getBoundingClientRect();
              const isLeft = e.clientX < rect.left + rect.width / 2;
              if (isLeft) cycleLeft();
              else cycleRight();
            }
          : undefined
        }
        position="relative"
        w={`${AlbumCard.w}in`}
        zoom={zoom}
      >
        <AlbumCard
          left={0}
          localizedResource={localizedResource}
          mode={cardMode}
          onPageCountChange={handlePageCountChange}
          palette={palette}
          position="absolute"
          selectedPageIndex={selectedPageIndex}
          showImage={showImage}
          top={0}
        />
        <Theme appearance="light">
          {localizedResource._raw.virtual && (
            <Badge
              colorPalette="orange"
              position="absolute"
              right="50%"
              size="xs"
              top={0}
              transform="translate(50%, -50%)"
              variant="solid"
              zIndex={1}
            >
              {t("variant")}
            </Badge>
          )}
          <VStack
            _groupHover={{ visibility: "visible" }}
            gap={1}
            left={PokerCard.rem0500}
            position="absolute"
            top={PokerCard.rem0500}
            visibility="hidden"
            zIndex={2}
          >
            {editable && !localizedResource._raw.virtual && (
              <IconButton
                Icon={EditIcon}
                _disabled={{ bgColor: "fg.subtle", opacity: 1 }}
                className="light"
                label={t("edit")}
                onPointerDown={(e) => {
                  e.stopPropagation();
                  edit();
                }}
                size="2xs"
              />
            )}

            {visibleActions.map((action, i) => (
              <IconButton
                Icon={action.icon}
                _disabled={{ bgColor: "fg.subtle", opacity: 1 }}
                className="light"
                disabled={action.isDisabled?.(localizedResource._raw)}
                key={i}
                label={translate(action.label, lang)}
                onPointerDown={(e) => {
                  e.stopPropagation();
                  if (action.isDisabled?.(localizedResource._raw)) return;
                  action.onClick(localizedResource._raw);
                }}
                size="2xs"
              />
            ))}

            <IconButton
              Icon={PrinterIcon}
              _disabled={{ bgColor: "fg.subtle", opacity: 1 }}
              className="light"
              label={t("print_deck.add")}
              onPointerDown={(e) => {
                e.stopPropagation();
                addToPrintDeck();
              }}
              size="2xs"
            />
          </VStack>

          <IconButton
            Icon={selected ? SquareCheckIcon : SquareIcon}
            _disabled={{ bgColor: "fg.subtle", opacity: 1 }}
            _groupHover={{ visibility: "visible" }}
            label={selected ? t("selection.deselect") : t("selection.select")}
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

  function ResourcesAlbumCardInteractivePlaceholder({
    palette = defaultPalette,
    resourceId,
    zoom,
  }: ResourceCardInteractivePlaceholderProps) {
    const [lang] = useI18nLang();
    const [lookup] = useResourceLookup(resourceId);
    const name = translate(lookup.name, lang);

    return <AlbumCard.Placeholder name={name} palette={palette} zoom={zoom} />;
  }

  ResourcesAlbumCardInteractive.Placeholder =
    ResourcesAlbumCardInteractivePlaceholder;
  ResourcesAlbumCardInteractive.h = AlbumCard.h;
  ResourcesAlbumCardInteractive.w = AlbumCard.w;

  return ResourcesAlbumCardInteractive;
}

//------------------------------------------------------------------------------
// I18n Context
//------------------------------------------------------------------------------

const i18nContext = {
  "edit": {
    en: "Edit",
    it: "Modifica",
  },
  "print_deck.add": {
    en: "Add to print deck",
    it: "Aggiungi al mazzo di stampa",
  },
  "print_deck.added": {
    en: "Added to print deck",
    it: "Aggiunto al mazzo di stampa",
  },
  "selection.deselect": {
    en: "Deselect",
    it: "Deseleziona",
  },
  "selection.select": {
    en: "Select",
    it: "Seleziona",
  },
  "variant": {
    en: "Variant",
    it: "Variante",
  },
};
