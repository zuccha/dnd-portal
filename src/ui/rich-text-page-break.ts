import type { RichTextBlockPattern } from "./rich-text-block-pattern";

//------------------------------------------------------------------------------
// Rich Text Page Break Delimiter
//------------------------------------------------------------------------------

export const richTextPageBreakDelimiter = ":::page-break:::";

//------------------------------------------------------------------------------
// Rich Text Page Break RegExp
//------------------------------------------------------------------------------

export const richTextPageBreakRegExp = /\s*:::page-break:::\s*/;

//------------------------------------------------------------------------------
// Rich Text Page Break Block Pattern
//------------------------------------------------------------------------------

export const richTextPageBreakBlockPattern: RichTextBlockPattern = {
  regex: richTextPageBreakRegExp,
  render: () => null,
};

//------------------------------------------------------------------------------
// Preserve Rich Text Page Breaks
//------------------------------------------------------------------------------

export function preserveRichTextPageBreaks(text: string): string {
  return text.replace(new RegExp(richTextPageBreakRegExp.source, "g"), richTextPageBreakDelimiter);
}

//------------------------------------------------------------------------------
// Replace Rich Text Page Breaks With Newlines
//------------------------------------------------------------------------------

export function replaceRichTextPageBreaksWithNewlines(text: string): string {
  return text.replace(new RegExp(richTextPageBreakRegExp.source, "g"), "\n");
}
