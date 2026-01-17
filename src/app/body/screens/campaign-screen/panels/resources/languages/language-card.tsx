import type { Language } from "~/models/resources/languages/language";
import type { LocalizedLanguage } from "~/models/resources/languages/localized-language";
import PokerCard from "../../../../../../../ui/poker-card";
import {
  ResourcePokerCard,
  type ResourcePokerCardProps,
} from "../_base/resource-poker-card";

//------------------------------------------------------------------------------
// Language Card
//------------------------------------------------------------------------------

export type LanguageCardProps = Omit<
  ResourcePokerCardProps<Language, LocalizedLanguage>,
  "afterDetails" | "beforeDetails" | "firstPageInfo"
>;

export function LanguageCard({
  localizedResource,
  onPageCountChange = () => {},
  palette,
  ...rest
}: LanguageCardProps) {
  return (
    <ResourcePokerCard
      beforeDetails={
        localizedResource.info && (
          <PokerCard.Info palette={palette}>
            {localizedResource.info}
          </PokerCard.Info>
        )
      }
      localizedResource={localizedResource}
      onPageCountChange={onPageCountChange}
      palette={palette}
      {...rest}
    />
  );
}

LanguageCard.h = PokerCard.cardH;
LanguageCard.w = PokerCard.cardW;
