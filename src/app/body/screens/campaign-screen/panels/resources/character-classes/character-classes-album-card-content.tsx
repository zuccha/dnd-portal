import { type StackProps, VStack } from "@chakra-ui/react";
import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import type { LocalizedCharacterClass } from "~/models/resources/character-classes/localized-character-class";
import AlbumCard from "~/ui/album-card";
import RichText from "../../../../../../../ui/rich-text";

//------------------------------------------------------------------------------
// Character Classes Album Card Content
//------------------------------------------------------------------------------

export type CharacterClassesAlbumCardContentProps = StackProps & {
  localizedResource: LocalizedCharacterClass;
};

export default function CharacterClassesAlbumCardContent({
  localizedResource,
  ...rest
}: CharacterClassesAlbumCardContentProps) {
  const { t } = useI18nLangContext(i18nContext);
  const {
    armor_proficiencies,
    hp_die,
    primary_abilities,
    saving_throw_proficiencies,
    skill_proficiencies_pool,
    starting_equipment,
    tool_proficiencies,
    weapon_proficiencies,
  } = localizedResource;

  return (
    <VStack {...rest}>
      <AlbumCard.Caption>{t("title")}</AlbumCard.Caption>

      <AlbumCard.Info>
        {primary_abilities && (
          <AlbumCard.InfoCell label={t("primary_abilities")}>
            {primary_abilities}
          </AlbumCard.InfoCell>
        )}

        <AlbumCard.InfoCell label={t("hp_die")}>{hp_die}</AlbumCard.InfoCell>

        {saving_throw_proficiencies && (
          <AlbumCard.InfoCell label={t("saving_throw_proficiencies")}>
            {saving_throw_proficiencies}
          </AlbumCard.InfoCell>
        )}

        {skill_proficiencies_pool && (
          <AlbumCard.InfoCell label={t("skill_proficiencies_pool")}>
            <RichText text={skill_proficiencies_pool} />
          </AlbumCard.InfoCell>
        )}

        {weapon_proficiencies && (
          <AlbumCard.InfoCell label={t("weapon_proficiencies")}>
            {weapon_proficiencies}
          </AlbumCard.InfoCell>
        )}

        {tool_proficiencies && (
          <AlbumCard.InfoCell label={t("tool_proficiencies")}>
            {tool_proficiencies}
          </AlbumCard.InfoCell>
        )}

        {armor_proficiencies && (
          <AlbumCard.InfoCell label={t("armor_proficiencies")}>
            {armor_proficiencies}
          </AlbumCard.InfoCell>
        )}

        {starting_equipment && (
          <AlbumCard.InfoCell label={t("starting_equipment")}>
            <VStack align="flex-start" gap={0}>
              {starting_equipment.split("\n").map((group, i) => (
                <RichText key={i} text={group} />
              ))}
            </VStack>
          </AlbumCard.InfoCell>
        )}
      </AlbumCard.Info>
    </VStack>
  );
}

//------------------------------------------------------------------------------
// I18n Context
//------------------------------------------------------------------------------

const i18nContext = {
  armor_proficiencies: {
    en: "Armors",
    it: "Armature",
  },
  hp_die: {
    en: "Hit Point Die",
    it: "Dado Vita",
  },
  primary_abilities: {
    en: "Primary Abilities",
    it: "Caratteritiche",
  },
  saving_throw_proficiencies: {
    en: "Saving Throws",
    it: "Tiri Salvezza",
  },
  skill_proficiencies_pool: {
    en: "Skills",
    it: "Abilità",
  },
  starting_equipment: {
    en: "Equipment",
    it: "Equipaggiamento",
  },
  title: {
    en: "Character Class",
    it: "Classe Personaggio",
  },
  tool_proficiencies: {
    en: "Tools",
    it: "Strumenti",
  },
  weapon_proficiencies: {
    en: "Weapons",
    it: "Armi",
  },
};
