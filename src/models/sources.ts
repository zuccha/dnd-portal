import { useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { createLocalStore } from "~/store/local-store";
import supabase from "~/supabase";
import { i18nStringSchema } from "../i18n/i18n-string";
import type { SourceType } from "./types/source-type";

//------------------------------------------------------------------------------
// Source
//------------------------------------------------------------------------------

export const sourceSchema = z.object({
  code: z.string(),
  id: z.uuid(),
  name: i18nStringSchema,

  includes: z
    .array(z.object({ code: z.string(), id: z.uuid(), name: i18nStringSchema }))
    .default([]),
});

export type Source = z.infer<typeof sourceSchema>;

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
    queryFn: () => fetchCanEditSourceResources(sourceId),
    queryKey: ["sources/can_edit", sourceId],
  });
  return !!canEditCampaign;
}
