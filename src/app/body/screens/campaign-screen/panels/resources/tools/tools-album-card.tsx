import { HStack, Span, type StackProps, VStack } from "@chakra-ui/react";
import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import type { LocalizedTool } from "~/models/resources/equipment/tools/localized-tool";
import AlbumCard from "~/ui/album-card";
import RichText from "~/ui/rich-text";

//------------------------------------------------------------------------------
// Tools Album Card Page 0
//------------------------------------------------------------------------------

export type ToolsAlbumCardPage0Props = StackProps & {
  localizedResource: LocalizedTool;
};

export function ToolsAlbumCardPage0({
  localizedResource,
  ...rest
}: ToolsAlbumCardPage0Props) {
  const { t } = useI18nLangContext(i18nContext);
  const { ability, cost, craft, magic_type, notes, type, utilize, weight } =
    localizedResource;
  return (
    <VStack {...rest}>
      <AlbumCard.Caption>
        <VStack gap={0} w="full">
          <HStack justify="space-between" w="full">
            <Span>{type}</Span>
            <Span>{cost}</Span>
          </HStack>
          <HStack justify="space-between" w="full">
            <Span>{magic_type}</Span>
            <Span>{weight}</Span>
          </HStack>
        </VStack>
      </AlbumCard.Caption>

      <AlbumCard.Info>
        <AlbumCard.InfoCell label={t("ability")}>{ability}</AlbumCard.InfoCell>

        {utilize && (
          <AlbumCard.InfoCell label={t("utilize")}>
            {utilize}
          </AlbumCard.InfoCell>
        )}

        {craft && (
          <AlbumCard.InfoCell label={t("craft")}>
            <RichText text={craft} />
          </AlbumCard.InfoCell>
        )}
      </AlbumCard.Info>

      <AlbumCard.Description description={notes} />
    </VStack>
  );
}

//------------------------------------------------------------------------------
// I18n Context
//------------------------------------------------------------------------------

const i18nContext = {
  ability: {
    en: "Ability",
    it: "Abilità",
  },
  craft: {
    en: "Craft",
    it: "Creazione",
  },
  utilize: {
    en: "Utilize",
    it: "Utilizzo",
  },
};
