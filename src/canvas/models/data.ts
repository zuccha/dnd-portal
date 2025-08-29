import z from "zod/v4";

//------------------------------------------------------------------------------
// Data
//------------------------------------------------------------------------------

export const dataSchema = z.record(z.string(), z.json());

export type Data = z.infer<typeof dataSchema>;
