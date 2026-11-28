import { z } from "zod";
import { createTypeTranslationHooks } from "./_base";

//------------------------------------------------------------------------------
// PC Status
//------------------------------------------------------------------------------

export const pcStatusSchema = z.enum(["active", "inactive", "dead"]);

//------------------------------------------------------------------------------
// PC Statuses
//------------------------------------------------------------------------------

export const pcStatuses = pcStatusSchema.options;

//------------------------------------------------------------------------------
// PC Status Type
//------------------------------------------------------------------------------

export type PcStatus = z.infer<typeof pcStatusSchema>;

//------------------------------------------------------------------------------
// PC Status Hooks
//------------------------------------------------------------------------------

export const { useOptions: usePcStatusOptions, useTranslate: useTranslatePcStatus } =
  createTypeTranslationHooks(pcStatuses, {
    active: { en: "Active", it: "Attivo" },
    dead: { en: "Dead", it: "Morto" },
    inactive: { en: "Inactive", it: "Inattivo" },
  });
