import { Span } from "@chakra-ui/react";
import type { LocalizedWeapon } from "../../../../../../../resources/weapons/localized-weapon";
import type { Weapon } from "../../../../../../../resources/weapons/weapon";
import { useIsWeaponSelected } from "../../../../../../../resources/weapons/weapons-store";
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
  const { _raw, campaign, cost, description, id, name, type, weight } =
    localizedResource;

  const [selected, { toggle }] = useIsWeaponSelected(id);

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

      <ResourceCard.Description description={description} />

      <ResourceCard.Caption>
        <Span>{cost}</Span>
        <Span>{campaign}</Span>
      </ResourceCard.Caption>
    </ResourceCard>
  );
}
