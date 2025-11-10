import { useQuery } from "@tanstack/react-query";
import z from "zod";
import supabase from "../supabase";

//------------------------------------------------------------------------------
// Language
//------------------------------------------------------------------------------

export const languageSchema = z.object({
  code: z.string(),
  label: z.string(),
});

export type Language = z.infer<typeof languageSchema>;

//------------------------------------------------------------------------------
// Fetch Languages
//------------------------------------------------------------------------------

export async function fetchLanguages(): Promise<Language[]> {
  const { data } = await supabase.from("languages").select();
  return z.array(languageSchema).parse(data);
}

//------------------------------------------------------------------------------
// Use Languages
//------------------------------------------------------------------------------

export function useLanguages() {
  return useQuery<Language[]>({
    queryFn: fetchLanguages,
    queryKey: ["languages"],
  });
}
