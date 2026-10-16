import type { Armor } from "~/models/resources/equipment/armors/armor";
import type { LocalizedArmor } from "~/models/resources/equipment/armors/localized-armor";
import PokerCard from "~/ui/poker-card";
import { EquipmentCard } from "../../panel/equipment-card";
import type { ResourcePokerCardProps } from "../../../resource-poker-card";

export type ArmorCardProps = Omit<
  ResourcePokerCardProps<Armor, LocalizedArmor>,
  "afterDetails" | "beforeDetails" | "firstPageInfo"
>;

export function ArmorCard({
  localizedResource,
  onPageCountChange = () => {},
  palette,
  ...rest
}: ArmorCardProps) {
  return (
    <EquipmentCard
      beforeDetails={
        (localizedResource.requirements.value || localizedResource.stealth.value) && (
          <PokerCard.LabeledValues
            fields={[localizedResource.requirements, localizedResource.stealth]}
            palette={palette}
          />
        )
      }
      firstPageInfoRight={
        <PokerCard.Arrow
          label={localizedResource.armor_class.label}
          palette={palette}
          value={localizedResource.armor_class.value}
        />
      }
      localizedResource={localizedResource}
      onPageCountChange={onPageCountChange}
      palette={palette}
      {...rest}
    />
  );
}

ArmorCard.Placeholder = EquipmentCard.Placeholder;
ArmorCard.h = EquipmentCard.h;
ArmorCard.w = EquipmentCard.w;
