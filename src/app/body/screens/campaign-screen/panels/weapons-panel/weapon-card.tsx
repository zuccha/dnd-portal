import { Span } from "@chakra-ui/react";
import { useIsWeaponSelected } from "../../../../../../resources/weapon";
import type { WeaponTranslation } from "../../../../../../resources/weapon-translation";
import ResourceCard from "../resources/resource-card";

//------------------------------------------------------------------------------
// Weapon Card
//------------------------------------------------------------------------------

export type WeaponCardProps = {
  onClickTitle?: () => void;
  resource: WeaponTranslation;
};

export default function WeaponCard({
  onClickTitle,
  resource,
}: WeaponCardProps) {
  const { campaign, cost, description, id, name, type, weight } = resource;

  const [selected, { toggle }] = useIsWeaponSelected(id);

  return (
    <ResourceCard>
      <ResourceCard.Header onToggleSelection={toggle} selected={selected}>
        <ResourceCard.Title onClick={onClickTitle}>{name}</ResourceCard.Title>
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
