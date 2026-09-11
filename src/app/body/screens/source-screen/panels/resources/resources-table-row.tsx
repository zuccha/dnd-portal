import {
  Badge,
  Box,
  HStack,
  Menu,
  Portal,
  Table,
  VStack,
  createIcon,
} from "@chakra-ui/react";
import {
  ChevronDownIcon,
  ChevronRightIcon,
  EditIcon,
  EllipsisVerticalIcon,
  EyeClosedIcon,
  EyeIcon,
  type LucideIcon,
  PrinterIcon,
  SaveIcon,
} from "lucide-react";
import { useCallback, useMemo } from "react";
import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import { type I18nString, translate } from "~/i18n/i18n-string";
import { resolveSystemText, useI18nSystem } from "~/i18n/i18n-system";
import catalogue from "~/models/catalogue/catalogue";
import { printDeck } from "~/models/print-deck/print-deck-store";
import type { LocalizedResource } from "~/models/resources/localized-resource";
import type { Resource } from "~/models/resources/resource";
import type { ResourceFilters } from "~/models/resources/resource-filters";
import type { ResourceStore } from "~/models/resources/resource-store";
import { localizedResourceUnionSchema } from "~/models/resources/resource-union";
import Checkbox from "~/ui/checkbox";
import Icon from "~/ui/icon";
import IconButton from "~/ui/icon-button";
import Link from "~/ui/link";
import RichText from "~/ui/rich-text";
import { toaster } from "~/ui/toaster";
import type { ResourcesContext } from "./resources-context";

//------------------------------------------------------------------------------
// Resources Table Row Extra
//------------------------------------------------------------------------------

export type ResourceAction<R extends Resource> = {
  icon: LucideIcon | ReturnType<typeof createIcon>;
  isDisabled?: (resource: R) => boolean;
  isVisible: (resource: R) => boolean;
  label: I18nString;
  onClick: (resource: R) => void | Promise<void>;
};

export type ResourcesTableRowExtra<
  R extends Resource,
  L extends LocalizedResource<R>,
> = {
  actions?: ResourceAction<R>[];
  columns: (Table.ColumnHeaderProps & {
    icon?: LucideIcon | ReturnType<typeof createIcon>;
    key: keyof L;
    label: I18nString;
  })[];
  detailsKey?: keyof L;
};

//------------------------------------------------------------------------------
// Create Resources Table Row
//------------------------------------------------------------------------------

type ResourcesTableRowProps<
  R extends Resource,
  L extends LocalizedResource<R>,
> = {
  localizeResource: (resource: R) => L;
  resourceId: string;
};

export function createResourcesTableRow<
  R extends Resource,
  L extends LocalizedResource<R>,
  F extends ResourceFilters,
>(
  store: ResourceStore<R, L, F>,
  context: ResourcesContext<R>,
  extra: ResourcesTableRowExtra<R, L>,
) {
  const { useResource, useResourceSelection, useResourceSelectionMethods } =
    store;

  const { usePaletteName, useResourceExpansion } = context;

  return function ResourcesTableRow({
    localizeResource,
    resourceId,
  }: ResourcesTableRowProps<R, L>) {
    const { lang, t } = useI18nLangContext(i18nContext);
    const [system] = useI18nSystem();

    const [resource] = useResource(resourceId);
    const activeSourceId = catalogue.useActiveSourceId();
    const activeSourceEditable = catalogue.useSourceEditable(activeSourceId);
    const sourceEditable = catalogue.useSourceEditable(resource.source_id);
    const paletteName = usePaletteName();
    const localizedResource = useMemo(
      () => localizeResource(resource),
      [localizeResource, resource],
    );
    const selected = useResourceSelection(resourceId);
    const { toggleResourceSelection } = useResourceSelectionMethods(resourceId);
    const expanded = useResourceExpansion(resourceId, false);
    const details =
      extra.detailsKey && localizedResource[extra.detailsKey] ?
        resolveSystemText(String(localizedResource[extra.detailsKey]), system)
      : "";
    const visibleActions =
      extra.actions?.filter((action) =>
        action.isVisible(localizedResource._raw),
      ) ?? [];

    const edit = useCallback(
      (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!sourceEditable) return;
        if (localizedResource)
          context.setEditedResource(localizedResource._raw);
      },
      [localizedResource, sourceEditable],
    );

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

    const makePersistent = useCallback(async () => {
      const error = await store.makeResourcePersistent(localizedResource.id);
      return error ?
          toaster.error({
            description: t("persistent.error.description"),
            title: t("persistent.error.title"),
          })
        : toaster.info({
            description: localizedResource.name,
            title: t("persistent.done"),
          });
    }, [localizedResource.id, localizedResource.name, t]);

    const toggleSelection = useCallback(
      (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        toggleResourceSelection();
      },
      [toggleResourceSelection],
    );

    const toggleExpansion = useCallback(
      (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (!extra.detailsKey) return;
        context.setResourceExpansion(resourceId, false, (prev) => !prev);
      },
      [resourceId],
    );

    const hasActions = true;
    const columnCount =
      extra.columns.length +
      3 +
      (activeSourceEditable ? 1 : 0) +
      (hasActions ? 1 : 0);

    return (
      <>
        <Table.Row>
          <Table.Cell textAlign="center" w="3em">
            <IconButton
              Icon={expanded ? ChevronDownIcon : ChevronRightIcon}
              disabled={!extra.detailsKey}
              label={expanded ? t("collapse") : t("expand")}
              onClick={toggleExpansion}
              size="2xs"
              variant="ghost"
            />
          </Table.Cell>

          <Table.Cell textAlign="center" w="4em">
            <Checkbox
              mt={0.5}
              onClick={toggleSelection}
              size="sm"
              value={selected}
            />
          </Table.Cell>

          <Table.Cell textAlign="center" w="3em">
            <Icon
              Icon={
                localizedResource._raw.visibility === "public" ?
                  EyeIcon
                : EyeClosedIcon
              }
              color="fg.muted"
              size="sm"
            />
          </Table.Cell>

          {extra.columns.map(({ key, ...rest }) => {
            const value = localizedResource[key];
            return (
              <Table.Cell
                key={String(key)}
                overflow="hidden"
                textOverflow="ellipsis"
                whiteSpace="nowrap"
                {...rest}
              >
                {key === "name" ?
                  <HStack gap={2} minW={0}>
                    {localizedResource._raw.virtual && (
                      <Badge colorPalette="orange" size="xs" variant="solid">
                        {translate({ en: "Temporary", it: "Temporanea" }, lang)}
                      </Badge>
                    )}
                    {sourceEditable ?
                      <Link onClick={edit}>{String(value)}</Link>
                    : String(value)}
                  </HStack>
                : typeof value === "boolean" ?
                  <Checkbox disabled mt={0.5} size="sm" value={value} />
                : String(value) || "-"}
              </Table.Cell>
            );
          })}

          {activeSourceEditable && (
            <Table.Cell textAlign="center" w="3em">
              {sourceEditable && (
                <IconButton
                  Icon={EditIcon}
                  label={t("edit")}
                  onClick={edit}
                  size="2xs"
                  variant="ghost"
                />
              )}
            </Table.Cell>
          )}

          {hasActions && (
            <Table.Cell textAlign="center" w="1%" whiteSpace="nowrap">
              <Menu.Root ids={{ trigger: `actions-${resourceId}` }}>
                <Menu.Trigger asChild>
                  <IconButton
                    Icon={EllipsisVerticalIcon}
                    label={t("actions")}
                    size="2xs"
                    tooltipIds={{ trigger: `actions-${resourceId}` }}
                    variant="ghost"
                  />
                </Menu.Trigger>

                <Portal>
                  <Menu.Positioner>
                    <Menu.Content>
                      <Menu.Item
                        onSelect={addToPrintDeck}
                        value="print-deck-add"
                      >
                        <Icon Icon={PrinterIcon} size="xs" />
                        {t("print_deck.add")}
                      </Menu.Item>

                      {sourceEditable && localizedResource._raw.virtual && (
                        <Menu.Item
                          onSelect={makePersistent}
                          value="make-persistent"
                        >
                          <Icon Icon={SaveIcon} size="xs" />
                          {t("persistent.make")}
                        </Menu.Item>
                      )}

                      {sourceEditable &&
                        visibleActions.map((action, i) => {
                          const ActionIcon = action.icon;
                          return (
                            <Menu.Item
                              disabled={action.isDisabled?.(
                                localizedResource._raw,
                              )}
                              key={i}
                              onSelect={() => {
                                if (
                                  !action.isDisabled?.(localizedResource._raw)
                                )
                                  action.onClick(localizedResource._raw);
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
            </Table.Cell>
          )}
        </Table.Row>

        {extra.detailsKey && expanded && (
          <Table.Row bgColor="bg.muted" w="full">
            <Table.Cell colSpan={columnCount}>
              <Box contain="inline-size" w="full">
                <VStack align="flex-start" gap={1} minW={0} w="full">
                  {details ?
                    details
                      .split(/[\n\r]/)
                      .map((paragraph, i) => (
                        <RichText
                          display="block"
                          key={i}
                          overflowWrap="anywhere"
                          text={paragraph}
                          whiteSpace="normal"
                        />
                      ))
                  : <RichText
                      display="block"
                      overflowWrap="anywhere"
                      text={translate(
                        { en: "_No details._", it: "_Nessuna descrizione._" },
                        lang,
                      )}
                      whiteSpace="normal"
                    />
                  }
                </VStack>
              </Box>
            </Table.Cell>
          </Table.Row>
        )}
      </>
    );
  };
}

//------------------------------------------------------------------------------
// I18n Context
//------------------------------------------------------------------------------

const i18nContext = {
  "actions": {
    en: "Actions",
    it: "Azioni",
  },
  "collapse": {
    en: "Collapse",
    it: "Comprimi",
  },
  "edit": {
    en: "Edit",
    it: "Modifica",
  },
  "expand": {
    en: "Expand",
    it: "Espandi",
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
};
