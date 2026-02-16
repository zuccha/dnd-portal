import { z } from "zod";
import { createTypeTranslationHooks } from "./_base";

//------------------------------------------------------------------------------
// Source Role
//------------------------------------------------------------------------------

export const sourceRoleSchema = z.enum(["admin", "editor"]);

export const sourceRoles = sourceRoleSchema.options;

export type SourceRole = z.infer<typeof sourceRoleSchema>;

//------------------------------------------------------------------------------
// Source Role Translation Hooks
//------------------------------------------------------------------------------

export const {
  useOptions: useSourceRoleOptions,
  useTranslate: useTranslateSourceRole,
  useTranslations: useSourceRoleTranslations,
} = createTypeTranslationHooks(sourceRoles, {
  admin: { en: "Admin", it: "Amministratore" },
  editor: { en: "Editor", it: "Redattore" },
});
