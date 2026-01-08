import { z } from "zod";
import { createTypeTranslationHooks } from "./_base";

//------------------------------------------------------------------------------
// Plane Category
//------------------------------------------------------------------------------

export const planeCategorySchema = z.enum([
  "material",
  "transitive",
  "inner",
  "outer",
  "other",
]);

export const planeCategories = planeCategorySchema.options;

export type PlaneCategory = z.infer<typeof planeCategorySchema>;

//------------------------------------------------------------------------------
// Plane Category Hooks
//------------------------------------------------------------------------------

export const {
  useOptions: usePlaneCategoryOptions,
  useTranslate: useTranslatePlaneCategory,
  useTranslations: usePlaneCategoryTranslations,
} = createTypeTranslationHooks(planeCategories, {
  inner: { en: "Inner Plane", it: "Piano Interno" },
  material: { en: "Material Realm", it: "Regno Materiale" },
  other: { en: "Other Plane", it: "Altro Piano" },
  outer: { en: "Outer Plane", it: "Piano Esterno" },
  transitive: { en: "Transitive Plane", it: "Piano di Transizione" },
});
