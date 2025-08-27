import {
  HStack,
  Span,
  Table,
  type TableRootProps,
  VStack,
} from "@chakra-ui/react";
import { ChevronDownIcon } from "lucide-react";
import { type ReactNode, useCallback, useState } from "react";
import Checkbox from "./checkbox";
import IconButton from "./icon-button";
import RichText from "./rich-text";

//------------------------------------------------------------------------------
// Data Table
//------------------------------------------------------------------------------

export type DataTableColumn<T extends { id: string }> =
  Table.ColumnHeaderProps & {
    filter?: boolean;
    key: keyof T;
    label: string;
  };

export type DataTableProps<T extends { id: string }> = Omit<
  TableRootProps,
  "children"
> & {
  columns: DataTableColumn<T>[];
  expandedKey?: keyof T;
  rows: T[];
};

export default function DataTable<T extends { id: string }>({
  columns,
  expandedKey,
  rows,
  ...rest
}: DataTableProps<T>) {
  return (
    <Table.ScrollArea w="full">
      <Table.Root
        interactive
        showColumnBorder
        stickyHeader
        variant="line"
        {...rest}
      >
        <Table.Header>
          <Table.Row
            boxShadow="0px 0.5px 0px var(--shadow-color)"
            boxShadowColor="border"
          >
            {columns.map(({ filter, key, label, ...rest }) => {
              return (
                <Table.ColumnHeader
                  {...tableCellProps}
                  key={String(key)}
                  overflow="hidden"
                  textOverflow="ellipsis"
                  whiteSpace="nowrap"
                  {...rest}
                >
                  {filter ? (
                    <HStack justify="space-between" w="full">
                      {label}
                      <IconButton
                        Icon={ChevronDownIcon}
                        size="xs"
                        variant="ghost"
                      />
                    </HStack>
                  ) : (
                    label
                  )}
                </Table.ColumnHeader>
              );
            })}
          </Table.Row>
        </Table.Header>

        <Table.Body>
          {rows.map((row) => (
            <TableRow
              columns={columns}
              expandedKey={expandedKey}
              key={row.id}
              row={row}
            />
          ))}
        </Table.Body>
      </Table.Root>
    </Table.ScrollArea>
  );
}

//------------------------------------------------------------------------------
// Table Row
//------------------------------------------------------------------------------

function TableRow<T extends { id: string }>({
  columns,
  expandedKey,
  row,
}: {
  columns: DataTableColumn<T>[];
  expandedKey?: keyof T;
  row: T;
}) {
  const [expanded, setExpanded] = useState(expandedTableRows.has(row.id));

  const toggleExpanded = useCallback(() => {
    if (expandedKey)
      setExpanded((prevExpanded) => {
        const nextExpanded = !prevExpanded;
        if (nextExpanded) expandedTableRows.add(row.id);
        else expandedTableRows.delete(row.id);
        return nextExpanded;
      });
  }, [expandedKey, row.id]);

  return (
    <>
      <Table.Row key={row.id} onClick={toggleExpanded}>
        {columns.map(({ key, ...rest }) => {
          const value = row[key];
          return typeof value === "boolean" ? (
            <Table.Cell {...tableCellProps} textAlign="center" {...rest}>
              <Checkbox checked={value} disabled size="sm" />
            </Table.Cell>
          ) : (
            <Table.Cell
              {...tableCellProps}
              overflow="hidden"
              textOverflow="ellipsis"
              whiteSpace="nowrap"
              {...rest}
            >
              {/* <abbr title={String(value)}>{String(value)}</abbr> */}
              {String(value)}
            </Table.Cell>
          );
        })}
      </Table.Row>
      {expandedKey && expanded && (
        <Table.Row bgColor="bg.muted" w="full">
          <Table.Cell colSpan={columns.length}>
            <VStack align="flex-start" gap={1} w="full">
              {String(row[expandedKey])
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
// Table Cell Props
//------------------------------------------------------------------------------

const tableCellProps = {
  h: "3em",
  py: 0,
};

//------------------------------------------------------------------------------
// Expanded Table Rows
//------------------------------------------------------------------------------

const expandedTableRows = new Set<string>();

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
