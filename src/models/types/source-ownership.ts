import { z } from "zod";
import { createTypeTranslationHooks } from "./_base";

//------------------------------------------------------------------------------
// Source Ownership
//------------------------------------------------------------------------------

export const sourceOwnershipSchema = z.enum(["guest", "owner"]);

export const sourceOwnerships = sourceOwnershipSchema.options;

export type SourceOwnership = z.infer<typeof sourceOwnershipSchema>;

//------------------------------------------------------------------------------
// Source Ownership Translation Hooks
//------------------------------------------------------------------------------

export const {
  useOptions: useSourceOwnershipOptions,
  useTranslate: useTranslateSourceOwnership,
  useTranslations: useSourceOwnershipTranslations,
} = createTypeTranslationHooks(sourceOwnerships, {
  guest: { en: "Guest", it: "Ospite" },
  owner: { en: "Owner", it: "Possessore" },
});
