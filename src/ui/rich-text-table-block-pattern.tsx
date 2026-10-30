import type { Palette } from "~/utils/palette";
import { RichTextTable } from "./rich-text-table";
import { parseRichTextTable, richTextTableBlockRegex } from "./rich-text-table-parser";
import type { RichTextBlockPattern } from "./rich-text-block-pattern";
import type { ReactNode } from "react";

//------------------------------------------------------------------------------
// Rich Text Table Block Pattern Props
//------------------------------------------------------------------------------

type RichTextTableBlockPatternProps = {
  mode: "card" | "grid";
  palette?: Palette;
  renderCell: (value: string) => ReactNode;
};

//------------------------------------------------------------------------------
// Create Rich Text Table Block Pattern
//------------------------------------------------------------------------------

export function createRichTextTableBlockPattern({
  mode,
  palette,
  renderCell,
}: RichTextTableBlockPatternProps): RichTextBlockPattern {
  return {
    regex: richTextTableBlockRegex,
    render: (match) => {
      const table = parseRichTextTable(match);
      if (!table) return undefined;

      return (
        <RichTextTable
          alignments={table.alignments}
          flex_columns={table.flex_columns}
          mode={mode}
          name={table.name}
          palette={palette}
          renderCell={renderCell}
          rows={table.rows}
        />
      );
    },
  };
}
