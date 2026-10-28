import type { ReactNode } from "react";

//------------------------------------------------------------------------------
// Rich Text Block Pattern
//------------------------------------------------------------------------------

export type RichTextBlockPattern = {
  regex: RegExp;
  render: (match: string) => ReactNode | undefined;
};

//------------------------------------------------------------------------------
// Rich Text Block Segment
//------------------------------------------------------------------------------

export type RichTextBlockSegment =
  | { type: "rendered"; value: ReactNode }
  | { type: "text"; value: string };

//------------------------------------------------------------------------------
// Render Rich Text Blocks
//------------------------------------------------------------------------------

export function renderRichTextBlocks(
  text: string,
  patterns: RichTextBlockPattern[],
): RichTextBlockSegment[] {
  const matches = patterns.flatMap((pattern, patternIndex) =>
    [...text.matchAll(createGlobalRegex(pattern.regex))].flatMap((match) =>
      match.index === undefined
        ? []
        : [
            {
              end: match.index + match[0].length,
              match: match[0],
              pattern,
              patternIndex,
              start: match.index,
            },
          ],
    ),
  );
  matches.sort((a, b) => a.start - b.start || a.patternIndex - b.patternIndex);

  const segments: RichTextBlockSegment[] = [];
  let lastIndex = 0;

  for (const candidate of matches) {
    if (candidate.start < lastIndex) continue;

    const rendered = candidate.pattern.render(candidate.match);
    if (rendered === undefined) continue;

    if (candidate.start > lastIndex) {
      segments.push({ type: "text", value: text.slice(lastIndex, candidate.start) });
    }
    segments.push({ type: "rendered", value: rendered });
    lastIndex = candidate.end;
  }

  if (lastIndex < text.length || segments.length === 0) {
    segments.push({ type: "text", value: text.slice(lastIndex) });
  }

  return segments;
}

//------------------------------------------------------------------------------
// Create Global Regex
//------------------------------------------------------------------------------

function createGlobalRegex(regex: RegExp): RegExp {
  return new RegExp(regex.source, regex.flags.includes("g") ? regex.flags : `${regex.flags}g`);
}
