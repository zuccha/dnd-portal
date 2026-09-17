import { useCallback, useMemo } from "react";
import z from "zod";
import { useFormatFeatureEntries } from "../../other/feature-entries";
import { characterClassStore } from "../character-classes/character-class-store";
import {
  type ResourceLocalizationContext,
  localizeResource,
  localizedResourceSchema,
  useResourceLocalizationContext,
} from "../localized-resource";
import { type CharacterSubclass, characterSubclassSchema } from "./character-subclass";

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
  formatFeatureEntries: ReturnType<typeof useFormatFeatureEntries>;
  localizeCharacterClassName: ReturnType<typeof characterClassStore.useLocalizeResourceName>;
};

//------------------------------------------------------------------------------
// Use Character Subclass Localization Context
//------------------------------------------------------------------------------

function useCharacterSubclassLocalizationContext(
  sourceId: string,
): CharacterSubclassLocalizationContext {
  const context = useResourceLocalizationContext(i18nContext);
  const formatFeatureEntries = useFormatFeatureEntries(sourceId);
  const localizeCharacterClassName = characterClassStore.useLocalizeResourceName(context.lang);

  return useMemo(
    () => ({ ...context, formatFeatureEntries, localizeCharacterClassName }),
    [context, formatFeatureEntries, localizeCharacterClassName],
  );
}

//------------------------------------------------------------------------------
// Localize Character Subclass
//------------------------------------------------------------------------------

function localizeCharacterSubclass(
  characterSubclass: CharacterSubclass,
  context: CharacterSubclassLocalizationContext,
): LocalizedCharacterSubclass {
  const character_class = context.localizeCharacterClassName(characterSubclass.character_class_id);

  return {
    ...localizeResource(characterSubclass, context),
    descriptor: context.ti("descriptor", character_class),
    details: context.formatFeatureEntries(characterSubclass.feature_entries),
    character_class,
  };
}

//------------------------------------------------------------------------------
// Use Localize Character Subclass
//------------------------------------------------------------------------------

export function useLocalizeCharacterSubclass(
  sourceId: string,
): (characterSubclass: CharacterSubclass) => LocalizedCharacterSubclass {
  const context = useCharacterSubclassLocalizationContext(sourceId);
  return useCallback(
    (characterSubclass) => localizeCharacterSubclass(characterSubclass, context),
    [context],
  );
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
