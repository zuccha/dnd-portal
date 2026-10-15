import type { Language } from "~/models/resources/languages/language";
import type { LocalizedLanguage } from "~/models/resources/languages/localized-language";
import PokerCard from "~/ui/poker-card";
import { ResourcePokerCard, type ResourcePokerCardProps } from "../../resource-poker-card";

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
        localizedResource.origin.value && (
          <PokerCard.LabeledValues fields={[localizedResource.origin]} palette={palette} />
        )
      }
      localizedResource={localizedResource}
      onPageCountChange={onPageCountChange}
      palette={palette}
      {...rest}
    />
  );
}

LanguageCard.Placeholder = ResourcePokerCard.Placeholder;
LanguageCard.h = ResourcePokerCard.h;
LanguageCard.w = ResourcePokerCard.w;
