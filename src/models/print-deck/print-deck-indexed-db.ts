import Dexie, { type Table } from "dexie";
import { printDeckEntrySchema, type PrintDeckEntry } from "./print-deck-entry";

//------------------------------------------------------------------------------
// Persisted Print Deck
//------------------------------------------------------------------------------

type PersistedPrintDeck = {
  entries: PrintDeckEntry[];
  id: string;
};

//------------------------------------------------------------------------------
// Print Deck Indexed DB
//------------------------------------------------------------------------------

class PrintDeckIndexedDb extends Dexie {
  decks!: Table<PersistedPrintDeck, string>;

  constructor() {
    super("dnd-portal-print-deck");
    this.version(1).stores({ decks: "&id" });
  }
}

const db = new PrintDeckIndexedDb();
const deckId = "default";

//------------------------------------------------------------------------------
// Parse Print Deck Entries
//------------------------------------------------------------------------------

function parsePrintDeckEntries(value: unknown): PrintDeckEntry[] {
  return Array.isArray(value)
    ? value.flatMap((entry) => {
        const parsed = printDeckEntrySchema.safeParse(entry);
        return parsed.success ? [parsed.data] : [];
      })
    : [];
}

//------------------------------------------------------------------------------
// Load Print Deck
//------------------------------------------------------------------------------

export async function loadPrintDeck(): Promise<PrintDeckEntry[]> {
  const persisted = await db.decks.get(deckId);
  if (persisted) return parsePrintDeckEntries(persisted.entries);

  const legacyValue = localStorage.getItem("print_deck");
  if (legacyValue === null) return [];

  let entries: PrintDeckEntry[] = [];
  try {
    entries = parsePrintDeckEntries(JSON.parse(legacyValue));
  } catch {
    entries = [];
  }

  await savePrintDeck(entries);
  localStorage.removeItem("print_deck");
  return entries;
}

//------------------------------------------------------------------------------
// Save Print Deck
//------------------------------------------------------------------------------

export async function savePrintDeck(entries: PrintDeckEntry[]): Promise<void> {
  await db.decks.put({ entries: structuredClone(entries), id: deckId });
}
