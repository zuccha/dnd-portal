import z from "zod";

//------------------------------------------------------------------------------
// Resource Filters
//------------------------------------------------------------------------------

export const resourceFiltersSchema = z.object({
  name: z.string(),
  order_by: z.string(),
  order_dir: z.enum(["asc", "desc"]).default("asc"),
});

export type ResourceFilters = z.infer<typeof resourceFiltersSchema>;
