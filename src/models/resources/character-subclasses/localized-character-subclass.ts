import { useCallback } from "react";
import z from "zod";
import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import { characterClassStore } from "../character-classes/character-class-store";
import {
  localizedResourceSchema,
  useLocalizeResource,
} from "../localized-resource";
import {
  type CharacterSubclass,
  characterSubclassSchema,
} from "./character-subclass";

//------------------------------------------------------------------------------
// Localized Character Subclass
//------------------------------------------------------------------------------

export const localizedCharacterSubclassSchema = localizedResourceSchema(
  characterSubclassSchema,
).extend({
  character_class: z.string(),
});

export type LocalizedCharacterSubclass = z.infer<
  typeof localizedCharacterSubclassSchema
>;

//------------------------------------------------------------------------------
// Use Localized Character Subclass
//------------------------------------------------------------------------------

export function useLocalizeCharacterSubclass(
  sourceId: string,
): (characterSubclass: CharacterSubclass) => LocalizedCharacterSubclass {
  const { lang, ti } = useI18nLangContext(i18nContext);
  const localizeResource = useLocalizeResource<CharacterSubclass>();
  const localizeCharacterClass = characterClassStore.useLocalizeResourceName(
    sourceId,
    lang,
  );

  return useCallback(
    (characterSubclass: CharacterSubclass): LocalizedCharacterSubclass => {
      const character_class = localizeCharacterClass(
        characterSubclass.character_class_id,
      );

      return {
        ...localizeResource(characterSubclass),
        descriptor: ti("descriptor", character_class),

        character_class,
      };
    },
    [localizeCharacterClass, localizeResource, ti],
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
