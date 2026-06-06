import z from "zod";
import type { I18nString } from "~/i18n/i18n-string";

//------------------------------------------------------------------------------
// Resource Order Options
//------------------------------------------------------------------------------

export const resourceOrderOptions: { label: I18nString; value: string }[] = [
  {
    label: {
      en: "Name (A-Z)",
      it: "Nome (A-Z)",
    },
    value: `name.asc`,
  },
  {
    label: {
      en: "Name (Z-A)",
      it: "Nome (Z-A)",
    },
    value: "name.desc",
  },
] as const;

//------------------------------------------------------------------------------
// Resource Filters
//------------------------------------------------------------------------------

export const resourceFiltersSchema = z.object({
  name: z.string(),
  order_by: z.string(),
  order_dir: z.enum(["asc", "desc"]).default("asc"),
});

export type ResourceFilters = z.infer<typeof resourceFiltersSchema>;
