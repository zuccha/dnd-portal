import type { ChronicleEntry } from "~/models/resources/chronicle-entries/chronicle-entry";
import type { LocalizedChronicleEntry } from "~/models/resources/chronicle-entries/localized-chronicle-entry";
import PokerCard from "~/ui/poker-card";
import { ResourcePokerCard, type ResourcePokerCardProps } from "../../resource-poker-card";

//------------------------------------------------------------------------------
// Chronicle Entry Card
//------------------------------------------------------------------------------

export type ChronicleEntryCardProps = Omit<
  ResourcePokerCardProps<ChronicleEntry, LocalizedChronicleEntry>,
  "afterDetails" | "beforeDetails" | "firstPageInfo"
>;

export function ChronicleEntryCard({
  linkResources = true,
  localizedResource,
  palette,
  ...props
}: ChronicleEntryCardProps) {
  const subjectField = {
    ...localizedResource.subjects,
    value:
      linkResources && localizedResource.subjects.resources.length ? (
        <PokerCard.Links palette={palette} resources={localizedResource.subjects.resources} />
      ) : (
        localizedResource.subjects.value
      ),
  };
  const fields = [
    ...(localizedResource.date.value ? [localizedResource.date] : []),
    ...(localizedResource.subjects.resources.length ? [subjectField] : []),
  ];

  return (
    <ResourcePokerCard
      beforeDetails={
        fields.length ? <PokerCard.LabeledValues fields={fields} palette={palette} /> : undefined
      }
      linkResources={linkResources}
      localizedResource={localizedResource}
      palette={palette}
      {...props}
    />
  );
}

ChronicleEntryCard.Placeholder = ResourcePokerCard.Placeholder;
ChronicleEntryCard.h = ResourcePokerCard.h;
ChronicleEntryCard.w = ResourcePokerCard.w;
