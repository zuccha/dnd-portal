import { type ReactNode, useMemo } from "react";
import { z } from "zod";
import { createLocalStore } from "~/store/local-store";
import RichText from "~/ui/rich-text";

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
// Use I18n System Patterns
//------------------------------------------------------------------------------

export function useI18nSystemPatterns() {
  const [system] = useI18nSystem();

  return useMemo(
    () => [
      ...RichText.defaultPatterns,
      { regex: /\{(.+?)\}/, render: renderSystemPattern(system) },
    ],
    [system],
  );
}

//------------------------------------------------------------------------------
// Render System Pattern
//------------------------------------------------------------------------------

function renderSystemPattern(system: I18nSystem) {
  return (val: ReactNode) =>
    typeof val === "string" ?
      (val.split("|")[system === "metric" ? 0 : 1] ?? "")
    : val;
}
