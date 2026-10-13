import { useMemo } from "react";
import z from "zod";
import { useActiveSourceRelatedResourceEntries } from "../../catalogue/resource-relation-hooks";
import { useLocalizedFeatureEntries } from "../../other/feature-entries";
import { characterClassStore } from "../character-classes/character-class-store";
import {
  type ResourceLocalizationContext,
  localizeResource,
  localizedResourceSchema,
  useResourceLocalizationContext,
} from "../localized-resource";
import { type CharacterSubclass, characterSubclassSchema } from "./character-subclass";

const { useLocalizedResourceName: useLocalizedCharacterClassName } = characterClassStore;

//------------------------------------------------------------------------------
// Localized Character Subclass
//------------------------------------------------------------------------------

export const localizedCharacterSubclassSchema = localizedResourceSchema(
  characterSubclassSchema,
  z.literal("character_subclass"),
).extend({
  character_class: z.string(),
});

export type LocalizedCharacterSubclass = z.infer<typeof localizedCharacterSubclassSchema>;

//------------------------------------------------------------------------------
// Character Subclass Localization Context
//------------------------------------------------------------------------------

type CharacterSubclassLocalizationContext = ResourceLocalizationContext & {
  characterClassName: string;
  featureEntries: string;
};

//------------------------------------------------------------------------------
// Use Character Subclass Localization Context
//------------------------------------------------------------------------------

export function useCharacterSubclassLocalizationContext(
  characterSubclass: CharacterSubclass,
): CharacterSubclassLocalizationContext {
  const context = useResourceLocalizationContext(i18nContext);
  const characterClassName = useLocalizedCharacterClassName(characterSubclass.character_class_id);
  const relatedFeatures = useActiveSourceRelatedResourceEntries(
    "character_subclasses_and_features",
    characterSubclass,
  );
  const featureEntries = useLocalizedFeatureEntries(
    relatedFeatures.map(({ id, min_level = 0 }) => ({ id, min_level })),
  );

  return useMemo(
    () => ({ ...context, characterClassName, featureEntries }),
    [characterClassName, context, featureEntries],
  );
}

//------------------------------------------------------------------------------
// Localize Character Subclass
//------------------------------------------------------------------------------

export function localizeCharacterSubclass(
  characterSubclass: CharacterSubclass,
  context: CharacterSubclassLocalizationContext,
): LocalizedCharacterSubclass {
  return {
    ...localizeResource(characterSubclass, context),
    descriptor: context.ti("descriptor", context.characterClassName),
    details: context.featureEntries,
    character_class: context.characterClassName,
  };
}

//------------------------------------------------------------------------------
// I18n Context
//------------------------------------------------------------------------------

const i18nContext = {
  descriptor: {
    en: "<1> Subclass",
    it: "Sottoclasse <1>",
  },
};
