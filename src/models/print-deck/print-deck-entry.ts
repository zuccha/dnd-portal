import { z } from "zod";
import { paletteNameSchema } from "~/utils/palette";
import { resourceUnionSchema } from "../resources/resource-union";

//------------------------------------------------------------------------------
// Print Deck Entry
//------------------------------------------------------------------------------

export const printDeckEntrySchema = z.object({
  id: z.uuid(),
  lang: z.string(),
  palette_name: paletteNameSchema,
  resource: resourceUnionSchema,
});

export type PrintDeckEntry = z.infer<typeof printDeckEntrySchema>;

//------------------------------------------------------------------------------
// Print Deck Entry Input
//------------------------------------------------------------------------------

export type PrintDeckEntryInput = Omit<PrintDeckEntry, "id">;
