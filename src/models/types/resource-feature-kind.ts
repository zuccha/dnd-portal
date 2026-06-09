import z from "zod";
import { createTypeTranslationHooks } from "./_base";
import { resourceKindSchema } from "./resource-kind";

//------------------------------------------------------------------------------
// Resource Feature Kind
//------------------------------------------------------------------------------

export const resourceFeatureKindSchema = resourceKindSchema.extract([
  "species",
  "character_class",
  "character_subclass",
  "feat",
  "weapon",
  "armor",
  "tool",
  "item",
]);

export const resourceFeatureKinds = resourceFeatureKindSchema.options;

export type ResourceFeatureKind = z.infer<typeof resourceFeatureKindSchema>;

//------------------------------------------------------------------------------
// Resource Feature Kind Hooks
//------------------------------------------------------------------------------

export const {
  useOptions: useResourceFeatureKindOptions,
  useTranslate: useTranslateResourceFeatureKind,
  useTranslations: useResourceFeatureKindTranslations,
} = createTypeTranslationHooks(resourceFeatureKinds, {
  armor: { en: "Armor", it: "Armatura" },
  character_class: { en: "Class", it: "Classe" },
  character_subclass: { en: "Subclass", it: "Sottoclasse" },
  feat: { en: "Feat", it: "Talento" },
  item: { en: "Item", it: "Oggetto" },
  species: { en: "Species", it: "Specie" },
  tool: { en: "Tool", it: "Strumento" },
  weapon: { en: "Weapon", it: "Arma" },
});
