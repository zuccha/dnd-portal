import type { Calendar } from "~/models/resources/calendars/calendar";
import type { LocalizedCalendar } from "~/models/resources/calendars/localized-calendar";
import PokerCard from "~/ui/poker-card";
import { ResourcePokerCard, type ResourcePokerCardProps } from "../../resource-poker-card";

//------------------------------------------------------------------------------
// Calendar Card
//------------------------------------------------------------------------------

export type CalendarCardProps = ResourcePokerCardProps<Calendar, LocalizedCalendar>;

export function CalendarCard({ localizedResource, palette, ...rest }: CalendarCardProps) {
  return (
    <ResourcePokerCard
      beforeDetails={
        <PokerCard.LabeledValues
          fields={[
            localizedResource.eras,
            localizedResource.months,
            localizedResource.weekdays,
            localizedResource.first_day_of_first_year_weekday,
          ].filter(({ value }) => value.length > 0)}
          palette={palette}
        />
      }
      localizedResource={localizedResource}
      palette={palette}
      {...rest}
    />
  );
}

CalendarCard.Placeholder = ResourcePokerCard.Placeholder;
CalendarCard.h = ResourcePokerCard.h;
CalendarCard.w = ResourcePokerCard.w;
