//------------------------------------------------------------------------------
// Rich Text Page
//------------------------------------------------------------------------------

type RichTextMarker = "bold" | "heading" | "italic";

export type RichTextPageState = RichTextMarker[];

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

function readRichTextPageState(
  text: string,
  initialState: RichTextPageState,
): RichTextPageState {
  const state = [...initialState];

  for (let i = 0; i < text.length; ++i) {
    if (text.startsWith("##", i)) {
      toggleMarker(state, "heading");
      i++;
    } else if (text.startsWith("**", i)) {
      toggleMarker(state, "bold");
      i++;
    } else if (text[i] === "_") {
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
  if (marker === "bold") return "**";
  if (marker === "heading") return "##";
  return "_";
}
