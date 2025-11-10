import z from "zod";

//------------------------------------------------------------------------------
// Data
//------------------------------------------------------------------------------

export const dataSchema = z.record(z.string(), z.json());

export type Data = z.infer<typeof dataSchema>;
