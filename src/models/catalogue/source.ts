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
  access: z.enum(["creator", "read", "write"]).optional(),
  bundle_hash: z
    .string()
    .regex(/^[0-9a-f]{64}$/)
    .optional(),
  dependencies_key: z.string().optional(),
  revision_created_at: z.string(),
  revision_id: z.uuid(),
  revision_number: z.number(),
  source_id: z.uuid(),
  visibility: z.enum(["public", "private"]).optional(),
});

export type SourceRegistryMetadata = z.infer<typeof sourceRegistryMetadataSchema>;

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

//------------------------------------------------------------------------------
// Source Dependencies Key
//------------------------------------------------------------------------------

export function sourceDependenciesKey(source: Pick<Source, "includes" | "requires">): string {
  return JSON.stringify({
    includes: [...new Set(source.includes.map(({ source_id }) => source_id))].sort(),
    requires: [...new Set(source.requires.map(({ source_id }) => source_id))].sort(),
  });
}

//------------------------------------------------------------------------------
// Source Registry Metadata From Source
//------------------------------------------------------------------------------

export function sourceRegistryMetadataFromSource(
  source: Source,
): SourceRegistryMetadata | undefined {
  if (!source.registry) return undefined;

  return {
    ...source.registry,
    dependencies_key: sourceDependenciesKey(source),
  };
}

//------------------------------------------------------------------------------
// Can Edit Source
//------------------------------------------------------------------------------

export function canEditSource(source: Source | undefined): boolean {
  return (
    !!source &&
    (!source.registry || source.registry.access === "creator" || source.registry.access === "write")
  );
}

//------------------------------------------------------------------------------
// Can Publish Source
//------------------------------------------------------------------------------

export function canPublishSource(source: Source | undefined): boolean {
  return !!source?.registry && canEditSource(source);
}
