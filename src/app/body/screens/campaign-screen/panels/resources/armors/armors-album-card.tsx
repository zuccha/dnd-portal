import { HStack, Span, type StackProps, VStack } from "@chakra-ui/react";
import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import type { LocalizedArmor } from "~/models/resources/equipment/armors/localized-armor";
import AlbumCard from "~/ui/album-card";

//------------------------------------------------------------------------------
// Armors Album Card Page 0
//------------------------------------------------------------------------------

export type ArmorsAlbumCardPage0Props = StackProps & {
  localizedResource: LocalizedArmor;
};

export function ArmorsAlbumCardPage0({
  localizedResource,
  ...rest
}: ArmorsAlbumCardPage0Props) {
  const { t } = useI18nLangContext(i18nContext);

  const {
    _raw,
    armor_class,
    cost,
    magic_type,
    notes,
    requirements,
    stealth,
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
        <AlbumCard.InfoCell label={t("armor_class")}>
          {armor_class}
        </AlbumCard.InfoCell>

        {_raw.disadvantage_on_stealth && (
          <AlbumCard.InfoCell label={t("stealth")}>
            {stealth}
          </AlbumCard.InfoCell>
        )}

        {requirements && (
          <AlbumCard.InfoCell label={t("requirements")}>
            {requirements}
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
  armor_class: {
    en: "Armor Class",
    it: "Classe Armatura",
  },
  requirements: {
    en: "Requirements",
    it: "Requisiti",
  },
  stealth: {
    en: "Stealth",
    it: "Furtività",
  },
};
