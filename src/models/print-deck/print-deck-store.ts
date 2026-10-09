import { createMemoryStore } from "~/store/memory-store";
import { type PaletteName } from "~/utils/palette";
import { createUuid } from "~/utils/uuid";
import { loadPrintDeck, savePrintDeck } from "./print-deck-indexed-db";
import type { PrintDeckEntry, PrintDeckEntryInput } from "./print-deck-entry";

export type { PrintDeckEntry, PrintDeckEntryInput } from "./print-deck-entry";

//------------------------------------------------------------------------------
// Print Deck Store
//------------------------------------------------------------------------------

const printDeckStore = createMemoryStore<PrintDeckEntry[]>("print_deck", []);
let hasLocalChanges = false;
let persistence = Promise.resolve();

void loadPrintDeck().then((entries) => {
  if (!hasLocalChanges) printDeckStore.set(entries);
});

//------------------------------------------------------------------------------
// Persist Print Deck
//------------------------------------------------------------------------------

function persistPrintDeck(entries: PrintDeckEntry[]): void {
  persistence = persistence.then(() => savePrintDeck(entries));
}

//------------------------------------------------------------------------------
// Set Print Deck
//------------------------------------------------------------------------------

function setPrintDeck(update: Parameters<typeof printDeckStore.set>[0]): void {
  hasLocalChanges = true;
  const entries = printDeckStore.set(update);
  persistPrintDeck(entries);
}

//------------------------------------------------------------------------------
// Add Entries
//------------------------------------------------------------------------------

function addEntries(entries: PrintDeckEntryInput[]): string[] {
  const ids: string[] = [];
  setPrintDeck((prev) => [
    ...prev,
    ...entries.map((entry) => {
      const id = createUuid();
      ids.push(id);
      return { ...structuredClone(entry), id };
    }),
  ]);
  return ids;
}

//------------------------------------------------------------------------------
// Add Entry
//------------------------------------------------------------------------------

function addEntry(entry: PrintDeckEntryInput): string {
  const id = createUuid();
  setPrintDeck((prev) => [...prev, { ...structuredClone(entry), id }]);
  return id;
}

//------------------------------------------------------------------------------
// Clear Entries
//------------------------------------------------------------------------------

function clearEntries(): void {
  setPrintDeck((prev) => (prev.length ? [] : prev));
}

//------------------------------------------------------------------------------
// Duplicate Entry
//------------------------------------------------------------------------------

function duplicateEntry(entryId: string): string | undefined {
  const id = createUuid();
  let duplicated = false;

  setPrintDeck((prev) => {
    const index = prev.findIndex((entry) => entry.id === entryId);
    if (index < 0) return prev;

    const duplicate = { ...structuredClone(prev[index]!), id };
    const entries = [...prev.slice(0, index + 1), duplicate, ...prev.slice(index + 1)];
    duplicated = true;
    return entries;
  });

  return duplicated ? id : undefined;
}

//------------------------------------------------------------------------------
// Get Entry
//------------------------------------------------------------------------------

function getEntry(entryId: string): PrintDeckEntry | undefined {
  return printDeckStore.get().find((entry) => entry.id === entryId);
}

//------------------------------------------------------------------------------
// Move Entry
//------------------------------------------------------------------------------

function moveEntry(entryId: string, toIndex: number): void {
  setPrintDeck((prev) => {
    const fromIndex = prev.findIndex((entry) => entry.id === entryId);
    if (fromIndex < 0) return prev;

    const nextIndex = Math.max(0, Math.min(toIndex, prev.length - 1));
    if (fromIndex === nextIndex) return prev;

    const entries = [...prev];
    const [entry] = entries.splice(fromIndex, 1);
    entries.splice(nextIndex, 0, entry!);
    return entries;
  });
}

//------------------------------------------------------------------------------
// Remove Entry
//------------------------------------------------------------------------------

function removeEntry(entryId: string): void {
  setPrintDeck((prev) => {
    const entries = prev.filter((entry) => entry.id !== entryId);
    return entries.length === prev.length ? prev : entries;
  });
}

//------------------------------------------------------------------------------
// Set Entry Palette
//------------------------------------------------------------------------------

function setEntryPalette(entryId: string, paletteName: PaletteName): void {
  setPrintDeck((prev) => {
    const index = prev.findIndex((entry) => entry.id === entryId);
    if (index < 0) return prev;

    const entries = [...prev];
    entries[index] = { ...prev[index]!, palette_name: paletteName };
    return entries;
  });
}

//------------------------------------------------------------------------------
// Update Entry
//------------------------------------------------------------------------------

function updateEntry(entryId: string, nextEntry: PrintDeckEntry): void {
  setPrintDeck((prev) => {
    const index = prev.findIndex((entry) => entry.id === entryId);
    if (index < 0) return prev;

    const entries = [...prev];
    entries[index] = structuredClone(nextEntry);
    return entries;
  });
}

//------------------------------------------------------------------------------
// Print Deck
//------------------------------------------------------------------------------

export const printDeck = {
  addEntries,
  addEntry,
  clearEntries,
  duplicateEntry,
  getEntry,
  moveEntry,
  removeEntry,
  setEntryPalette,
  updateEntry,
  useEntries: printDeckStore.useValue,
};
