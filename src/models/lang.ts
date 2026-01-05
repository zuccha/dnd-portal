import { useQuery } from "@tanstack/react-query";
import z from "zod";
import supabase from "~/supabase";

//------------------------------------------------------------------------------
// Lang
//------------------------------------------------------------------------------

export const languageSchema = z.object({
  code: z.string(),
  label: z.string(),
});

export type Lang = z.infer<typeof languageSchema>;

//------------------------------------------------------------------------------
// Fetch Langs
//------------------------------------------------------------------------------

export async function fetchLangs(): Promise<Lang[]> {
  const { data } = await supabase.from("langs").select();
  return z.array(languageSchema).parse(data);
}

//------------------------------------------------------------------------------
// Use Langs
//------------------------------------------------------------------------------

export function useLangs() {
  return useQuery<Lang[]>({
    queryFn: fetchLangs,
    queryKey: ["langs"],
  });
}
