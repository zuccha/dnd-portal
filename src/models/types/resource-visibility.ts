import z from "zod";
import { createTypeTranslationHooks } from "./_base";

//------------------------------------------------------------------------------
// Resource Visibility
//------------------------------------------------------------------------------

export const resourceVisibilitySchema = z.enum(["public", "private"]);

export const resourceVisibilities = resourceVisibilitySchema.options;

export type ResourceVisibility = z.infer<typeof resourceVisibilitySchema>;

//------------------------------------------------------------------------------
// Resource Visibility Hooks
//------------------------------------------------------------------------------

export const {
  useOptions: useResourceVisibilityOptions,
  useTranslate: useTranslateResourceVisibility,
  useTranslations: useResourceVisibilityTranslations,
} = createTypeTranslationHooks(resourceVisibilities, {
  private: { en: "Private", it: "Privata" },
  public: { en: "Public", it: "Pubblica" },
});
