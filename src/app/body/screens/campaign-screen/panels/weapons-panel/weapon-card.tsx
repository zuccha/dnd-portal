import { Span } from "@chakra-ui/react";
import type { LocalizedWeapon } from "../../../../../../resources/localized-weapon";
import { useIsWeaponSelected } from "../../../../../../resources/weapon";
import ResourceCard from "../resources/resource-card";

//------------------------------------------------------------------------------
// Weapon Card
//------------------------------------------------------------------------------

export type WeaponCardProps = {
  isGM: boolean;
  onClickTitle: () => void;
  resource: LocalizedWeapon;
};

export default function WeaponCard({
  isGM,
  onClickTitle,
  resource,
}: WeaponCardProps) {
  const { _raw, campaign, cost, description, id, name, type, weight } =
    resource;

  const [selected, { toggle }] = useIsWeaponSelected(id);

  return (
    <ResourceCard>
      <ResourceCard.Header
        isGM={isGM}
        name={name}
        onClick={onClickTitle}
        onToggleSelection={toggle}
        selected={selected}
        visibility={_raw.visibility}
      />

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
