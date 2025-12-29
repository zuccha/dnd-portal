import { Span, type StackProps, VStack } from "@chakra-ui/react";
import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import type { LocalizedSpell } from "~/models/resources/spells/localized-spell";
import AlbumCard from "~/ui/album-card";

//------------------------------------------------------------------------------
// Spells Album Card Page 0
//------------------------------------------------------------------------------

export type SpellsAlbumCardPage0Props = StackProps & {
  localizedResource: LocalizedSpell;
};

export function SpellsAlbumCardPage0({
  localizedResource,
  ...rest
}: SpellsAlbumCardPage0Props) {
  const {
    casting_time_with_ritual,
    character_classes,
    components,
    description,
    duration_with_concentration,
    materials,
    range,
    school_with_level,
  } = localizedResource;

  const { t } = useI18nLangContext(i18nContext);

  return (
    <VStack {...rest}>
      <AlbumCard.Caption>
        <Span whiteSpace="nowrap">{school_with_level}</Span>
        <Span textAlign="right">{character_classes}</Span>
      </AlbumCard.Caption>

      <AlbumCard.Info>
        <AlbumCard.InfoCell label={t("casting_time")}>
          {casting_time_with_ritual}
        </AlbumCard.InfoCell>

        <AlbumCard.InfoCell label={t("range")}>{range}</AlbumCard.InfoCell>

        <AlbumCard.InfoCell label={t("duration")}>
          {duration_with_concentration}
        </AlbumCard.InfoCell>

        <AlbumCard.InfoCell label={t("components")}>
          {components}
        </AlbumCard.InfoCell>

        {materials && (
          <AlbumCard.InfoCell label={t("materials")}>
            {materials}
          </AlbumCard.InfoCell>
        )}
      </AlbumCard.Info>

      <AlbumCard.Description description={description} />
    </VStack>
  );
}

//------------------------------------------------------------------------------
// I18n Context
//------------------------------------------------------------------------------

const i18nContext = {
  casting_time: {
    en: "Casting Time",
    it: "Lancio",
  },
  components: {
    en: "Components",
    it: "Componenti",
  },
  duration: {
    en: "Duration",
    it: "Durata",
  },
  materials: {
    en: "Materials",
    it: "Materiali",
  },
  range: {
    en: "Range",
    it: "Gittata",
  },
};
