import { Table } from "@chakra-ui/react";
import type { Palette } from "~/utils/palette";
import type { RichTextTableBlock } from "./rich-text-table-parser";
import type { ReactNode } from "react";

//------------------------------------------------------------------------------
// Rich Text Table Props
//------------------------------------------------------------------------------

type RichTextTableProps = {
  alignments: RichTextTableBlock["alignments"];
  flex_columns: RichTextTableBlock["flex_columns"];
  mode: "card" | "grid";
  palette?: Palette;
  renderCell: (value: string) => ReactNode;
  rows: RichTextTableBlock["rows"];
};

//------------------------------------------------------------------------------
// Rich Text Table
//------------------------------------------------------------------------------

export function RichTextTable({
  alignments,
  flex_columns,
  mode,
  palette,
  renderCell,
  rows,
}: RichTextTableProps) {
  const [headers, ...dataRows] = rows;
  if (!headers || !dataRows.length) return null;

  return (
    <Table.Root
      fontSize={mode === "card" ? "0.72em" : undefined}
      tableLayout="auto"
      unstyled
      w="full"
    >
      {flex_columns.some(Boolean) && (
        <Table.ColumnGroup unstyled>
          {flex_columns.map((flex, index) => (
            <Table.Column key={index} unstyled w={flex ? undefined : "1%"} />
          ))}
        </Table.ColumnGroup>
      )}
      <Table.Header unstyled>
        <Table.Row unstyled>
          {headers.map((header, index) => (
            <Table.ColumnHeader
              bg="transparent"
              fontWeight="bold"
              key={index}
              lineHeight={mode === "grid" ? "shorter" : undefined}
              overflowWrap={mode === "card" ? "anywhere" : "normal"}
              px={mode === "card" ? 1 : 2}
              py={mode === "card" ? 0.5 : 1}
              textAlign={alignments[index] ?? "left"}
              unstyled
              verticalAlign="bottom"
              whiteSpace="normal"
            >
              {renderCell(header)}
            </Table.ColumnHeader>
          ))}
        </Table.Row>
      </Table.Header>
      <Table.Body unstyled>
        {dataRows.map((row, rowIndex) => (
          <Table.Row
            bgColor={
              mode === "card"
                ? rowIndex % 2 === 0
                  ? palette?.["50"]
                  : "gray.50"
                : rowIndex % 2 === 0
                  ? "bg.muted"
                  : undefined
            }
            key={rowIndex}
            unstyled
          >
            {row.map((value, cellIndex) => (
              <Table.Cell
                key={cellIndex}
                overflowWrap={mode === "card" ? "anywhere" : "normal"}
                px={mode === "card" ? 1 : 2}
                py={mode === "card" ? 0.5 : 1}
                textAlign={alignments[cellIndex] ?? "left"}
                unstyled
                verticalAlign="top"
              >
                {renderCell(value)}
              </Table.Cell>
            ))}
          </Table.Row>
        ))}
      </Table.Body>
    </Table.Root>
  );
}
