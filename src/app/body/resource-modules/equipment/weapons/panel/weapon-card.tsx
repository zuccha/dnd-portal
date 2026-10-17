import type { LocalizedWeapon } from "~/models/resources/equipment/weapons/localized-weapon";
import type { Weapon } from "~/models/resources/equipment/weapons/weapon";
import PokerCard from "~/ui/poker-card";
import ResourceCardLinks from "../../../resource-card-links";
import { EquipmentCard } from "../../panel/equipment-card";
import type { ResourcePokerCardProps } from "../../../resource-poker-card";

//------------------------------------------------------------------------------
// Weapon Card
//------------------------------------------------------------------------------

export type WeaponCardProps = Omit<
  ResourcePokerCardProps<Weapon, LocalizedWeapon>,
  "afterDetails" | "beforeDetails" | "firstPageInfo"
>;

export function WeaponCard({
  localizedResource,
  linkResources = true,
  onPageCountChange = () => {},
  palette,
  ...rest
}: WeaponCardProps) {
  const ammunitionField =
    linkResources && localizedResource.ammunition.resources.length > 0
      ? {
          ...localizedResource.ammunition,
          value: <ResourceCardLinks resources={localizedResource.ammunition.resources} />,
        }
      : localizedResource.ammunition;

  return (
    <EquipmentCard
      beforeDetails={
        <PokerCard.LabeledValues
          fields={[localizedResource.properties, localizedResource.range, ammunitionField]}
          palette={palette}
        />
      }
      firstPageInfoRight={
        <PokerCard.Arrow
          label={localizedResource.damage_type.label}
          palette={palette}
          value={localizedResource.damage_line}
        />
      }
      localizedResource={localizedResource}
      linkResources={linkResources}
      onPageCountChange={onPageCountChange}
      palette={palette}
      {...rest}
    />
  );
}

WeaponCard.Placeholder = EquipmentCard.Placeholder;
WeaponCard.h = EquipmentCard.h;
WeaponCard.w = EquipmentCard.w;
