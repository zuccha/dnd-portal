import { Span, Table, type TableRootProps } from "@chakra-ui/react";
import Checkbox from "./checkbox";

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
  rows: T[];
  stickyHeader?: boolean;
};

export default function DataTable<T extends { id: string }>({
  columns,
  rows,
  stickyHeader,
}: DataTableProps<T>) {
  return (
    <Table.Root>
      <Table.Header position={stickyHeader ? "sticky" : undefined} top={0}>
        <Table.Row
          bgColor="bg.subtle"
          boxShadow="0px 0.5px 0px var(--shadow-color)"
          boxShadowColor="border"
        >
          {columns.map(({ filter, key, label, ...rest }) => {
            return (
              <Table.ColumnHeader
                key={String(key)}
                whiteSpace="nowrap"
                {...rest}
              >
                {filter ? (
                  <Span cursor="pointer" textDecoration="underline dotted">
                    {label}
                  </Span>
                ) : (
                  label
                )}
              </Table.ColumnHeader>
            );
          })}
        </Table.Row>
      </Table.Header>

      <Table.Body>
        {rows.map((row) => {
          return (
            <Table.Row key={row.id}>
              {columns.map(({ key, ...rest }) => {
                const value = row[key];
                return (
                  <Table.Cell
                    key={String(key)}
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
          );
        })}
      </Table.Body>
    </Table.Root>
  );
}
