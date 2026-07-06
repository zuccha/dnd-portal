import { z } from "zod";
import { createLocalStore } from "~/store/local-store";
import { paletteNameSchema } from "~/utils/palette";
import { createUuid } from "~/utils/uuid";
import { localizedResourceUnionSchema } from "../resources/resource-union";

//------------------------------------------------------------------------------
// Print Deck Entry
//------------------------------------------------------------------------------

export const printDeckEntrySchema = z.object({
  id: z.uuid(),
  lang: z.string(),
  localized_resource: localizedResourceUnionSchema,
  palette_name: paletteNameSchema,
});

export type PrintDeckEntry = z.infer<typeof printDeckEntrySchema>;

export type PrintDeckEntryInput = Omit<PrintDeckEntry, "id">;

//------------------------------------------------------------------------------
// Print Deck Store
//------------------------------------------------------------------------------

const printDeckStore = createLocalStore<PrintDeckEntry[]>(
  "print_deck",
  [],
  z.array(printDeckEntrySchema).parse,
);

//------------------------------------------------------------------------------
// Add Entries
//------------------------------------------------------------------------------

function addEntries(entries: PrintDeckEntryInput[]): string[] {
  const ids: string[] = [];
  printDeckStore.set((prev) => [
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
  printDeckStore.set((prev) => [...prev, { ...structuredClone(entry), id }]);
  return id;
}

//------------------------------------------------------------------------------
// Clear Entries
//------------------------------------------------------------------------------

function clearEntries(): void {
  printDeckStore.set((prev) => (prev.length ? [] : prev));
}

//------------------------------------------------------------------------------
// Duplicate Entry
//------------------------------------------------------------------------------

function duplicateEntry(entryId: string): string | undefined {
  const id = createUuid();
  let duplicated = false;

  printDeckStore.set((prev) => {
    const index = prev.findIndex((entry) => entry.id === entryId);
    if (index < 0) return prev;

    const duplicate = { ...structuredClone(prev[index]!), id };
    const entries = [
      ...prev.slice(0, index + 1),
      duplicate,
      ...prev.slice(index + 1),
    ];
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
  printDeckStore.set((prev) => {
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
  printDeckStore.set((prev) => {
    const entries = prev.filter((entry) => entry.id !== entryId);
    return entries.length === prev.length ? prev : entries;
  });
}

//------------------------------------------------------------------------------
// Update Entry
//------------------------------------------------------------------------------

function updateEntry(entryId: string, nextEntry: PrintDeckEntry): void {
  printDeckStore.set((prev) => {
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
  updateEntry,
  useEntries: printDeckStore.useValue,
};
