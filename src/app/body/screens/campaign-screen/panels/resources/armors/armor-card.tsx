import { HStack, Span, VStack } from "@chakra-ui/react";
import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import type { Armor } from "~/models/resources/equipment/armors/armor";
import { useIsArmorSelected } from "~/models/resources/equipment/armors/armors-store";
import type { LocalizedArmor } from "~/models/resources/equipment/armors/localized-armor";
import ResourceCard from "../_base/resource-card";

//------------------------------------------------------------------------------
// Armor Card
//------------------------------------------------------------------------------

export type ArmorCardProps = {
  canEdit: boolean;
  localizedResource: LocalizedArmor;
  onOpen: (resource: Armor) => void;
};

export default function ArmorCard({
  canEdit,
  localizedResource,
  onOpen,
}: ArmorCardProps) {
  const { t } = useI18nLangContext(i18nContext);

  const {
    _raw,
    armor_class,
    cost,
    id,
    notes,
    magic_type,
    requirements,
    stealth,
    type,
    weight,
  } = localizedResource;

  const [selected, { toggle }] = useIsArmorSelected(id);

  return (
    <ResourceCard
      canEdit={canEdit}
      localizedResource={localizedResource}
      onOpen={onOpen}
      onToggleSelected={toggle}
      selected={selected}
    >
      <ResourceCard.Caption>
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
      </ResourceCard.Caption>

      <ResourceCard.Info>
        <ResourceCard.InfoCell label={t("armor_class")}>
          {armor_class}
        </ResourceCard.InfoCell>

        {_raw.disadvantage_on_stealth && (
          <ResourceCard.InfoCell label={t("stealth")}>
            {stealth}
          </ResourceCard.InfoCell>
        )}

        {requirements && (
          <ResourceCard.InfoCell label={t("requirements")}>
            {requirements}
          </ResourceCard.InfoCell>
        )}
      </ResourceCard.Info>

      <ResourceCard.Description description={notes} />
    </ResourceCard>
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
