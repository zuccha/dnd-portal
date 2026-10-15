import type { LocalizedWeapon } from "~/models/resources/equipment/weapons/localized-weapon";
import type { Weapon } from "~/models/resources/equipment/weapons/weapon";
import PokerCard from "~/ui/poker-card";
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
  onPageCountChange = () => {},
  palette,
  ...rest
}: WeaponCardProps) {
  return (
    <EquipmentCard
      beforeDetails={
        <PokerCard.LabeledValues
          fields={[
            localizedResource.properties,
            localizedResource.range,
            localizedResource.ammunition,
          ]}
          palette={palette}
        />
      }
      firstPageInfoRight={
        <PokerCard.Arrow
          label={localizedResource.damageType.label}
          palette={palette}
          value={localizedResource.damageLine}
        />
      }
      localizedResource={localizedResource}
      onPageCountChange={onPageCountChange}
      palette={palette}
      {...rest}
    />
  );
}

WeaponCard.Placeholder = EquipmentCard.Placeholder;
WeaponCard.h = EquipmentCard.h;
WeaponCard.w = EquipmentCard.w;
