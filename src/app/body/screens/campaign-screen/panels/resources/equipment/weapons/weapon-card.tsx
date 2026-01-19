import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import type { LocalizedWeapon } from "~/models/resources/equipment/weapons/localized-weapon";
import type { Weapon } from "~/models/resources/equipment/weapons/weapon";
import PokerCard from "~/ui/poker-card";
import type { ResourcePokerCardProps } from "../../resource-poker-card";
import { EquipmentCard } from "../equipment-card";

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
  const { ti } = useI18nLangContext(i18nContext);

  return (
    <EquipmentCard
      beforeDetails={
        localizedResource.info && (
          <PokerCard.Info palette={palette}>
            {localizedResource.info}
          </PokerCard.Info>
        )
      }
      firstPageInfoRight={
        <PokerCard.Arrow
          label={ti("damage", localizedResource.damage_type)}
          palette={palette}
          value={
            localizedResource.damage_versatile ?
              `${localizedResource.damage} (${localizedResource.damage_versatile})`
            : localizedResource.damage
          }
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

//------------------------------------------------------------------------------
// I18n Context
//------------------------------------------------------------------------------

const i18nContext = {
  damage: {
    en: "<1> Damage",
    it: "Danni <1>",
  },
};
