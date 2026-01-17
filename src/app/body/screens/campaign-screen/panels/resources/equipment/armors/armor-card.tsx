import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import type { Armor } from "~/models/resources/equipment/armors/armor";
import type { LocalizedArmor } from "~/models/resources/equipment/armors/localized-armor";
import PokerCard from "../../../../../../../../ui/poker-card";
import type { ResourcePokerCardProps } from "../../_base/resource-poker-card";
import { EquipmentCard } from "../equipment-card";

//------------------------------------------------------------------------------
// Armor Card
//------------------------------------------------------------------------------

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
  const { t } = useI18nLangContext(i18nContext);

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
          label={t("armor_class")}
          palette={palette}
          value={localizedResource.armor_class}
        />
      }
      localizedResource={localizedResource}
      onPageCountChange={onPageCountChange}
      palette={palette}
      {...rest}
    />
  );
}

ArmorCard.h = PokerCard.cardH;
ArmorCard.w = PokerCard.cardW;

//------------------------------------------------------------------------------
// I18n Context
//------------------------------------------------------------------------------

const i18nContext = {
  armor_class: {
    en: "Armor Class",
    it: "Classe Armatura",
  },
};
