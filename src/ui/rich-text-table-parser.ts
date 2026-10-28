//------------------------------------------------------------------------------
// Rich Text Table Alignment
//------------------------------------------------------------------------------

export type RichTextTableAlignment = "center" | "left" | "right";

//------------------------------------------------------------------------------
// Table Column Marker
//------------------------------------------------------------------------------

type TableColumnMarker = {
  alignment: RichTextTableAlignment;
  flex: boolean;
};

//------------------------------------------------------------------------------
// Rich Text Table Block
//------------------------------------------------------------------------------

export type RichTextTableBlock = {
  alignments: RichTextTableAlignment[];
  flex_columns: boolean[];
  rows: string[][];
  type: "table";
};

//------------------------------------------------------------------------------
// Rich Text Table Pattern
//------------------------------------------------------------------------------

export const richTextTableBlockRegex = /^:::table[ \t]*\r?\n[\s\S]*?\r?\n:::[ \t]*$/m;

//------------------------------------------------------------------------------
// Parse Rich Text Table
//------------------------------------------------------------------------------

export function parseRichTextTable(source: string): RichTextTableBlock | undefined {
  const content = /^:::table[ \t]*\r?\n([\s\S]*?)\r?\n:::[ \t]*$/.exec(source)?.[1];
  if (content === undefined) return undefined;

  const parsedRows = content
    .split(/\r?\n/)
    .filter((row) => row.trim())
    .map((row) => row.split("||").map((cell) => cell.trim()));
  const parsedColumnLayout = parseAlignmentRow(parsedRows[1] ?? []);
  const columnLayout =
    parsedColumnLayout?.alignments.length === parsedRows[0]?.length
      ? parsedColumnLayout
      : undefined;
  const rows = columnLayout ? [parsedRows[0]!, ...parsedRows.slice(2)] : parsedRows;
  if (!isValidTable(rows)) return undefined;

  return {
    alignments: columnLayout?.alignments ?? rows[0]!.map(() => "left"),
    flex_columns: columnLayout?.flex_columns ?? rows[0]!.map(() => false),
    rows,
    type: "table",
  };
}

//------------------------------------------------------------------------------
// Parse Alignment Row
//------------------------------------------------------------------------------

function parseAlignmentRow(
  cells: string[],
): { alignments: RichTextTableAlignment[]; flex_columns: boolean[] } | undefined {
  const markers = cells.map(parseColumnMarker);
  if (markers.some((marker) => !marker)) return undefined;

  return {
    alignments: markers.map((marker) => marker!.alignment),
    flex_columns: markers.map((marker) => marker!.flex),
  };
}

//------------------------------------------------------------------------------
// Parse Column Marker
//------------------------------------------------------------------------------

function parseColumnMarker(cell: string): TableColumnMarker | undefined {
  const markdownMarker = /^(:)?-{3,}(:)?(\*)?$/.exec(cell);
  if (markdownMarker) {
    return {
      alignment: getMarkerAlignment(markdownMarker[1], markdownMarker[2]),
      flex: Boolean(markdownMarker[3]),
    };
  }

  const flexMarker = /^flex(?::(left|center|right))?$/i.exec(cell);
  if (flexMarker) {
    const alignment = flexMarker[1]?.toLowerCase();
    return {
      alignment:
        alignment === "center" || alignment === "right" || alignment === "left"
          ? alignment
          : "left",
      flex: true,
    };
  }

  return undefined;
}

//------------------------------------------------------------------------------
// Get Marker Alignment
//------------------------------------------------------------------------------

function getMarkerAlignment(
  leftMarker: string | undefined,
  rightMarker: string | undefined,
): RichTextTableAlignment {
  if (leftMarker && rightMarker) return "center";
  if (rightMarker) return "right";
  return "left";
}

//------------------------------------------------------------------------------
// Is Valid Table
//------------------------------------------------------------------------------

function isValidTable(rows: string[][]): boolean {
  const columnCount = rows[0]?.length ?? 0;
  return columnCount > 1 && rows.length > 1 && rows.every((row) => row.length === columnCount);
}
