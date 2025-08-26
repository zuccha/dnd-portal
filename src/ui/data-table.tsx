import { Span, Table, type TableRootProps } from "@chakra-ui/react";
import { useEffect, useRef, useState } from "react";
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
                if (typeof value === "string")
                  return <TableCellString key={key} value={value} {...rest} />;

                if (typeof value === "boolean")
                  return <TableCellBoolean key={key} value={value} {...rest} />;

                return (
                  <Table.Cell key={String(key)} {...rest}>
                    {String(value)}
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

//------------------------------------------------------------------------------
// Table Cell String
//------------------------------------------------------------------------------

function TableCellString({
  value,
  ...rest
}: Omit<Table.CellProps, "children"> & { value: string }) {
  const ref = useRef<HTMLTableCellElement>(null);
  const [overflow, setOverflow] = useState(false);

  useEffect(() => {
    const tableCell = ref.current;
    if (tableCell) setOverflow(tableCell.scrollWidth > tableCell.clientWidth);
  }, [value]);

  return (
    <Table.Cell
      overflow="hidden"
      ref={ref}
      textOverflow="ellipsis"
      whiteSpace="nowrap"
      {...rest}
    >
      {overflow ? <abbr title={value}>{value}</abbr> : value}
    </Table.Cell>
  );
}

//------------------------------------------------------------------------------
//  Table Cell Boolean
//------------------------------------------------------------------------------

function TableCellBoolean({
  value,
  ...rest
}: Omit<Table.CellProps, "children"> & { value: boolean }) {
  return (
    <Table.Cell {...rest}>
      <Checkbox checked={value} disabled size="sm" />
    </Table.Cell>
  );
}
