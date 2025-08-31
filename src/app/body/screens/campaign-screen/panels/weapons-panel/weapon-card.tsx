import { Span } from "@chakra-ui/react";
import { useIsWeaponSelected } from "../../../../../../resources/weapon";
import type { WeaponTranslation } from "../../../../../../resources/weapon-translation";
import ResourceCard from "../resource-card";

//------------------------------------------------------------------------------
// Weapon Card
//------------------------------------------------------------------------------

export type WeaponCardProps = {
  resource: WeaponTranslation;
};

export default function WeaponCard({ resource }: WeaponCardProps) {
  const { campaign_with_page, description, id, name, type } = resource;

  const [selected, { toggle }] = useIsWeaponSelected(id);

  return (
    <ResourceCard>
      <ResourceCard.Header onToggleSelection={toggle} selected={selected}>
        <ResourceCard.Title>{name}</ResourceCard.Title>
      </ResourceCard.Header>

      <ResourceCard.Caption>
        <Span>{type}</Span>
      </ResourceCard.Caption>

      <ResourceCard.Description description={description} />

      <ResourceCard.Caption>
        <Span></Span>
        <Span>{campaign_with_page}</Span>
      </ResourceCard.Caption>
    </ResourceCard>
  );
}
