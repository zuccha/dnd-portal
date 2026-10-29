//------------------------------------------------------------------------------
// Rich Text Page
//------------------------------------------------------------------------------

type RichTextMarker = "bold" | "heading" | "italic";

export type RichTextPageState = RichTextMarker[];

//------------------------------------------------------------------------------
// Rich Text Delimiters
//------------------------------------------------------------------------------

export const richTextBoldDelimiter = "**";
export const richTextHeadingDelimiter = "##";
export const richTextItalicDelimiter = "__";

//------------------------------------------------------------------------------
// Rich Text Utils
//------------------------------------------------------------------------------

export const bold = (text: string) => `${richTextBoldDelimiter}${text}${richTextBoldDelimiter}`;

export const heading = (text: string) =>
  `${richTextHeadingDelimiter}${text}${richTextHeadingDelimiter}`;

export const italic = (text: string) =>
  `${richTextItalicDelimiter}${text}${richTextItalicDelimiter}`;

//------------------------------------------------------------------------------
// Rich Text RegExps
//------------------------------------------------------------------------------

export const richTextBoldRegExp = /\*\*(.+?)\*\*/;
export const richTextHeadingRegExp = /##(.+?)##/;
export const richTextItalicRegExp = /__(.+?)__/;

//------------------------------------------------------------------------------
// Empty Rich Text Page State
//------------------------------------------------------------------------------

export const emptyRichTextPageState: RichTextPageState = [];

//------------------------------------------------------------------------------
// Close Rich Text Page
//------------------------------------------------------------------------------

export function closeRichTextPage(
  text: string,
  initialState: RichTextPageState,
): { state: RichTextPageState; text: string } {
  const state = readRichTextPageState(text, initialState);
  const prefix = formatOpeningMarkers(initialState);
  const suffix = formatClosingMarkers(state);

  return { state, text: `${prefix}${text}${suffix}` };
}

//------------------------------------------------------------------------------
// Return Rich Text Page State
//------------------------------------------------------------------------------

function readRichTextPageState(text: string, initialState: RichTextPageState): RichTextPageState {
  const state = [...initialState];

  for (let i = 0; i < text.length; ++i) {
    if (text.startsWith(richTextHeadingDelimiter, i)) {
      toggleMarker(state, "heading");
      i++;
    } else if (text.startsWith(richTextBoldDelimiter, i)) {
      toggleMarker(state, "bold");
      i++;
    } else if (text[i] === richTextItalicDelimiter) {
      toggleMarker(state, "italic");
    }
  }

  return state;
}

//------------------------------------------------------------------------------
// Toggle Marker
//------------------------------------------------------------------------------

function toggleMarker(state: RichTextPageState, marker: RichTextMarker): void {
  if (state[state.length - 1] === marker) state.pop();
  else state.push(marker);
}

//------------------------------------------------------------------------------
// Format Opening Markers
//------------------------------------------------------------------------------

function formatOpeningMarkers(state: RichTextPageState): string {
  return state.map(formatMarker).join("");
}

//------------------------------------------------------------------------------
// Format Closing Markers
//------------------------------------------------------------------------------

function formatClosingMarkers(state: RichTextPageState): string {
  return [...state].reverse().map(formatMarker).join("");
}

//------------------------------------------------------------------------------
// Format Marker
//------------------------------------------------------------------------------

function formatMarker(marker: RichTextMarker): string {
  if (marker === "bold") return richTextBoldDelimiter;
  if (marker === "heading") return richTextHeadingDelimiter;
  return richTextItalicDelimiter;
}
