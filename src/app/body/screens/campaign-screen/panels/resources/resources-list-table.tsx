import { Span, Table, type TableRootProps, VStack } from "@chakra-ui/react";
import { type ReactNode, useCallback, useMemo, useState } from "react";
import type { I18nLangContext } from "../../../../../../i18n/i18n-lang";
import { useI18nLangContext } from "../../../../../../i18n/i18n-lang-context";
import type {
  Resource,
  ResourceFilters,
  ResourceStore,
  ResourceTranslation,
} from "../../../../../../resources/resource";
import Checkbox from "../../../../../../ui/checkbox";
import RichText from "../../../../../../ui/rich-text";

//------------------------------------------------------------------------------
// Create Resources List Table
//------------------------------------------------------------------------------

export type ResourcesListTableColumn<
  R extends Resource,
  T extends ResourceTranslation<R>
> = Table.ColumnHeaderProps & {
  key: keyof T;
  label: string;
};

export function createResourcesListTable<
  R extends Resource,
  T extends ResourceTranslation<R>,
  F extends ResourceFilters
>(
  store: ResourceStore<R, F>,
  useTranslations: (campaignId: string) => T[] | undefined,
  useSelectedTranslationsCount: (campaignId: string) => number,
  partialColumns: Omit<ResourcesListTableColumn<R, T>, "label">[],
  columnsI18nContext: I18nLangContext
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
    columns: ResourcesListTableColumn<R, T>[];
  }) {
    const translations = useTranslations(campaignId);
    const count = useSelectedTranslationsCount(campaignId);

    const selected =
      count === translations?.length ? true : count > 0 ? "-" : false;

    const toggleSelected = useCallback(() => {
      if (selected === true)
        translations?.forEach(({ id }) => store.deselect(id));
      else translations?.forEach(({ id }) => store.select(id));
    }, [translations, selected]);

    return (
      <Table.Row>
        <Table.ColumnHeader textAlign="center" w="4em">
          <Checkbox checked={selected} onClick={toggleSelected} size="sm" />
        </Table.ColumnHeader>

        {columns.map(({ key, label, ...rest }) => {
          return (
            <Table.ColumnHeader
              key={String(key)}
              overflow="hidden"
              textOverflow="ellipsis"
              whiteSpace="nowrap"
              {...rest}
            >
              {label}
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
    columns,
    expandedKey,
    translation,
  }: {
    columns: ResourcesListTableColumn<R, T>[];
    expandedKey?: keyof T;
    translation: T;
  }) {
    const [expanded, setExpanded] = useState(expandedRows.has(translation.id));
    const [selected, { toggle }] = useIsSelected(translation.id);

    const toggleExpanded = useCallback(() => {
      if (expandedKey)
        setExpanded((prevExpanded) => {
          const nextExpanded = !prevExpanded;
          if (nextExpanded) expandedRows.add(translation.id);
          else expandedRows.delete(translation.id);
          return nextExpanded;
        });
    }, [expandedKey, translation.id]);

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
                {typeof value === "boolean" ? (
                  <Checkbox checked={value} disabled size="sm" />
                ) : (
                  String(value)
                )}
              </Table.Cell>
            );
          })}
        </Table.Row>

        {expandedKey && expanded && (
          <Table.Row bgColor="bg.muted" w="full">
            <Table.Cell colSpan={columns.length + 1}>
              <VStack align="flex-start" gap={1} w="full">
                {String(translation[expandedKey])
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
    expandedKey,
    ...rest
  }: Omit<TableRootProps, "children"> & {
    campaignId: string;
    expandedKey?: keyof T;
  }) {
    const { t } = useI18nLangContext(columnsI18nContext);
    const translations = useTranslations(campaignId);

    const columns = useMemo(
      () => partialColumns.map((p) => ({ ...p, label: t(`${p.key}`) })),
      [t]
    );

    if (!translations) return null;

    return (
      <Table.Root
        borderCollapse="separate"
        borderSpacing={0}
        showColumnBorder
        stickyHeader
        variant="line"
        {...rest}
      >
        <Table.Header>
          <ResourcesListTableHeader campaignId={campaignId} columns={columns} />
        </Table.Header>

        <Table.Body>
          {translations.map((translation) => (
            <ResourcesListTableRow
              columns={columns}
              expandedKey={expandedKey}
              key={translation.id}
              translation={translation}
            />
          ))}
        </Table.Body>
      </Table.Root>
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
