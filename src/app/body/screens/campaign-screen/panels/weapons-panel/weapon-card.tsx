import { Span } from "@chakra-ui/react";
import { useI18nLangContext } from "../../../../../../i18n/i18n-lang-context";
import type { LocalizedWeapon } from "../../../../../../resources/localized-weapon";
import { useIsWeaponSelected } from "../../../../../../resources/weapon";
import ResourceCard from "../resources/resource-card";

//------------------------------------------------------------------------------
// Weapon Card
//------------------------------------------------------------------------------

export type WeaponCardProps = {
  onClickTitle?: () => void;
  resource: LocalizedWeapon;
};

export default function WeaponCard({
  onClickTitle,
  resource,
}: WeaponCardProps) {
  const { campaign, cost, description, id, name, type, weight } = resource;

  const { t } = useI18nLangContext(i18nContext);

  const [selected, { toggle }] = useIsWeaponSelected(id);

  return (
    <ResourceCard>
      <ResourceCard.Header onToggleSelection={toggle} selected={selected}>
        <ResourceCard.Title onClick={onClickTitle}>
          {name || <Span fontStyle="italic">{t("name.missing")}</Span>}
        </ResourceCard.Title>
      </ResourceCard.Header>

      <ResourceCard.Caption>
        <Span>{type}</Span>
        <Span>{weight}</Span>
      </ResourceCard.Caption>

      <ResourceCard.Description description={description} />

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
  "name.missing": {
    en: "Untitled",
    it: "Senza titolo",
  },
};
