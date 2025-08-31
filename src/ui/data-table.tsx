import { Span, Table, type TableRootProps, VStack } from "@chakra-ui/react";
import { type ReactNode, useCallback, useState } from "react";
import Checkbox from "./checkbox";
import RichText from "./rich-text";

//------------------------------------------------------------------------------
// Data Table
//------------------------------------------------------------------------------

export type DataTableColumn<T extends { id: string }> =
  Table.ColumnHeaderProps & {
    key: keyof T;
    label: string;
  };

export type DataTableProps<T extends { id: string }> = Omit<
  TableRootProps,
  "children"
> & {
  RowWrapper?: React.FC<{
    children: (selected: boolean, toggleSelected: () => void) => ReactNode;
    id: string;
  }>;
  columns: DataTableColumn<T>[];
  expandedKey?: keyof T;
  rows: T[];
};

export default function DataTable<T extends { id: string }>({
  RowWrapper = ({ children }) => children(false, () => {}),
  columns,
  expandedKey,
  rows,
  ...rest
}: DataTableProps<T>) {
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
        <Table.Row>
          <Table.ColumnHeader textAlign="center" w="4em">
            <Checkbox checked={false} size="sm" />
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
      </Table.Header>

      <Table.Body>
        {rows.map((row) => (
          <RowWrapper id={row.id} key={row.id}>
            {(selected, toggleSelected) => (
              <TableRow
                columns={columns}
                expandedKey={expandedKey}
                onToggleSelected={toggleSelected}
                row={row}
                selected={selected}
              />
            )}
          </RowWrapper>
        ))}
      </Table.Body>
    </Table.Root>
  );
}

//------------------------------------------------------------------------------
// Table Row
//------------------------------------------------------------------------------

function TableRow<T extends { id: string }>({
  columns,
  expandedKey,
  onToggleSelected,
  row,
  selected,
}: {
  columns: DataTableColumn<T>[];
  expandedKey?: keyof T;
  onToggleSelected: () => void;
  row: T;
  selected: boolean;
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
        <Table.Cell textAlign="center" w="4em">
          <Checkbox
            checked={selected}
            onClick={(e) => {
              e.stopPropagation();
              onToggleSelected();
            }}
            size="sm"
          />
        </Table.Cell>

        {columns.map(({ key, ...rest }) => {
          const value = row[key];
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
