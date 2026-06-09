import type { Feature } from "~/models/resources/features/feature";
import type { LocalizedFeature } from "~/models/resources/features/localized-feature";
import {
  ResourcePokerCard,
  type ResourcePokerCardProps,
} from "../resource-poker-card";

//------------------------------------------------------------------------------
// Feature Card
//------------------------------------------------------------------------------

export type FeatureCardProps = Omit<
  ResourcePokerCardProps<Feature, LocalizedFeature>,
  "afterDetails" | "beforeDetails" | "firstPageInfo"
>;

export function FeatureCard({
  onPageCountChange = () => {},
  ...rest
}: FeatureCardProps) {
  return <ResourcePokerCard onPageCountChange={onPageCountChange} {...rest} />;
}

FeatureCard.Placeholder = ResourcePokerCard.Placeholder;
FeatureCard.h = ResourcePokerCard.h;
FeatureCard.w = ResourcePokerCard.w;
