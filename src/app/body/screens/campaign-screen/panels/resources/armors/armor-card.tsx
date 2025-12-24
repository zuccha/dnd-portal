import { SimpleGrid, Span } from "@chakra-ui/react";
import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import type { Armor } from "~/models/resources/armors/armor";
import { useIsArmorSelected } from "~/models/resources/armors/armors-store";
import type { LocalizedArmor } from "~/models/resources/armors/localized-armor";
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
    campaign,
    cost,
    id,
    name,
    notes,
    required_cha,
    required_con,
    required_dex,
    required_int,
    required_str,
    required_wis,
    stealth,
    type,
    weight,
  } = localizedResource;

  const [selected, { toggle }] = useIsArmorSelected(id);

  return (
    <ResourceCard
      canEdit={canEdit}
      name={name}
      onOpen={() => onOpen(localizedResource._raw)}
      onToggleSelected={toggle}
      selected={selected}
      visibility={_raw.visibility}
    >
      <ResourceCard.Caption>
        <Span>{type}</Span>
        <Span>{weight}</Span>
      </ResourceCard.Caption>

      <SimpleGrid
        fontSize="xs"
        gap={1}
        px={3}
        py={2}
        templateColumns="1fr 2fr"
        w="full"
      >
        <Span color="fg.muted">{t("armor_class")}</Span>
        <Span>{armor_class}</Span>

        <Span color="fg.muted">{t("stealth")}</Span>
        <Span>{stealth}</Span>

        <Span color="fg.muted">{t("requirements")}</Span>
        <SimpleGrid
          gapX={0}
          gapY={1}
          templateColumns="1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr"
          w="full"
        >
          <Span color="fg.muted">{t("ability[str].required")}</Span>
          <Span textAlign="right">{required_str}</Span>

          <Span />

          <Span color="fg.muted">{t("ability[dex].required")}</Span>
          <Span textAlign="right">{required_dex}</Span>

          <Span />

          <Span color="fg.muted">{t("ability[con].required")}</Span>
          <Span textAlign="right">{required_con}</Span>

          <Span />

          <Span color="fg.muted">{t("ability[int].required")}</Span>
          <Span textAlign="right">{required_int}</Span>

          <Span />

          <Span color="fg.muted">{t("ability[wis].required")}</Span>
          <Span textAlign="right">{required_wis}</Span>

          <Span />

          <Span color="fg.muted">{t("ability[cha].required")}</Span>
          <Span textAlign="right">{required_cha}</Span>

          <Span />
        </SimpleGrid>
      </SimpleGrid>

      <ResourceCard.Description description={notes} />

      <ResourceCard.Caption>
        <Span>{cost}</Span>
        <Span>{campaign}</Span>
      </ResourceCard.Caption>
    </ResourceCard>
  );
}

//------------------------------------------------------------------------------
// I18n Context
//------------------------------------------------------------------------------

const i18nContext = {
  "ability[cha].required": {
    en: "Cha",
    it: "Car",
  },
  "ability[con].required": {
    en: "Con",
    it: "Cos",
  },
  "ability[dex].required": {
    en: "Dex",
    it: "Des",
  },
  "ability[int].required": {
    en: "Int",
    it: "Int",
  },
  "ability[str].required": {
    en: "Str",
    it: "For",
  },
  "ability[wis].required": {
    en: "Wis",
    it: "Sag",
  },
  "armor_class": {
    en: "Armor Class",
    it: "Classe Armatura",
  },
  "requirements": {
    en: "Requirements",
    it: "Requisiti",
  },
  "stealth": {
    en: "Stealth",
    it: "Furtività",
  },
};
