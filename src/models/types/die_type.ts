import { z } from "zod";
import { createTypeTranslationHooks } from "./_base";

//------------------------------------------------------------------------------
// Die Type
//------------------------------------------------------------------------------

export const dieTypeSchema = z.enum([
  "d2",
  "d4",
  "d6",
  "d8",
  "d10",
  "d12",
  "d20",
  "d100",
]);

export const dieTypes = dieTypeSchema.options;

export type DieType = z.infer<typeof dieTypeSchema>;

//------------------------------------------------------------------------------
// Die Type Translation Hooks
//------------------------------------------------------------------------------

export const {
  useOptions: useDieTypeOptions,
  useTranslate: useTranslateDieType,
  useTranslations: useDieTypeTranslations,
} = createTypeTranslationHooks(dieTypes, {
  d2: { en: "d2", it: "d2" },
  d4: { en: "d4", it: "d4" },
  d6: { en: "d6", it: "d6" },
  d8: { en: "d8", it: "d8" },
  d10: { en: "d10", it: "d10" },
  d12: { en: "d12", it: "d12" },
  d20: { en: "d20", it: "d20" },
  d100: { en: "d100", it: "d100" },
});
