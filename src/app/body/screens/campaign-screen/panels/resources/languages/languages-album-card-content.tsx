import { type StackProps, VStack } from "@chakra-ui/react";
import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import type { LocalizedLanguage } from "~/models/resources/languages/localized-language";
import AlbumCard from "~/ui/album-card";

//------------------------------------------------------------------------------
// Languages Album Card Content
//------------------------------------------------------------------------------

export type LanguagesAlbumCardContentProps = StackProps & {
  localizedResource: LocalizedLanguage;
};

export default function LanguagesAlbumCardContent({
  localizedResource,
  ...rest
}: LanguagesAlbumCardContentProps) {
  const { t, ti } = useI18nLangContext(i18nContext);

  const { origin, rarity } = localizedResource;

  return (
    <VStack {...rest}>
      <AlbumCard.Caption>{ti("rarity", rarity)}</AlbumCard.Caption>

      <AlbumCard.Info>
        <AlbumCard.InfoCell label={t("origin")}>
          {origin || t("origin.unknown")}
        </AlbumCard.InfoCell>
      </AlbumCard.Info>
    </VStack>
  );
}

//------------------------------------------------------------------------------
// I18n Context
//------------------------------------------------------------------------------

const i18nContext = {
  "origin": {
    en: "Origin",
    it: "Origine",
  },
  "origin.unknown": {
    en: "Unknown",
    it: "Sconosciuta",
  },
  "rarity": {
    en: "<1> Language",
    it: "Lingua <1>",
  },
};
