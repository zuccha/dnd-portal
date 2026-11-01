import z from "zod";
import { createTypeTranslationHooks } from "./_base";
import { resourceKindSchema } from "./resource-kind";

//------------------------------------------------------------------------------
// Resource Feature Kind
//------------------------------------------------------------------------------

export const resourceFeatureKindSchema = resourceKindSchema.extract([
  "character_class",
  "character_subclass",
]);

export const resourceFeatureKinds = resourceFeatureKindSchema.options;

export type ResourceFeatureKind = z.infer<typeof resourceFeatureKindSchema>;

//------------------------------------------------------------------------------
// Resource Feature Kind Hooks
//------------------------------------------------------------------------------

export const {
  useOptions: useResourceFeatureKindOptions,
  useTranslate: useTranslateResourceFeatureKind,
} = createTypeTranslationHooks(resourceFeatureKinds, {
  character_class: { en: "Class", it: "Classe" },
  character_subclass: { en: "Subclass", it: "Sottoclasse" },
});
