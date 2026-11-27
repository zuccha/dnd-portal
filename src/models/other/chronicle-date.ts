import z from "zod";

//------------------------------------------------------------------------------
// Chronicle Date
//------------------------------------------------------------------------------

export const chronicleDateSchema = z.object({
  day: z.number().int().positive().nullable(),
  era: z.number().int().nullable(),
  hour: z.number().int().nonnegative().nullable(),
  minute: z.number().int().nonnegative().nullable(),
  month: z.number().int().positive().nullable(),
  year: z.number().int().nonnegative().nullable(),
});

export type ChronicleDate = z.infer<typeof chronicleDateSchema>;
