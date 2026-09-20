import { z } from "zod";
import { paletteNameSchema } from "~/utils/palette";
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

//------------------------------------------------------------------------------
// Print Deck Entry Input
//------------------------------------------------------------------------------

export type PrintDeckEntryInput = Omit<PrintDeckEntry, "id">;
