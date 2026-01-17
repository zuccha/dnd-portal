import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import type { Creature } from "~/models/resources/creatures/creature";
import type { LocalizedCreature } from "~/models/resources/creatures/localized-creature";
import PokerCard from "../../../../../../../ui/poker-card";
import {
  ResourcePokerCard,
  type ResourcePokerCardProps,
} from "../_base/resource-poker-card";

//------------------------------------------------------------------------------
// Creature Card
//------------------------------------------------------------------------------

export type CreatureCardProps = Omit<
  ResourcePokerCardProps<Creature, LocalizedCreature>,
  "afterDetails" | "beforeDetails" | "firstPageInfo"
>;

export function CreatureCard({
  localizedResource,
  onPageCountChange = () => {},
  palette,
  ...rest
}: CreatureCardProps) {
  /* const { t } = */ useI18nLangContext(i18nContext);

  return (
    <ResourcePokerCard
      localizedResource={localizedResource}
      onPageCountChange={onPageCountChange}
      palette={palette}
      {...rest}
    />
  );
}

CreatureCard.h = PokerCard.cardH;
CreatureCard.w = PokerCard.cardW;

//------------------------------------------------------------------------------
// I18n Context
//------------------------------------------------------------------------------

const i18nContext = {
  todo: {
    en: "TODO",
    it: "TODO",
  },
};
