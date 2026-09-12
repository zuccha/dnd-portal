import { z } from "zod";
import { i18nStringSchema } from "~/i18n/i18n-string";
import { sourceTypeSchema } from "../types/source-type";
import { sourceVersionSchema } from "../types/source-version";

//------------------------------------------------------------------------------
// Source Dependency
//------------------------------------------------------------------------------

export const sourceDependencySchema = z.object({
  code: z.string(),
  name: i18nStringSchema,
  source_id: z.uuid(),
  version: sourceVersionSchema,
});

export type SourceDependency = z.infer<typeof sourceDependencySchema>;

//------------------------------------------------------------------------------
// Source Registry Metadata
//------------------------------------------------------------------------------

export const sourceRegistryMetadataSchema = z.object({
  access: z.enum(["read", "write"]).optional(),
  revision_created_at: z.string(),
  revision_id: z.uuid(),
  revision_number: z.number(),
  source_id: z.uuid(),
  visibility: z.enum(["public", "private"]).optional(),
});

export type SourceRegistryMetadata = z.infer<
  typeof sourceRegistryMetadataSchema
>;

//------------------------------------------------------------------------------
// Source
//------------------------------------------------------------------------------

export const sourceSchema = z.object({
  code: z.string(),
  id: z.uuid(),
  includes: z.array(sourceDependencySchema).default([]),
  name: i18nStringSchema,
  registry: sourceRegistryMetadataSchema.optional(),
  requires: z.array(sourceDependencySchema).default([]),
  type: sourceTypeSchema,
  version: sourceVersionSchema,
});

export type Source = z.infer<typeof sourceSchema>;
