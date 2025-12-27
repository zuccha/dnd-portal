import { HStack, Span, type StackProps, VStack } from "@chakra-ui/react";
import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import type { LocalizedWeapon } from "~/models/resources/equipment/weapons/localized-weapon";
import AlbumCard from "~/ui/album-card";

//------------------------------------------------------------------------------
// Weapons Album Card Content
//------------------------------------------------------------------------------

export type WeaponsAlbumCardContentProps = StackProps & {
  localizedResource: LocalizedWeapon;
};

export default function WeaponsAlbumCardContent({
  localizedResource,
  ...rest
}: WeaponsAlbumCardContentProps) {
  const { t } = useI18nLangContext(i18nContext);

  const {
    cost,
    damage_extended,
    magic_type,
    mastery,
    notes,
    properties_extended,
    type,
    weight,
  } = localizedResource;

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
        <AlbumCard.InfoCell label={t("damage")}>
          {damage_extended}
        </AlbumCard.InfoCell>

        {properties_extended && (
          <AlbumCard.InfoCell label={t("properties")}>
            {properties_extended}
          </AlbumCard.InfoCell>
        )}

        {mastery && (
          <AlbumCard.InfoCell label={t("mastery")}>
            {mastery}
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
  damage: {
    en: "Damage",
    it: "Danni",
  },
  mastery: {
    en: "Mastery",
    it: "Padronanza",
  },
  properties: {
    en: "Properties",
    it: "Proprietà",
  },
};
