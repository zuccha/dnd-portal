import { SimpleGrid, Text } from "@chakra-ui/react";
import { calendarStore } from "~/models/resources/calendars/calendar-store";
import ResourceDetail, { type ResourceDetailAction } from "../../resource-detail";
import ResourceDetailField from "../../resource-detail-field";

type CalendarDetailResource = ReturnType<typeof calendarStore.useLocalizedResource>;

//------------------------------------------------------------------------------
// Calendar Detail
//------------------------------------------------------------------------------

export default function CalendarDetail({
  actions,
  resource,
}: {
  actions?: ResourceDetailAction[];
  resource: CalendarDetailResource;
}) {
  const calendar = resource;

  return (
    <ResourceDetail actions={actions} resource={calendar}>
      {calendar && (
        <SimpleGrid columns={1} rowGap={3}>
          <ResourceDetailField label={calendar.eras.label}>
            {calendar.eras.value || "-"}
          </ResourceDetailField>
          <ResourceDetailField label={calendar.months.label}>
            <Text whiteSpace="pre-line">{calendar.months.value || "-"}</Text>
          </ResourceDetailField>
          <ResourceDetailField label={calendar.weekdays.label}>
            {calendar.weekdays.value || "-"}
          </ResourceDetailField>
          <ResourceDetailField label={calendar.first_day_of_first_year_weekday.label}>
            {calendar.first_day_of_first_year_weekday.value || "-"}
          </ResourceDetailField>
        </SimpleGrid>
      )}
    </ResourceDetail>
  );
}
