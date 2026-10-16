import type { Background } from "~/models/resources/backgrounds/background";
import type { LocalizedBackground } from "~/models/resources/backgrounds/localized-background";
import PokerCard from "~/ui/poker-card";
import { ResourcePokerCard, type ResourcePokerCardProps } from "../../resource-poker-card";

//------------------------------------------------------------------------------
// Background Card
//------------------------------------------------------------------------------

export type BackgroundCardProps = Omit<
  ResourcePokerCardProps<Background, LocalizedBackground>,
  "afterDetails" | "beforeDetails" | "firstPageInfo"
>;

export function BackgroundCard({
  localizedResource,
  onPageCountChange = () => {},
  palette,
  ...rest
}: BackgroundCardProps) {
  return (
    <ResourcePokerCard
      beforeDetails={
        <PokerCard.LabeledValues
          fields={[
            localizedResource.ability_scores,
            localizedResource.feat,
            localizedResource.skill_proficiencies,
            localizedResource.tool_proficiency,
          ]}
          palette={palette}
        />
      }
      localizedResource={localizedResource}
      onPageCountChange={onPageCountChange}
      palette={palette}
      {...rest}
    />
  );
}

BackgroundCard.Placeholder = ResourcePokerCard.Placeholder;
BackgroundCard.h = ResourcePokerCard.h;
BackgroundCard.w = ResourcePokerCard.w;
