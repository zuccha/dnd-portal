import type { CharacterSubclass } from "~/models/resources/character-subclasses/character-subclass";
import type { LocalizedCharacterSubclass } from "~/models/resources/character-subclasses/localized-character-subclass";
import {
  ResourcePokerCard,
  type ResourcePokerCardProps,
} from "../resource-poker-card";

//------------------------------------------------------------------------------
// Character Subclass Card
//------------------------------------------------------------------------------

export type CharacterSubclassCardProps = Omit<
  ResourcePokerCardProps<CharacterSubclass, LocalizedCharacterSubclass>,
  "afterDetails" | "beforeDetails" | "firstPageInfo"
>;

export function CharacterSubclassCard({
  localizedResource,
  onPageCountChange = () => {},
  palette,
  ...rest
}: CharacterSubclassCardProps) {
  return (
    <ResourcePokerCard
      localizedResource={localizedResource}
      onPageCountChange={onPageCountChange}
      palette={palette}
      {...rest}
    />
  );
}

CharacterSubclassCard.Placeholder = ResourcePokerCard.Placeholder;
CharacterSubclassCard.h = ResourcePokerCard.h;
CharacterSubclassCard.w = ResourcePokerCard.w;
