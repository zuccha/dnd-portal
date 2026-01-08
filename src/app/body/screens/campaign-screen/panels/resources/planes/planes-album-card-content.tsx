import { type StackProps, VStack } from "@chakra-ui/react";
import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import type { LocalizedPlane } from "~/models/resources/planes/localized-plane";
import AlbumCard from "~/ui/album-card";

//------------------------------------------------------------------------------
// Planes Album Card Content
//------------------------------------------------------------------------------

export type PlanesAlbumCardContentProps = StackProps & {
  localizedResource: LocalizedPlane;
};

export default function PlanesAlbumCardContent({
  localizedResource,
  ...rest
}: PlanesAlbumCardContentProps) {
  const { t } = useI18nLangContext(i18nContext);

  const { alignments, category } = localizedResource;

  return (
    <VStack {...rest}>
      <AlbumCard.Caption>{category}</AlbumCard.Caption>

      {alignments && (
        <AlbumCard.Info>
          <AlbumCard.InfoCell label={t("alignments")}>
            {alignments}
          </AlbumCard.InfoCell>
        </AlbumCard.Info>
      )}
    </VStack>
  );
}

//------------------------------------------------------------------------------
// I18n Context
//------------------------------------------------------------------------------

const i18nContext = {
  alignments: {
    en: "Alignment",
    it: "Allineamento",
  },
};
