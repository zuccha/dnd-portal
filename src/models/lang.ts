import z from "zod";

//------------------------------------------------------------------------------
// Lang
//------------------------------------------------------------------------------

export const langSchema = z.enum(["en", "it"]);

export type Lang = z.infer<typeof langSchema>;

//------------------------------------------------------------------------------
// Langs
//------------------------------------------------------------------------------

export const langOptions: { label: string; value: Lang }[] = [
  { label: "English", value: "en" },
  { label: "Italiano", value: "it" },
];
