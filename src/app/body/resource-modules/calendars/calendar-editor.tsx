import { HStack, Span, StackSeparator, Text, VStack } from "@chakra-ui/react";
import { PlusIcon } from "lucide-react";
import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import { translate } from "~/i18n/i18n-string";
import type { Calendar } from "~/models/resources/calendars/calendar";
import type { CalendarFormData } from "~/models/resources/calendars/calendar-form";
import Field from "~/ui/field";
import IconButton from "~/ui/icon-button";
import Select from "~/ui/select";
import { useSortableList } from "~/ui/use-sortable-list";
import type { Form } from "~/utils/form";
import { createResourceEditor } from "../resource-editor";
import { useResourceEditorLang } from "../resource-editor-language-context";
import CalendarEraEditor from "./editor/calendar-era-editor";
import CalendarMonthEditor from "./editor/calendar-month-editor";
import CalendarWeekdayEditor from "./editor/calendar-weekday-editor";

//------------------------------------------------------------------------------
// Create Calendar Editor
//------------------------------------------------------------------------------

export function createCalendarEditor(form: Form<CalendarFormData>) {
  const ResourceEditor = createResourceEditor(form);

  const useErasField = form.createUseField("eras");
  const useMonthsField = form.createUseField("months");
  const useWeekdaysField = form.createUseField("weekdays");
  const useFirstWeekdayField = form.createUseField("first_day_of_first_year_weekday_index");

  return function CalendarEditor({ resource }: { resource: Calendar }) {
    const { lang } = useResourceEditorLang();
    const { t } = useI18nLangContext(i18nContext);

    const eras = useErasField(resource.eras);
    const months = useMonthsField(resource.months);
    const weekdays = useWeekdaysField(resource.weekdays);
    const firstWeekday = useFirstWeekdayField(resource.first_day_of_first_year_weekday_index);

    const weekdayOptions = weekdays.value.map(({ name }, index) => ({
      label: translate(name, lang),
      value: index,
    }));

    const getWeekdaySortableItemProps = useSortableList(
      createSortableIndexItems(weekdays.value.length),
      (itemId, toIndex) => {
        const fromIndex = Number(itemId);
        weekdays.onValueChange(moveArrayItem(weekdays.value, fromIndex, toIndex));
        if (firstWeekday.value !== null) {
          firstWeekday.onValueChange(moveArrayIndex(firstWeekday.value, fromIndex, toIndex));
        }
      },
    );

    const getMonthSortableItemProps = useSortableList(
      createSortableIndexItems(months.value.length),
      (itemId, toIndex) => {
        months.onValueChange(moveArrayItem(months.value, Number(itemId), toIndex));
      },
    );

    const getEraSortableItemProps = useSortableList(
      createSortableIndexItems(eras.value.length),
      (itemId, toIndex) => {
        eras.onValueChange(moveArrayItem(eras.value, Number(itemId), toIndex));
      },
    );

    function removeWeekday(index: number) {
      weekdays.onValueChange(weekdays.value.filter((_, weekdayIndex) => weekdayIndex !== index));
      if (firstWeekday.value === index) firstWeekday.onValueChange(null);
      else if (firstWeekday.value !== null && firstWeekday.value > index) {
        firstWeekday.onValueChange(firstWeekday.value - 1);
      }
    }

    function updateMonth(index: number, patch: Partial<Calendar["months"][number]>) {
      months.onValueChange(
        months.value.map((month, monthIndex) =>
          monthIndex === index ? { ...month, ...patch } : month,
        ),
      );
    }

    return (
      <ResourceEditor resource={resource}>
        <Field
          label={
            <HStack position="relative" w="full">
              <Span pr={10}>{t("weekdays")}</Span>
              <IconButton
                Icon={PlusIcon}
                label={t("add_weekday")}
                onClick={() => {
                  weekdays.onValueChange([...weekdays.value, { name: { [lang]: "" } }]);
                  if (firstWeekday.value === null) firstWeekday.onValueChange(0);
                }}
                position="absolute"
                right={0}
                size="sm"
                top="50%"
                transform="translateY(-50%)"
                variant="ghost"
              />
            </HStack>
          }
        >
          <VStack align="stretch" gap={2} w="full">
            {weekdays.value.length === 0 && (
              <Text color="fg.muted" fontSize="sm">
                {t("no_weekdays_defined")}
              </Text>
            )}
            {weekdays.value.map((weekday, index) => {
              const sortableProps = getWeekdaySortableItemProps(String(index), index);

              return (
                <CalendarWeekdayEditor
                  key={index}
                  onChange={(updatedWeekday) =>
                    weekdays.onValueChange(
                      weekdays.value.map((entry, entryIndex) =>
                        entryIndex === index ? updatedWeekday : entry,
                      ),
                    )
                  }
                  onRemove={() => removeWeekday(index)}
                  sortableProps={sortableProps}
                  value={weekday}
                />
              );
            })}
          </VStack>
        </Field>

        <Field label={t("first_day_of_first_year_weekday")}>
          <Select
            disabled={weekdays.value.length === 0}
            onValueChange={(value) => firstWeekday.onValueChange(value)}
            options={weekdayOptions}
            parse={(value) => Number(value)}
            placeholder=""
            stringify={String}
            size="sm"
            value={firstWeekday.value ?? undefined}
            w="full"
            withinDialog
          />
        </Field>

        <Field
          label={
            <HStack position="relative" w="full">
              <Span pr={10}>{t("months")}</Span>
              <IconButton
                Icon={PlusIcon}
                label={t("add_month")}
                onClick={() =>
                  months.onValueChange([
                    ...months.value,
                    {
                      additional_days_count: 0,
                      additional_days_every_years: 0,
                      additional_days_first_year: 0,
                      advances_weekday_cycle: true,
                      days_count: 30,
                      name: { [lang]: "" },
                    },
                  ])
                }
                position="absolute"
                right={0}
                size="sm"
                top="50%"
                transform="translateY(-50%)"
                variant="ghost"
              />
            </HStack>
          }
        >
          <VStack align="stretch" gap={3} separator={<StackSeparator />} w="full">
            {months.value.length === 0 && (
              <Text color="fg.muted" fontSize="sm">
                {t("no_months_defined")}
              </Text>
            )}
            {months.value.map((month, index) => {
              const sortableProps = getMonthSortableItemProps(String(index), index);

              return (
                <CalendarMonthEditor
                  key={index}
                  onChange={(patch) => updateMonth(index, patch)}
                  onRemove={() =>
                    months.onValueChange(
                      months.value.filter((_, monthIndex) => monthIndex !== index),
                    )
                  }
                  sortableProps={sortableProps}
                  value={month}
                />
              );
            })}
          </VStack>
        </Field>

        <Field
          label={
            <HStack position="relative" w="full">
              <Span pr={10}>{t("eras")}</Span>
              <IconButton
                Icon={PlusIcon}
                label={t("add_era")}
                onClick={() =>
                  eras.onValueChange([
                    ...eras.value,
                    {
                      name: { [lang]: "" },
                      short_name: {},
                    },
                  ])
                }
                position="absolute"
                right={0}
                size="sm"
                top="50%"
                transform="translateY(-50%)"
                variant="ghost"
              />
            </HStack>
          }
        >
          <VStack align="stretch" gap={2} w="full">
            {eras.value.length === 0 && (
              <Text color="fg.muted" fontSize="sm">
                {t("no_eras_defined")}
              </Text>
            )}
            {eras.value.map((era, index) => {
              const sortableProps = getEraSortableItemProps(String(index), index);

              return (
                <CalendarEraEditor
                  key={index}
                  onChange={(updatedEra) =>
                    eras.onValueChange(
                      eras.value.map((entry, entryIndex) =>
                        entryIndex === index ? updatedEra : entry,
                      ),
                    )
                  }
                  onRemove={() => eras.onValueChange(eras.value.filter((_, i) => i !== index))}
                  sortableProps={sortableProps}
                  value={era}
                />
              );
            })}
          </VStack>
        </Field>
      </ResourceEditor>
    );
  };
}

//------------------------------------------------------------------------------
// Create Sortable Index Items
//------------------------------------------------------------------------------

function createSortableIndexItems(length: number) {
  return Array.from({ length }, (_, index) => ({ id: String(index) }));
}

//------------------------------------------------------------------------------
// Move Array Item
//------------------------------------------------------------------------------

function moveArrayItem<T>(items: T[], fromIndex: number, toIndex: number) {
  if (fromIndex === toIndex || fromIndex < 0 || fromIndex >= items.length) return items;

  const next = [...items];
  const [item] = next.splice(fromIndex, 1);
  if (item === undefined) return items;
  next.splice(toIndex, 0, item);
  return next;
}

//------------------------------------------------------------------------------
// Move Array Index
//------------------------------------------------------------------------------

function moveArrayIndex(index: number, fromIndex: number, toIndex: number) {
  if (index === fromIndex) return toIndex;
  if (fromIndex < index && toIndex >= index) return index - 1;
  if (fromIndex > index && toIndex <= index) return index + 1;
  return index;
}

//------------------------------------------------------------------------------
// I18n Context
//------------------------------------------------------------------------------

const i18nContext = {
  add_era: { en: "Add era", it: "Aggiungi era" },
  add_month: { en: "Add month", it: "Aggiungi mese" },
  add_weekday: { en: "Add weekday", it: "Aggiungi giorno" },
  eras: { en: "Eras", it: "Ere" },
  first_day_of_first_year_weekday: {
    en: "Weekday of the first day of year 1",
    it: "Giorno della settimana del primo giorno dell'anno 1",
  },
  months: { en: "Months", it: "Mesi" },
  no_eras_defined: { en: "No eras defined.", it: "Nessuna era definita." },
  no_months_defined: { en: "No months defined.", it: "Nessun mese definito." },
  no_weekdays_defined: { en: "No weekdays defined.", it: "Nessun giorno definito." },
  weekdays: { en: "Weekdays", it: "Giorni della settimana" },
};
