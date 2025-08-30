import { Span } from "@chakra-ui/react";
import type { WeaponTranslation } from "../../../../../../resources/weapon-translation";
import ResourceCard from "../../../../../../ui/resource-card";

//------------------------------------------------------------------------------
// Weapon Card
//------------------------------------------------------------------------------

export type WeaponCardProps = {
  resource: WeaponTranslation;
};

export default function WeaponCard({ resource }: WeaponCardProps) {
  const { campaign, name, page, properties, mastery, notes } = resource;

  return (
    <ResourceCard>
      <ResourceCard.Title title={name} />

      <ResourceCard.Caption>
        <Span>{properties}</Span>
        <Span>{mastery}</Span>
      </ResourceCard.Caption>

      <ResourceCard.Description description={notes} />

      <ResourceCard.Caption>
        <Span>{campaign}</Span>
        <Span>{page}</Span>
      </ResourceCard.Caption>
    </ResourceCard>
  );
}
