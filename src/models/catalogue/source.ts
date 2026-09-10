import { z } from "zod";
import { i18nStringSchema } from "~/i18n/i18n-string";
import { sourceTypeSchema } from "../types/source-type";
import { sourceVersionSchema } from "../types/source-version";

//------------------------------------------------------------------------------
// Source
//------------------------------------------------------------------------------

export const sourceSchema = z.object({
  code: z.string(),
  id: z.uuid(),
  include_ids: z.array(z.uuid()).default([]),
  name: i18nStringSchema,
  required_ids: z.array(z.uuid()).default([]),
  sync_version: z.number(),
  type: sourceTypeSchema,
  version: sourceVersionSchema,
});

export type Source = z.infer<typeof sourceSchema>;
