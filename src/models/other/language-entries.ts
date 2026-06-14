import z from "zod";
import { creatureLanguageModeSchema } from "../types/creature-language-mode";

//------------------------------------------------------------------------------
// Language Entry
//------------------------------------------------------------------------------

export const languageEntrySchema = z.object({
  language_id: z.uuid(),
  mode: creatureLanguageModeSchema,
});

export type LanguageEntry = z.infer<typeof languageEntrySchema>;
