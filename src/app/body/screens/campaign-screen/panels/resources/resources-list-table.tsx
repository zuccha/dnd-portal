import {
  Box,
  Span,
  Table,
  type TableRootProps,
  VStack,
} from "@chakra-ui/react";
import type { LucideIcon } from "lucide-react";
import { type ReactNode, useCallback, useMemo, useState } from "react";
import type { I18nLangContext } from "../../../../../../i18n/i18n-lang";
import { useI18nLangContext } from "../../../../../../i18n/i18n-lang-context";
import { useIsGM } from "../../../../../../resources/campaign-role";
import type {
  DBResource,
  DBResourceTranslation,
  LocalizedResource,
  Resource,
  ResourceFilters,
  ResourceStore,
} from "../../../../../../resources/resource";
import type { StoreUpdater } from "../../../../../../store/store";
import Checkbox from "../../../../../../ui/checkbox";
import Icon from "../../../../../../ui/icon";
import Link from "../../../../../../ui/link";
import RichText from "../../../../../../ui/rich-text";
import ResourcesListEmpty from "./resources-list-empty";

//------------------------------------------------------------------------------
// Create Resources List Table
//------------------------------------------------------------------------------

export type ResourcesListTableColumn<
  R extends Resource,
  L extends LocalizedResource<R>
> = Table.ColumnHeaderProps & {
  icon?: LucideIcon;
  key: keyof L;
  label: string;
};

export function createResourcesListTable<
  R extends Resource,
  DBR extends DBResource,
  DBT extends DBResourceTranslation,
  F extends ResourceFilters,
  L extends LocalizedResource<R>
>(
  store: ResourceStore<R, DBR, DBT, F>,
  useLocalizedResources: (campaignId: string) => L[] | undefined,
  useSelectedLocalizedResourcesCount: (campaignId: string) => number,
  useSetEditedResource: (campaignId: string) => StoreUpdater<R | undefined>,
  partialColumns: Omit<ResourcesListTableColumn<R, L>, "label">[],
  columnsI18nContext: I18nLangContext,
  expansionKey: keyof L | undefined
) {
  //----------------------------------------------------------------------------
  // Hooks
  //----------------------------------------------------------------------------

  const { useIsSelected } = store;

  //----------------------------------------------------------------------------
  // Expanded Table Rows
  //----------------------------------------------------------------------------

  const expandedRows = new Set<string>();

  //----------------------------------------------------------------------------
  // Resources List Table Header
  //----------------------------------------------------------------------------

  function ResourcesListTableHeader({
    campaignId,
    columns,
  }: {
    campaignId: string;
    columns: ResourcesListTableColumn<R, L>[];
  }) {
    const localizedResources = useLocalizedResources(campaignId);
    const count = useSelectedLocalizedResourcesCount(campaignId);

    const selected =
      count === localizedResources?.length ? true : count > 0 ? "-" : false;

    const toggleSelected = useCallback(() => {
      if (selected === true)
        localizedResources?.forEach(({ id }) => store.deselect(id));
      else localizedResources?.forEach(({ id }) => store.select(id));
    }, [localizedResources, selected]);

    return (
      <Table.Row>
        <Table.ColumnHeader textAlign="center" w="4em">
          <Checkbox checked={selected} onClick={toggleSelected} size="sm" />
        </Table.ColumnHeader>

        {columns.map(({ icon, key, label, ...rest }) => {
          return (
            <Table.ColumnHeader
              key={String(key)}
              overflow="hidden"
              textOverflow="ellipsis"
              whiteSpace="nowrap"
              {...rest}
            >
              {icon ? <Icon Icon={icon} size="sm" /> : label}
            </Table.ColumnHeader>
          );
        })}
      </Table.Row>
    );
  }

  //----------------------------------------------------------------------------
  // Resources List Table Row
  //----------------------------------------------------------------------------

  function ResourcesListTableRow({
    campaignId,
    columns,
    translation,
  }: {
    campaignId: string;
    columns: ResourcesListTableColumn<R, L>[];
    translation: L;
  }) {
    const [expanded, setExpanded] = useState(expandedRows.has(translation.id));
    const [selected, { toggle }] = useIsSelected(translation.id);
    const setEditedResource = useSetEditedResource(campaignId);
    const isGM = useIsGM(campaignId);

    const toggleExpanded = useCallback(() => {
      if (expansionKey)
        setExpanded((prevExpanded) => {
          const nextExpanded = !prevExpanded;
          if (nextExpanded) expandedRows.add(translation.id);
          else expandedRows.delete(translation.id);
          return nextExpanded;
        });
    }, [translation.id]);

    return (
      <>
        <Table.Row key={translation.id} onClick={toggleExpanded}>
          <Table.Cell textAlign="center" w="4em">
            <Checkbox
              checked={selected}
              onClick={(e) => {
                e.stopPropagation();
                toggle();
              }}
              size="sm"
            />
          </Table.Cell>

          {columns.map(({ key, ...rest }) => {
            const value = translation[key];
            return (
              <Table.Cell
                key={key}
                overflow="hidden"
                textOverflow="ellipsis"
                whiteSpace="nowrap"
                {...rest}
              >
                {key === "name" && isGM ? (
                  <Link
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditedResource(translation._raw);
                    }}
                  >
                    {String(value)}
                  </Link>
                ) : typeof value === "boolean" ? (
                  <Checkbox checked={value} disabled size="sm" />
                ) : (
                  String(value)
                )}
              </Table.Cell>
            );
          })}
        </Table.Row>

        {expansionKey && expanded && (
          <Table.Row bgColor="bg.muted" w="full">
            <Table.Cell colSpan={columns.length + 1}>
              <VStack align="flex-start" gap={1} w="full">
                {String(translation[expansionKey])
                  .split("\n")
                  .map((paragraph, i) => (
                    <RichText
                      key={i}
                      patterns={expansionPatterns}
                      text={paragraph}
                    />
                  ))}
              </VStack>
            </Table.Cell>
          </Table.Row>
        )}
      </>
    );
  }

  //----------------------------------------------------------------------------
  // Resources List Table
  //----------------------------------------------------------------------------

  return function ResourcesListTable({
    campaignId,
    ...rest
  }: Omit<TableRootProps, "children"> & { campaignId: string }) {
    const { t } = useI18nLangContext(columnsI18nContext);
    const translations = useLocalizedResources(campaignId);

    const columns = useMemo(
      () => partialColumns.map((p) => ({ ...p, label: t(`${p.key}`) })),
      [t]
    );

    if (!translations) return null;

    return (
      <Box bgColor="bg.subtle" w="full">
        {translations.length ? (
          <Table.Root
            borderCollapse="separate"
            borderSpacing={0}
            showColumnBorder
            stickyHeader
            variant="line"
            {...rest}
          >
            <Table.Header>
              <ResourcesListTableHeader
                campaignId={campaignId}
                columns={columns}
              />
            </Table.Header>

            <Table.Body>
              {translations.map((translation) => (
                <ResourcesListTableRow
                  campaignId={campaignId}
                  columns={columns}
                  key={translation.id}
                  translation={translation}
                />
              ))}
            </Table.Body>
          </Table.Root>
        ) : (
          <ResourcesListEmpty />
        )}
      </Box>
    );
  };
}

//------------------------------------------------------------------------------
// Expansion Patterns
//------------------------------------------------------------------------------

const expansionPatterns = [
  {
    regex: /\*\*(.+?)\*\*/,
    render: (val: ReactNode) => <Span fontWeight="bold">{val}</Span>,
  },
  {
    regex: /_(.+?)_/,
    render: (val: ReactNode) => <Span fontStyle="italic">{val}</Span>,
  },
];
