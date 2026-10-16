import { z, type ZodType } from "zod";
import { paletteNameSchema } from "~/utils/palette";
import {
  localizedResourceUnionSchema,
  type LocalizedResourceUnion,
  type ResourceUnion,
} from "../resources/resource-union";
import type { LocalizedResource } from "../resources/localized-resource";
import type { Resource } from "../resources/resource";

//------------------------------------------------------------------------------
// Print Deck Entry
//------------------------------------------------------------------------------

function createPrintDeckEntrySchema<R extends Resource, L extends LocalizedResource<R>>(
  resourceSchema: ZodType<L>,
) {
  return z.object({
    id: z.uuid(),
    lang: z.string(),
    palette_name: paletteNameSchema,
    resource: resourceSchema,
  });
}

export type PrintDeckEntry<R extends Resource, L extends LocalizedResource<R>> = z.infer<
  ReturnType<typeof createPrintDeckEntrySchema<R, L>>
>;

//------------------------------------------------------------------------------
// Print Deck Entry Union
//------------------------------------------------------------------------------

export const printDeckEntryUnionSchema = createPrintDeckEntrySchema<
  ResourceUnion,
  LocalizedResourceUnion
>(localizedResourceUnionSchema);

export type PrintDeckEntryUnion = z.infer<typeof printDeckEntryUnionSchema>;

//------------------------------------------------------------------------------
// Print Deck Entry Input
//------------------------------------------------------------------------------

export type PrintDeckEntryInput<R extends Resource, L extends LocalizedResource<R>> = Omit<
  PrintDeckEntry<R, L>,
  "id"
>;

//------------------------------------------------------------------------------
// Print Deck Entry Input Union
//------------------------------------------------------------------------------

export type PrintDeckEntryInputUnion = Omit<PrintDeckEntryUnion, "id">;
