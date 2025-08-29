import Konva from "konva";
import type { LayoutItemText } from "../models/layout";

//------------------------------------------------------------------------------
// Types
//------------------------------------------------------------------------------

export type TextFont = {
  family: string;
  size: number;
  style?: "normal" | "bold" | "italic" | "bold italic";
  transform?: "none" | "capitalize" | "lowercase" | "uppercase";
};

export type TextSymbol = { path: string; shadow: boolean };

export type PatternFormatting = {
  color?: string;
  style?: "normal" | "bold" | "italic" | "bold italic";
  transform?: "none" | "capitalize" | "lowercase" | "uppercase";
};

export type TextPattern = {
  delimiter: { close: string; open: string };
  includeDelimiter: boolean;
  formatting: PatternFormatting;
  symbol?: TextSymbol;
};

export type TextChunk = {
  color?: PatternFormatting["color"];
  h: number;
  style: PatternFormatting["style"];
  symbol?: TextSymbol;
  text: string;
  w: number;
  x: number;
  y: number;
};

//------------------------------------------------------------------------------
// Measure Text Chunk
//------------------------------------------------------------------------------

function measureRawText(
  text: string,
  font: TextFont,
  style: PatternFormatting["style"],
  symbol: TextSymbol | undefined,
): number {
  if (symbol) return font.size;
  const textNode = new Konva.Text({
    fontFamily: font.family,
    fontSize: font.size,
    fontStyle: style,
    text,
  });
  return textNode.getTextWidth();
}

//------------------------------------------------------------------------------
// Format Raw Text
//------------------------------------------------------------------------------

function formatRawText(
  text: string,
  font: TextFont,
  formatting: PatternFormatting,
  symbol: TextSymbol | undefined,
): TextChunk[] {
  const chunks: TextChunk[] = [];
  const transform = formatting.transform ?? font.transform;

  const formattedText =
    transform === "lowercase" ? text.toLowerCase()
    : transform === "uppercase" ? text.toUpperCase()
    : text;

  const parts = formattedText.match(/(\n|\r| +|[^ \r\n]+)/g) || [];
  for (const part of parts) {
    const w = measureRawText(part, font, formatting.style, symbol);
    chunks.push({
      color: formatting.color,
      h: font.size,
      style: formatting.style,
      symbol,
      text: part,
      w,
      x: 0,
      y: 0,
    });
  }

  return chunks;
}

//------------------------------------------------------------------------------
// Break Text Chunk
//------------------------------------------------------------------------------

function breakTextChunk(
  chunk: TextChunk,
  font: TextFont,
  maxW: number,
): TextChunk[] {
  if (chunk.w < maxW || chunk.text.length <= 1) return [chunk];

  const { style, symbol } = chunk;
  const middle = Math.floor(chunk.text.length / 2);
  const left = chunk.text.slice(0, middle);
  const right = chunk.text.slice(middle);
  return [
    ...breakTextChunk(
      { ...chunk, text: left, w: measureRawText(left, font, style, symbol) },
      font,
      maxW,
    ),
    ...breakTextChunk(
      { ...chunk, text: right, w: measureRawText(right, font, style, symbol) },
      font,
      maxW,
    ),
  ];
}

//------------------------------------------------------------------------------
// Parse Raw Text Patterns
//------------------------------------------------------------------------------

function parseRawTextPatterns(
  rawParagraph: string,
  font: TextFont,
  patterns: TextPattern[],
): TextChunk[] {
  let cursor = 0;
  const chunks: TextChunk[] = [];

  patterns = patterns.filter(
    (pattern) => pattern.delimiter.open && pattern.delimiter.close,
  );

  while (cursor < rawParagraph.length) {
    let match:
      | { end: number; pattern: TextPattern; start: number }
      | undefined = undefined;

    for (const pattern of patterns) {
      const { close, open } = pattern.delimiter;

      const start = rawParagraph.indexOf(open, cursor);
      if (start === -1) continue;

      const end = rawParagraph.indexOf(close, start + open.length);
      if (end === -1) continue;

      if (!match || start < match.start) match = { end, pattern, start };
    }

    if (!match) {
      const text = rawParagraph.slice(cursor);
      chunks.push(...formatRawText(text, font, {}, undefined));
      break;
    }

    const { end, pattern, start } = match;
    const { close, open } = pattern.delimiter;

    if (start > cursor) {
      const text = rawParagraph.slice(cursor, start);
      chunks.push(...formatRawText(text, font, {}, undefined));
    }

    const text =
      pattern.includeDelimiter ?
        rawParagraph.slice(start, end + close.length)
      : rawParagraph.slice(start + open.length, end);

    chunks.push(
      ...formatRawText(text, font, pattern.formatting, pattern.symbol),
    );

    cursor = end + close.length;
  }

  return chunks;
}

//------------------------------------------------------------------------------
// Parse Raw Text
//------------------------------------------------------------------------------

function parseRawText(
  rawParagraph: string,
  font: TextFont,
  patterns: TextPattern[],
  maxW: number,
  maxH: number,
  lineHeight: number,
  paragraphGap: number,
  sectionGap: number,
  alignH: LayoutItemText["alignH"],
  alignV: LayoutItemText["alignV"],
): [TextChunk[], number] {
  const chunksQueue = parseRawTextPatterns(rawParagraph, font, patterns);
  const chunks: TextChunk[] = [];

  let x = 0;
  let y = 0;

  let lineChunks: TextChunk[] = [];

  const addLine = () => {
    const dw = maxW - x;
    const dx = { center: dw / 2, left: 0, right: dw }[alignH];
    chunks.push(...lineChunks.map((chunk) => ({ ...chunk, x: chunk.x + dx })));
    lineChunks = [];
  };

  while (chunksQueue.length) {
    const chunk = chunksQueue.shift()!;

    if (!chunk.text.length) continue;
    if (x === 0 && /^ +$/.test(chunk.text)) continue;

    if (chunk.text === "\n") {
      addLine();
      x = 0;
      y += font.size + paragraphGap;
    } else if (chunk.text === "\r") {
      addLine();
      x = 0;
      y += font.size + sectionGap;
    } else if (x + chunk.w < maxW || (x === 0 && chunk.text.length <= 1)) {
      lineChunks.push({ ...chunk, x, y });
      x += chunk.w;
    } else {
      addLine();
      chunksQueue.unshift(...breakTextChunk(chunk, font, maxW));
      x = 0;
      y += chunk.h * lineHeight;
    }
  }

  addLine();

  const h = y + font.size;

  const dh = maxH - h;
  const dy = { bottom: dh, middle: dh / 2, top: 0 }[alignV];

  return [chunks.map((chunk) => ({ ...chunk, y: chunk.y + dy })), h];
}

//------------------------------------------------------------------------------
// Parse Raw Text And Adjust Height
//------------------------------------------------------------------------------

export function parseRawTextAndAdjustHeight(
  rawText: string,
  formatting: TextFont,
  patterns: TextPattern[],
  maxW: number,
  maxH: number,
  lineHeight: number,
  paragraphGap: number,
  sectionGap: number,
  alignH: LayoutItemText["alignH"],
  alignV: LayoutItemText["alignV"],
): [TextChunk[], number, number] {
  while (true) {
    const [chunks, h] = parseRawText(
      rawText,
      formatting,
      patterns,
      maxW,
      maxH,
      lineHeight,
      paragraphGap,
      sectionGap,
      alignH,
      alignV,
    );
    if (h <= maxH || formatting.size <= 1) return [chunks, formatting.size, h];
    formatting = { ...formatting, size: formatting.size - 0.1 };
  }
}
