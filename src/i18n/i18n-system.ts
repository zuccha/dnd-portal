import { z } from "zod";
import { createLocalStore } from "~/store/local-store";

//------------------------------------------------------------------------------
// I18n System
//------------------------------------------------------------------------------

export const i18nSystemSchema = z.enum(["imperial", "metric"]);

export const i18nSystems = i18nSystemSchema.options;

export type I18nSystem = z.infer<typeof i18nSystemSchema>;

//------------------------------------------------------------------------------
// I18n System Context
//------------------------------------------------------------------------------

export type I18nSystemContext = Record<string, Record<I18nSystem, string>>;

//------------------------------------------------------------------------------
// I18n System Store
//------------------------------------------------------------------------------

export const i18nSystemStore = createLocalStore(
  "i18n.system",
  "imperial",
  i18nSystemSchema.parse,
);

//------------------------------------------------------------------------------
// Use I18n System
//------------------------------------------------------------------------------

export const useI18nSystem = i18nSystemStore.use;

//------------------------------------------------------------------------------
// Resolve System Text
//------------------------------------------------------------------------------

export function resolveSystemText(text: string, system: I18nSystem): string {
  return text.replace(/\{(.+?)\}/g, (_match, value: string) => {
    const [metric, imperial] = value.split("|");
    return system === "metric" ? (metric ?? "") : (imperial ?? "");
  });
}
