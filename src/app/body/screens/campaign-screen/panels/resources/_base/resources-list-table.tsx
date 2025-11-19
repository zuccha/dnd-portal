import {
  Box,
  Em,
  Span,
  Table,
  type TableRootProps,
  VStack,
} from "@chakra-ui/react";
import { EyeClosedIcon, EyeIcon, type LucideIcon } from "lucide-react";
import { type ReactNode, useCallback, useState } from "react";
import { useI18nLang } from "../../../../../../../i18n/i18n-lang";
import {
  type I18nString,
  translate,
} from "../../../../../../../i18n/i18n-string";
import type { LocalizedResource } from "../../../../../../../resources/localized-resource";
import type { Resource } from "../../../../../../../resources/resource";
import Checkbox from "../../../../../../../ui/checkbox";
import Icon from "../../../../../../../ui/icon";
import Link from "../../../../../../../ui/link";
import RichText from "../../../../../../../ui/rich-text";
import ResourcesListEmpty from "./resources-list-empty";

//----------------------------------------------------------------------------
// Resources List Table
//----------------------------------------------------------------------------

export type ResourcesListTableColumn<
  R extends Resource,
  L extends LocalizedResource<R>,
> = Table.ColumnHeaderProps & {
  icon?: LucideIcon;
  key: keyof L;
  label: I18nString;
};

export type ResourcesListTableProps<
  R extends Resource,
  L extends LocalizedResource<R>,
> = Omit<TableRootProps, "children"> & {
  Header: React.FC;
  Row: React.FC<{ localizedResource: L }>;
  localizedResources: L[];
};

export default function ResourcesListTable<
  R extends Resource,
  L extends LocalizedResource<R>,
>({ Header, Row, localizedResources, ...rest }: ResourcesListTableProps<R, L>) {
  return (
    <Box bgColor="bg.subtle" w="full">
      {localizedResources.length ?
        <Table.Root
          borderCollapse="separate"
          borderSpacing={0}
          showColumnBorder
          stickyHeader
          variant="line"
          {...rest}
        >
          <Table.Header>
            <Header />
          </Table.Header>

          <Table.Body>
            {localizedResources.map((localizedResource) => (
              <Row
                key={localizedResource.id}
                localizedResource={localizedResource}
              />
            ))}
          </Table.Body>
        </Table.Root>
      : <ResourcesListEmpty />}
    </Box>
  );
}

ResourcesListTable.Header = ResourcesListTableHeader;
ResourcesListTable.Row = ResourcesListTableRow;

//------------------------------------------------------------------------------
// Expanded Table Rows
//------------------------------------------------------------------------------

const expandedRows = new Set<string>();

//------------------------------------------------------------------------------
// Resources List Table Header
//------------------------------------------------------------------------------

type ResourceListTableHeaderProps<
  R extends Resource,
  L extends LocalizedResource<R>,
> = {
  columns: ResourcesListTableColumn<R, L>[];
  localizedResources: L[];
  onDeselect: (id: string) => void;
  onSelect: (id: string) => void;
  selectedLocalizedResourcesCount: number;
};

function ResourcesListTableHeader<
  R extends Resource,
  L extends LocalizedResource<R>,
>({
  columns,
  localizedResources,
  onDeselect,
  onSelect,
  selectedLocalizedResourcesCount,
}: ResourceListTableHeaderProps<R, L>) {
  const [lang] = useI18nLang();

  const selected =
    selectedLocalizedResourcesCount === localizedResources.length ? true
    : selectedLocalizedResourcesCount > 0 ? "-"
    : false;

  const toggleSelected = useCallback(() => {
    if (selected === true)
      localizedResources.forEach(({ id }) => onDeselect(id));
    else localizedResources.forEach(({ id }) => onSelect(id));
  }, [localizedResources, onDeselect, onSelect, selected]);

  return (
    <Table.Row>
      <Table.ColumnHeader textAlign="center" w="4em">
        <Checkbox checked={selected} onClick={toggleSelected} size="sm" />
      </Table.ColumnHeader>

      <Table.ColumnHeader textAlign="center" w="3em">
        <Icon Icon={EyeIcon} color="fg.muted" size="sm" />
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
            {icon ?
              <Icon Icon={icon} size="sm" />
            : translate(label, lang)}
          </Table.ColumnHeader>
        );
      })}
    </Table.Row>
  );
}

//----------------------------------------------------------------------------
// Resources List Table Row
//----------------------------------------------------------------------------

export type ResourcesListTableRowProps<
  R extends Resource,
  L extends LocalizedResource<R>,
> = {
  canEdit: boolean;
  columns: ResourcesListTableColumn<R, L>[];
  descriptionKey?: keyof L;
  localizedResource: L;
  onOpen: (resource: R) => void;
  onToggleSelected: (resource: R) => void;
  selected: boolean;
};

function ResourcesListTableRow<
  R extends Resource,
  L extends LocalizedResource<R>,
>({
  canEdit,
  columns,
  descriptionKey,
  localizedResource,
  onOpen,
  onToggleSelected,
  selected,
}: ResourcesListTableRowProps<R, L>) {
  const [expanded, setExpanded] = useState(
    expandedRows.has(localizedResource.id),
  );

  const toggleExpanded = useCallback(() => {
    if (descriptionKey)
      setExpanded((prevExpanded) => {
        const nextExpanded = !prevExpanded;
        if (nextExpanded) expandedRows.add(localizedResource.id);
        else expandedRows.delete(localizedResource.id);
        return nextExpanded;
      });
  }, [descriptionKey, localizedResource.id]);

  const columnCount = canEdit ? columns.length + 2 : columns.length + 1;

  return (
    <>
      <Table.Row key={localizedResource.id} onClick={toggleExpanded}>
        <Table.Cell textAlign="center" w="4em">
          <Checkbox
            checked={selected}
            onClick={(e) => {
              e.stopPropagation();
              onToggleSelected(localizedResource._raw);
            }}
            size="sm"
          />
        </Table.Cell>

        <Table.Cell textAlign="center" w="3em">
          <Icon
            Icon={
              localizedResource._raw.visibility === "player" ?
                EyeIcon
              : EyeClosedIcon
            }
            color="fg.muted"
            size="sm"
          />
        </Table.Cell>

        {columns.map(({ key, ...rest }) => {
          const value = localizedResource[key];
          return (
            <Table.Cell
              key={key}
              overflow="hidden"
              textOverflow="ellipsis"
              whiteSpace="nowrap"
              {...rest}
            >
              {key === "name" && canEdit ?
                <Link
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpen(localizedResource._raw);
                  }}
                >
                  {String(value)}
                </Link>
              : typeof value === "boolean" ?
                <Checkbox checked={value} disabled size="sm" />
              : String(value)}
            </Table.Cell>
          );
        })}
      </Table.Row>

      {descriptionKey && expanded && (
        <Table.Row bgColor="bg.muted" w="full">
          <Table.Cell colSpan={columnCount}>
            <VStack align="flex-start" gap={1} w="full">
              {String(localizedResource[descriptionKey])
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

//------------------------------------------------------------------------------
// Expansion Patterns
//------------------------------------------------------------------------------

const expansionPatterns = [
  {
    regex: /^\s*#\s*(.+?)$/,
    render: (val: ReactNode) => (
      <Span fontSize="lg" fontVariant="small-caps">
        {val}
      </Span>
    ),
  },
  {
    regex: /\*\*(.+?)\*\*/,
    render: (val: ReactNode) => <b>{val}</b>,
  },
  {
    regex: /_(.+?)_/,
    render: (val: ReactNode) => <Em>{val}</Em>,
  },
];
