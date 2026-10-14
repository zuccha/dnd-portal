import { SimpleGrid } from "@chakra-ui/react";
import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import { characterClassStore } from "~/models/resources/character-classes/character-class-store";
import ResourceDetailContent from "../../resource-detail-content";
import ResourceDetailField from "../../resource-detail-field";

const useLocalizedResource = characterClassStore.useLocalizedResource;

//------------------------------------------------------------------------------
// Character Class Detail Route
//------------------------------------------------------------------------------

export default function CharacterClassDetailRoute({ resourceId }: { resourceId: string }) {
  const { t } = useI18nLangContext(i18nContext);
  const characterClass = useLocalizedResource(resourceId);
  const fields = characterClass
    ? [
        { label: t("hit_die"), value: characterClass.hp_die },
        { label: t("primary_abilities"), value: characterClass.primary_abilities },
        { label: t("saving_throws"), value: characterClass.saving_throw_proficiencies },
        { label: t("armor_proficiencies"), value: characterClass.armor_proficiencies },
        { label: t("weapon_proficiencies"), value: characterClass.weapon_proficiencies },
        { label: t("tool_proficiencies"), value: characterClass.tool_proficiencies },
      ].filter(({ value }) => Boolean(value))
    : [];

  return (
    <ResourceDetailContent
      detailsContent={
        characterClass && (
          <SimpleGrid columns={{ base: 1, sm: 2 }} columnGap={6} rowGap={2}>
            {fields.map(({ label, value }) => (
              <ResourceDetailField key={label} label={label}>
                {value}
              </ResourceDetailField>
            ))}
          </SimpleGrid>
        )
      }
      resource={characterClass}
    />
  );
}

//------------------------------------------------------------------------------
// I18n Context
//------------------------------------------------------------------------------

const i18nContext = {
  armor_proficiencies: {
    en: "Armor Proficiencies",
    it: "Competenze nelle Armature",
  },
  hit_die: {
    en: "Hit Die",
    it: "Dado Vita",
  },
  primary_abilities: {
    en: "Primary Abilities",
    it: "Abilità Primarie",
  },
  saving_throws: {
    en: "Saving Throws",
    it: "Tiri Salvezza",
  },
  tool_proficiencies: {
    en: "Tool Proficiencies",
    it: "Competenze negli Strumenti",
  },
  weapon_proficiencies: {
    en: "Weapon Proficiencies",
    it: "Competenze nelle Armi",
  },
};
