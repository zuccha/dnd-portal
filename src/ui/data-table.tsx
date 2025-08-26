import { Table, type TableRootProps } from "@chakra-ui/react";
import Checkbox from "./checkbox";

//------------------------------------------------------------------------------
// Data Table
//------------------------------------------------------------------------------

export type DataTableProps<T extends { id: string }> = Omit<
  TableRootProps,
  "children"
> & {
  columns: { key: keyof T; label: string }[];
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
          {columns.map((column) => (
            <Table.ColumnHeader key={String(column.key)}>
              {column.label}
            </Table.ColumnHeader>
          ))}
        </Table.Row>
      </Table.Header>

      <Table.Body>
        {rows.map((row) => {
          return (
            <Table.Row key={row.id}>
              {columns.map((column) => {
                const value = row[column.key];
                return (
                  <Table.Cell key={String(column.key)}>
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
