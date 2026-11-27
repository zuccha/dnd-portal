import z from "zod";
import { i18nStringSchema } from "~/i18n/i18n-string";
import { chronicleDateSchema } from "~/models/other/chronicle-date";
import {
  type TranslationFields,
  defaultResource,
  resourceSchema,
  resourceTranslationFields,
} from "../resource";

//------------------------------------------------------------------------------
// Chronicle Entry
//------------------------------------------------------------------------------

export const chronicleEntrySchema = resourceSchema.extend({
  date: chronicleDateSchema,
  description: i18nStringSchema,
  kind: z.literal("chronicle_entry"),
});

export type ChronicleEntry = z.infer<typeof chronicleEntrySchema>;

//------------------------------------------------------------------------------
// Default Chronicle Entry
//------------------------------------------------------------------------------

export const defaultChronicleEntry: ChronicleEntry = {
  ...defaultResource,
  date: { day: null, era: null, hour: null, minute: null, month: null, year: null },
  description: {},
  kind: "chronicle_entry",
};

//------------------------------------------------------------------------------
// Chronicle Entry Translation Fields
//------------------------------------------------------------------------------

export const chronicleEntryTranslationFields: TranslationFields<ChronicleEntry>[] = [
  ...resourceTranslationFields,
  "description",
];
