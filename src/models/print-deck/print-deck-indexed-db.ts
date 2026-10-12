import Dexie, { type Table } from "dexie";
import { z } from "zod";
import { localizedResourceUnionSchema } from "../resources/resource-union";
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
        if (parsed.success) return [parsed.data];

        const legacy = z
          .object({
            id: z.uuid(),
            lang: z.string(),
            localized_resource: localizedResourceUnionSchema,
            palette_name: printDeckEntrySchema.shape.palette_name,
          })
          .safeParse(entry);

        return legacy.success
          ? [
              {
                id: legacy.data.id,
                lang: legacy.data.lang,
                palette_name: legacy.data.palette_name,
                resource: legacy.data.localized_resource._raw,
              },
            ]
          : [];
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
