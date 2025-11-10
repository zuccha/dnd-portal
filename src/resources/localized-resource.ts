import z, { ZodType } from "zod";
import type { Resource } from "./resource";

//------------------------------------------------------------------------------
// Localized Resource
//------------------------------------------------------------------------------

export const localizedResourceSchema = <R extends Resource>(
  rawSchema: ZodType<R>,
) =>
  z.object({
    _raw: rawSchema,
    id: z.uuid(),
  });

export type LocalizedResource<R extends Resource> = z.infer<
  ReturnType<typeof localizedResourceSchema<R>>
>;
