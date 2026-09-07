import { useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { createLocalStore } from "~/store/local-store";
import supabase, { queryClient } from "~/supabase";
import { i18nStringSchema } from "../i18n/i18n-string";
import type { SourceType } from "./types/source-type";
import { sourceTypeSchema } from "./types/source-type";
import { sourceVersionSchema } from "./types/source-version";

//------------------------------------------------------------------------------
// Source Metadata
//------------------------------------------------------------------------------

export const sourceMetadataSchema = z.object({
  code: z.string(),
  id: z.uuid(),
  include_ids: z.array(z.uuid()).default([]),
  name: i18nStringSchema,
  required_ids: z.array(z.uuid()).default([]),
  sync_version: z.number(),
  type: sourceTypeSchema,
  version: sourceVersionSchema,
});

export type SourceMetadata = z.infer<typeof sourceMetadataSchema>;

//------------------------------------------------------------------------------
// Source
//------------------------------------------------------------------------------

export const sourceSchema = sourceMetadataSchema.extend({
  includes: z
    .array(
      z.object({
        code: z.string(),
        id: z.uuid(),
        name: i18nStringSchema,
        sync_version: z.number(),
        type: sourceTypeSchema,
        version: sourceVersionSchema,
      }),
    )
    .default([]),
});

export type Source = z.infer<typeof sourceSchema>;

//------------------------------------------------------------------------------
// Source Relations
//------------------------------------------------------------------------------

export const sourceRelationsSchema = z.object({
  include_ids: z.array(z.uuid()),
  required_ids: z.array(z.uuid()),
});

export type SourceRelations = z.infer<typeof sourceRelationsSchema>;

export const defaultSourceRelations: SourceRelations = {
  include_ids: [],
  required_ids: [],
};

//------------------------------------------------------------------------------
// Use Sources
//------------------------------------------------------------------------------

export function useSources(types?: SourceType[]) {
  return useQuery<Source[]>({
    queryFn: async () => {
      const { data } = await supabase.rpc("fetch_sources", { p_types: types });
      return z.array(sourceSchema).parse(data);
    },
    queryKey: ["sources/sources", types],
  });
}

//------------------------------------------------------------------------------
// Fetch Source Metadata
//------------------------------------------------------------------------------

export async function fetchSourceMetadata(
  sourceId: string,
): Promise<SourceMetadata[]> {
  const { data } = await supabase.rpc("fetch_source_metadata", {
    p_source_id: sourceId,
  });

  return z.array(sourceMetadataSchema).parse(data);
}

//------------------------------------------------------------------------------
// Use Source Metadata
//------------------------------------------------------------------------------

export function useSourceMetadata(sourceId: string | undefined) {
  return useQuery<SourceMetadata[]>({
    enabled: !!sourceId,
    queryFn: () => fetchSourceMetadata(sourceId!),
    queryKey: ["sources/metadata", sourceId],
  });
}

//------------------------------------------------------------------------------
// Fetch Source Relations
//------------------------------------------------------------------------------

export async function fetchSourceRelations(
  sourceId: string,
): Promise<SourceRelations> {
  const [includes, requires] = await Promise.all([
    supabase
      .from("source_includes")
      .select("include_id")
      .eq("source_id", sourceId),
    supabase
      .from("source_requires")
      .select("required_id")
      .eq("source_id", sourceId),
  ]);

  if (includes.error) throw includes.error;
  if (requires.error) throw requires.error;

  return sourceRelationsSchema.parse({
    include_ids: includes.data.map(({ include_id }) => include_id),
    required_ids: requires.data.map(({ required_id }) => required_id),
  });
}

//------------------------------------------------------------------------------
// Use Source Relations
//------------------------------------------------------------------------------

export function useSourceRelations(sourceId: string) {
  return useQuery<SourceRelations>({
    enabled: !!sourceId,
    queryFn: () => fetchSourceRelations(sourceId),
    queryKey: ["sources/relations", sourceId],
  });
}

//------------------------------------------------------------------------------
// Update Source Relations
//------------------------------------------------------------------------------

export async function updateSourceRelations(
  sourceId: string,
  next: SourceRelations,
): Promise<void> {
  const prev = await fetchSourceRelations(sourceId);

  const prevIncludeIds = new Set(prev.include_ids);
  const nextIncludeIds = new Set(next.include_ids);
  const prevRequiredIds = new Set(prev.required_ids);
  const nextRequiredIds = new Set(next.required_ids);

  const includeIdsToAdd = next.include_ids.filter(
    (id) => !prevIncludeIds.has(id),
  );
  const includeIdsToRemove = prev.include_ids.filter(
    (id) => !nextIncludeIds.has(id),
  );
  const requiredIdsToAdd = next.required_ids.filter(
    (id) => !prevRequiredIds.has(id),
  );
  const requiredIdsToRemove = prev.required_ids.filter(
    (id) => !nextRequiredIds.has(id),
  );

  const requests: PromiseLike<{ error: unknown }>[] = [];

  if (includeIdsToAdd.length) {
    requests.push(
      supabase.from("source_includes").upsert(
        includeIdsToAdd.map((includeId) => ({
          include_id: includeId,
          source_id: sourceId,
        })),
        { onConflict: "source_id,include_id" },
      ),
    );
  }

  if (includeIdsToRemove.length) {
    requests.push(
      supabase
        .from("source_includes")
        .delete()
        .eq("source_id", sourceId)
        .in("include_id", includeIdsToRemove),
    );
  }

  if (requiredIdsToAdd.length) {
    requests.push(
      supabase.from("source_requires").upsert(
        requiredIdsToAdd.map((requiredId) => ({
          required_id: requiredId,
          source_id: sourceId,
        })),
        { onConflict: "source_id,required_id" },
      ),
    );
  }

  if (requiredIdsToRemove.length) {
    requests.push(
      supabase
        .from("source_requires")
        .delete()
        .eq("source_id", sourceId)
        .in("required_id", requiredIdsToRemove),
    );
  }

  const responses = await Promise.all(requests);
  const error = responses.find((response) => response.error)?.error;
  if (error) throw error;

  await Promise.all([
    queryClient.invalidateQueries({ queryKey: ["sources/sources"] }),
    queryClient.invalidateQueries({
      queryKey: ["sources/relations", sourceId],
    }),
  ]);
}

//------------------------------------------------------------------------------
// Use Selected Source Id
//------------------------------------------------------------------------------

export const useSelectedSourceId = createLocalStore<string | undefined>(
  "sources.selected_id",
  undefined,
  z.string().parse,
).use;

//------------------------------------------------------------------------------
// Use Selected Source
//------------------------------------------------------------------------------

export function useSelectedSource() {
  const [id] = useSelectedSourceId();
  const { data: sources } = useSources();
  return sources?.find((source) => source.id === id);
}

//------------------------------------------------------------------------------
// Fetch Can Admin Source
//------------------------------------------------------------------------------

export async function fetchCanAdminSource(sourceId: string) {
  const { data } = await supabase.rpc("can_admin_source", {
    p_source_id: sourceId,
  });
  return z.boolean().parse(data);
}

//------------------------------------------------------------------------------
// Use Can Admin Source
//------------------------------------------------------------------------------

export function useCanAdminSource(sourceId: string): boolean {
  const { data: canAdminSource } = useQuery<boolean>({
    enabled: !!sourceId,
    queryFn: () => fetchCanAdminSource(sourceId),
    queryKey: ["sources/can_admin", sourceId],
  });
  return !!canAdminSource;
}

//------------------------------------------------------------------------------
// Fetch Can Edit Source Resources
//------------------------------------------------------------------------------

export async function fetchCanEditSourceResources(sourceId: string) {
  const { data } = await supabase.rpc("can_edit_source_resources", {
    p_source_id: sourceId,
  });
  return z.boolean().parse(data);
}

//------------------------------------------------------------------------------
// Use Can Edit Source Resources
//------------------------------------------------------------------------------

export function useCanEditSourceResources(sourceId: string): boolean {
  const { data: canEditCampaign } = useQuery<boolean>({
    enabled: !!sourceId,
    queryFn: () => fetchCanEditSourceResources(sourceId),
    queryKey: ["sources/can_edit", sourceId],
  });
  return !!canEditCampaign;
}
