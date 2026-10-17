import { Span } from "@chakra-ui/react";
import type { Background } from "~/models/resources/backgrounds/background";
import type { LocalizedBackground } from "~/models/resources/backgrounds/localized-background";
import PokerCard from "~/ui/poker-card";
import ResourceCardLink from "../../resource-card-link";
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
  linkResources = true,
  onPageCountChange = () => {},
  palette,
  ...rest
}: BackgroundCardProps) {
  const fields = [
    localizedResource.ability_scores,
    {
      ...localizedResource.feat,
      value:
        linkResources && localizedResource.feat.id ? (
          <>
            <ResourceCardLink id={localizedResource.feat.id} kind="feat">
              {localizedResource.feat.link_text || localizedResource.feat.value}
            </ResourceCardLink>
            {localizedResource.feat.notes && <Span> ({localizedResource.feat.notes})</Span>}
          </>
        ) : (
          localizedResource.feat.value
        ),
    },
    localizedResource.skill_proficiencies,
    {
      ...localizedResource.tool_proficiency,
      value:
        linkResources && localizedResource.tool_proficiency.id ? (
          <>
            <ResourceCardLink id={localizedResource.tool_proficiency.id} kind="tool">
              {localizedResource.tool_proficiency.link_text ||
                localizedResource.tool_proficiency.value}
            </ResourceCardLink>
            {localizedResource.tool_proficiency.notes && (
              <Span> ({localizedResource.tool_proficiency.notes})</Span>
            )}
          </>
        ) : (
          localizedResource.tool_proficiency.value
        ),
    },
  ];

  return (
    <ResourcePokerCard
      beforeDetails={<PokerCard.LabeledValues fields={fields} palette={palette} />}
      localizedResource={localizedResource}
      linkResources={linkResources}
      onPageCountChange={onPageCountChange}
      palette={palette}
      {...rest}
    />
  );
}

BackgroundCard.Placeholder = ResourcePokerCard.Placeholder;
BackgroundCard.h = ResourcePokerCard.h;
BackgroundCard.w = ResourcePokerCard.w;
