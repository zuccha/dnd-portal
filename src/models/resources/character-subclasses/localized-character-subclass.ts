import { useMemo } from "react";
import z from "zod";
import { useLocalizedFeatureEntries } from "../../other/feature-entries";
import { characterClassStore } from "../character-classes/character-class-store";
import {
  type ResourceLocalizationContext,
  localizeResource,
  localizedFieldSchema,
  localizedResourceSchema,
  useResourceLocalizationContext,
} from "../localized-resource";
import { type CharacterSubclass, characterSubclassSchema } from "./character-subclass";
import type { RelatedResourceEntries } from "../../catalogue/resource-relations";

const { useLocalizedResourceName: useLocalizedCharacterClassName } = characterClassStore;

//------------------------------------------------------------------------------
// Localized Character Subclass
//------------------------------------------------------------------------------

export const localizedCharacterSubclassSchema = localizedResourceSchema(
  characterSubclassSchema,
  z.literal("character_subclass"),
).extend({
  character_class: localizedFieldSchema.extend({ id: z.uuid() }),
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
  related: RelatedResourceEntries<"character_subclass">,
): CharacterSubclassLocalizationContext {
  const context = useResourceLocalizationContext(i18nContext);
  const characterClassName = useLocalizedCharacterClassName(characterSubclass.character_class_id);
  const featureEntries = useLocalizedFeatureEntries(related.features);

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
    description: context.featureEntries,
    character_class: {
      id: characterSubclass.character_class_id,
      label: context.t("character_class"),
      value: context.characterClassName,
    },
  };
}

//------------------------------------------------------------------------------
// I18n Context
//------------------------------------------------------------------------------

const i18nContext = {
  character_class: {
    en: "Class",
    it: "Classe",
  },
  descriptor: {
    en: "<1> Subclass",
    it: "Sottoclasse <1>",
  },
};
