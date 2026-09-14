import { Badge, Box, Menu, Portal, Theme, VStack } from "@chakra-ui/react";
import { EditIcon, EllipsisVerticalIcon, PrinterIcon, SaveIcon } from "lucide-react";
import { useCallback, useMemo, useRef, useState } from "react";
import { useI18nLang } from "~/i18n/i18n-lang";
import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import { translate } from "~/i18n/i18n-string";
import SquareCheckIcon from "~/icons/square-check-icon";
import SquareIcon from "~/icons/square-icon";
import { useSourceEditable } from "~/models/catalogue/catalogue";
import { printDeck } from "~/models/print-deck/print-deck-store";
import type { LocalizedResource } from "~/models/resources/localized-resource";
import type { Resource } from "~/models/resources/resource";
import type { ResourceFilters } from "~/models/resources/resource-filters";
import type { ResourceStore } from "~/models/resources/resource-store";
import { localizedResourceUnionSchema } from "~/models/resources/resource-union";
import Icon from "~/ui/icon";
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

export type ResourceCardInteractiveExtra<R extends Resource, L extends LocalizedResource<R>> = {
  AlbumCard: React.FC<
    Omit<ResourcePokerCardProps<R, L>, "afterDetails" | "beforeDetails" | "firstPageInfo">
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

export type ResourceCardInteractiveProps<R extends Resource, L extends LocalizedResource<R>> = {
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
>(
  store: ResourceStore<R, L, F>,
  context: ResourcesContext<R>,
  extra: ResourceCardInteractiveExtra<R, L>,
) {
  const { useResource, useResourceSelection, useResourceSelectionMethods } = store;

  const AlbumCard = extra.AlbumCard;
  const { useCardMode, usePaletteName, useShowImage } = context;

  function ResourcesAlbumCardInteractive({
    localizeResource,
    palette = defaultPalette,
    resourceId,
    zoom,
  }: ResourceCardInteractiveProps<R, L>) {
    const { lang, t } = useI18nLangContext(i18nContext);
    const [resource] = useResource(resourceId);
    const sourceEditable = useSourceEditable(resource.source_id);
    const paletteName = usePaletteName();
    const localizedResource = useMemo(
      () => localizeResource(resource),
      [localizeResource, resource],
    );
    const visibleActions =
      extra.actions?.filter(({ isVisible }) => !isVisible || isVisible(localizedResource._raw)) ??
      [];

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
      if (!sourceEditable) return;
      if (localizedResource) context.setEditedResource(localizedResource._raw);
    }, [localizedResource, sourceEditable]);

    const addToPrintDeck = useCallback(() => {
      printDeck.addEntry({
        lang,
        localized_resource: localizedResourceUnionSchema.parse(localizedResource),
        palette_name: paletteName,
      });

      toaster.info({
        description: localizedResource.name,
        title: t("print_deck.added"),
      });
    }, [lang, localizedResource, paletteName, t]);

    const makePersistent = useCallback(async () => {
      const error = await store.makeResourcePersistent(localizedResource.id);
      return error
        ? toaster.error({
            description: t("persistent.error.description"),
            title: t("persistent.error.title"),
          })
        : toaster.info({
            description: localizedResource.name,
            title: t("persistent.done"),
          });
    }, [localizedResource.id, localizedResource.name, t]);

    return (
      <Box
        className="group"
        h={`${AlbumCard.h}in`}
        onPointerDown={
          cardMode === "paginated"
            ? (e) => {
                pointerDownRef.current = { x: e.clientX, y: e.clientY };
              }
            : undefined
        }
        onPointerUp={
          cardMode === "paginated"
            ? (e) => {
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
              {t("temporary")}
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
            {sourceEditable && (
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
                tooltipPositioning={{ placement: "right" }}
              />
            )}

            <Menu.Root ids={{ trigger: `actions-${resourceId}` }}>
              <Menu.Trigger asChild>
                <IconButton
                  Icon={EllipsisVerticalIcon}
                  _disabled={{ bgColor: "fg.subtle", opacity: 1 }}
                  className="light"
                  label={t("actions")}
                  onPointerDown={(e) => {
                    e.stopPropagation();
                  }}
                  size="2xs"
                  tooltipIds={{ trigger: `actions-${resourceId}` }}
                  tooltipPositioning={{ placement: "right" }}
                />
              </Menu.Trigger>

              <Portal>
                <Menu.Positioner>
                  <Menu.Content>
                    <Menu.Item onSelect={addToPrintDeck} value="print-deck-add">
                      <Icon Icon={PrinterIcon} size="xs" />
                      {t("print_deck.add")}
                    </Menu.Item>

                    {sourceEditable && localizedResource._raw.virtual && (
                      <Menu.Item onSelect={makePersistent} value="make-persistent">
                        <Icon Icon={SaveIcon} size="xs" />
                        {t("persistent.make")}
                      </Menu.Item>
                    )}

                    {sourceEditable &&
                      visibleActions.map((action, i) => {
                        const ActionIcon = action.icon;
                        return (
                          <Menu.Item
                            disabled={action.isDisabled?.(localizedResource._raw)}
                            key={i}
                            onSelect={() => {
                              if (action.isDisabled?.(localizedResource._raw)) return;
                              void action.onClick(localizedResource._raw);
                            }}
                            value={`action-${i}`}
                          >
                            <Icon Icon={ActionIcon} size="xs" />
                            {translate(action.label, lang)}
                          </Menu.Item>
                        );
                      })}
                  </Menu.Content>
                </Menu.Positioner>
              </Portal>
            </Menu.Root>
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
    const [resource] = useResource(resourceId);
    const name = translate(resource.name, lang);

    return <AlbumCard.Placeholder name={name} palette={palette} zoom={zoom} />;
  }

  ResourcesAlbumCardInteractive.Placeholder = ResourcesAlbumCardInteractivePlaceholder;
  ResourcesAlbumCardInteractive.h = AlbumCard.h;
  ResourcesAlbumCardInteractive.w = AlbumCard.w;

  return ResourcesAlbumCardInteractive;
}

//------------------------------------------------------------------------------
// I18n Context
//------------------------------------------------------------------------------

const i18nContext = {
  "actions": {
    en: "Actions",
    it: "Azioni",
  },
  "edit": {
    en: "Edit",
    it: "Modifica",
  },
  "persistent.done": {
    en: "Resource made persistent",
    it: "Risorsa resa persistente",
  },
  "persistent.error.description": {
    en: "The resource could not be made persistent.",
    it: "La risorsa non può essere resa persistente.",
  },
  "persistent.error.title": {
    en: "Persistence failed",
    it: "Persistenza fallita",
  },
  "persistent.make": {
    en: "Make persistent",
    it: "Rendi persistente",
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
  "temporary": {
    en: "Temporary",
    it: "Temporanea",
  },
};
