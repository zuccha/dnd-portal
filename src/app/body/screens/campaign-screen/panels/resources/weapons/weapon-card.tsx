import { HStack, Span, VStack } from "@chakra-ui/react";
import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import type { LocalizedWeapon } from "~/models/resources/equipment/weapons/localized-weapon";
import type { Weapon } from "~/models/resources/equipment/weapons/weapon";
import { useIsWeaponSelected } from "~/models/resources/equipment/weapons/weapons-store";
import ResourceCard from "../_base/resource-card";

//------------------------------------------------------------------------------
// Weapon Card
//------------------------------------------------------------------------------

export type WeaponCardProps = {
  canEdit: boolean;
  localizedResource: LocalizedWeapon;
  onOpen: (resource: Weapon) => void;
};

export default function WeaponCard({
  canEdit,
  localizedResource,
  onOpen,
}: WeaponCardProps) {
  const { t } = useI18nLangContext(i18nContext);

  const {
    cost,
    damage_extended,
    id,
    magic_type,
    mastery,
    notes,
    properties_extended,
    type,
    weight,
  } = localizedResource;

  const [selected, { toggle }] = useIsWeaponSelected(id);

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
        <ResourceCard.InfoCell label={t("damage")}>
          {damage_extended}
        </ResourceCard.InfoCell>

        {properties_extended && (
          <ResourceCard.InfoCell label={t("properties")}>
            {properties_extended}
          </ResourceCard.InfoCell>
        )}

        {mastery && (
          <ResourceCard.InfoCell label={t("mastery")}>
            {mastery}
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
