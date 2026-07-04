import { Badge, HStack, Table, VStack, createIcon } from "@chakra-ui/react";
import {
  BookPlusIcon,
  EyeClosedIcon,
  EyeIcon,
  type LucideIcon,
} from "lucide-react";
import { useCallback, useMemo } from "react";
import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import { type I18nString, translate } from "~/i18n/i18n-string";
import { resolveSystemText, useI18nSystem } from "~/i18n/i18n-system";
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
  onClick: (resource: R) => void;
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
  editable: boolean;
  localizeResource: (resource: R) => L;
  resourceId: string;
};

export function createResourcesTableRow<
  R extends Resource,
  L extends LocalizedResource<R>,
  F extends ResourceFilters,
  DBR extends DBResource,
  DBT extends DBResourceTranslation,
>(
  store: ResourceStore<R, L, F, DBR, DBT>,
  context: ResourcesContext<R>,
  extra: ResourcesTableRowExtra<R, L>,
) {
  const { useResource, useResourceSelection, useResourceSelectionMethods } =
    store;

  const { usePaletteName, useResourceExpansion } = context;

  return function ResourcesTableRow({
    editable,
    localizeResource,
    resourceId,
  }: ResourcesTableRowProps<R, L>) {
    const { lang, t } = useI18nLangContext(i18nContext);
    const [system] = useI18nSystem();

    const [resource] = useResource(resourceId);
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
        if (localizedResource)
          context.setEditedResource(localizedResource._raw);
      },
      [localizedResource],
    );

    const addToPrintDeck = useCallback(
      (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

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
      },
      [lang, localizedResource, paletteName, t],
    );

    const toggleSelection = useCallback(
      (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        toggleResourceSelection();
      },
      [toggleResourceSelection],
    );

    const hasActions = true;
    const columnCount =
      extra.columns.length + (editable ? 2 : 1) + (hasActions ? 1 : 0);

    return (
      <>
        <Table.Row
          onClick={() =>
            context.setResourceExpansion(resourceId, false, (prev) => !prev)
          }
        >
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
                        {translate({ en: "Variant", it: "Variante" }, lang)}
                      </Badge>
                    )}
                    {editable && !localizedResource._raw.virtual ?
                      <Link onClick={edit}>{String(value)}</Link>
                    : <span>{String(value) || "-"}</span>}
                  </HStack>
                : typeof value === "boolean" ?
                  <Checkbox disabled mt={0.5} size="sm" value={value} />
                : String(value) || "-"}
              </Table.Cell>
            );
          })}

          {hasActions && (
            <Table.Cell textAlign="center" w="1%" whiteSpace="nowrap">
              <IconButton
                Icon={BookPlusIcon}
                aria-label={t("print_deck.add")}
                onClick={addToPrintDeck}
                size="2xs"
                variant="ghost"
              />

              {visibleActions.map((action, i) => (
                <IconButton
                  Icon={action.icon}
                  aria-label={translate(action.label, lang)}
                  disabled={action.isDisabled?.(localizedResource._raw)}
                  key={i}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (action.isDisabled?.(localizedResource._raw)) return;
                    action.onClick(localizedResource._raw);
                  }}
                  size="2xs"
                  variant="ghost"
                />
              ))}
            </Table.Cell>
          )}
        </Table.Row>

        {extra.detailsKey && expanded && (
          <Table.Row bgColor="bg.muted" w="full">
            <Table.Cell colSpan={columnCount}>
              <VStack align="flex-start" gap={1} w="full">
                {details ?
                  details
                    .split(/[\n\r]/)
                    .map((paragraph, i) => (
                      <RichText key={i} text={paragraph} />
                    ))
                : <RichText
                    text={translate(
                      { en: "_No details._", it: "_Nessuna descrizione._" },
                      lang,
                    )}
                  />
                }
              </VStack>
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
  "print_deck.add": {
    en: "Add to print deck",
    it: "Aggiungi al mazzo di stampa",
  },
  "print_deck.added": {
    en: "Added to print deck",
    it: "Aggiunto al mazzo di stampa",
  },
};
