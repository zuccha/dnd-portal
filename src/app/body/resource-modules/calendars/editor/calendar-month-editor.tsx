import { Center, Grid, HStack, VStack } from "@chakra-ui/react";
import { PlusIcon, XIcon } from "lucide-react";
import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import { translate } from "~/i18n/i18n-string";
import type { Calendar } from "~/models/resources/calendars/calendar";
import CaptionInput from "~/ui/caption-input";
import Checkbox from "~/ui/checkbox";
import Icon from "~/ui/icon";
import IconButton from "~/ui/icon-button";
import Input from "~/ui/input";
import NumberInput from "~/ui/number-input";
import SortableListDropIndicator from "~/ui/sortable-list-drop-indicator";
import SortableListHandle from "~/ui/sortable-list-handle";
import type { SortableListItemProps } from "~/ui/use-sortable-list";
import { useResourceEditorLang } from "../../resource-editor-language-context";

//------------------------------------------------------------------------------
// Calendar Month Editor Props
//------------------------------------------------------------------------------

type CalendarMonthEditorProps = {
  onChange: (month: Partial<Calendar["months"][number]>) => void;
  onRemove: () => void;
  sortableProps: SortableListItemProps;
  value: Calendar["months"][number];
};

//------------------------------------------------------------------------------
// Calendar Month Editor
//------------------------------------------------------------------------------

export default function CalendarMonthEditor({
  onChange,
  onRemove,
  sortableProps,
  value,
}: CalendarMonthEditorProps) {
  const { lang } = useResourceEditorLang();
  const { t } = useI18nLangContext(i18nContext);

  return (
    <VStack align="stretch" gap={2} position="relative" w="full" {...sortableProps.itemProps}>
      {sortableProps.dropPosition && (
        <SortableListDropIndicator gap={1} position={sortableProps.dropPosition} />
      )}
      <Grid gap={2} gridTemplateColumns="16px minmax(0, 1fr) 8" w="full">
        <Center gridColumn="1">
          <SortableListHandle label={t("drag_to_reorder")} {...sortableProps.dragHandleProps} />
        </Center>
        <Input
          bgColor="bg.info"
          gridColumn="2"
          onValueChange={(name) => onChange({ name: { ...value.name, [lang]: name } })}
          placeholder={t("month_placeholder")}
          size="sm"
          value={translate(value.name, lang)}
        />
        <IconButton
          Icon={XIcon}
          gridColumn="3"
          label={t("remove")}
          onClick={onRemove}
          size="sm"
          variant="ghost"
        />
        <HStack align="center" gap={2} gridColumn="2" w="full">
          <CaptionInput caption={t("days_count")} flex={1}>
            <NumberInput
              inputProps={{ size: "sm" }}
              min={0}
              onValueChange={(days_count) => onChange({ days_count })}
              size="sm"
              value={value.days_count}
              w="full"
            />
          </CaptionInput>
          <HStack h={10}>
            <Icon Icon={PlusIcon} size="sm" />
          </HStack>
          <CaptionInput caption={t("additional_days_count")} flex={1}>
            <NumberInput
              inputProps={{ size: "sm" }}
              min={0}
              onValueChange={(additional_days_count) =>
                onChange({
                  additional_days_count,
                  additional_days_every_years:
                    additional_days_count === 0 ? 0 : value.additional_days_every_years,
                  additional_days_first_year:
                    additional_days_count === 0 ? 0 : value.additional_days_first_year,
                })
              }
              size="sm"
              value={value.additional_days_count}
              w="full"
            />
          </CaptionInput>
          <CaptionInput caption={t("every_years")} flex={1}>
            <NumberInput
              inputProps={{ size: "sm" }}
              min={0}
              onValueChange={(additional_days_every_years) =>
                onChange({ additional_days_every_years })
              }
              size="sm"
              value={value.additional_days_every_years}
              w="full"
            />
          </CaptionInput>
          <CaptionInput caption={t("starting_from_year")} flex={1}>
            <NumberInput
              inputProps={{ size: "sm" }}
              min={0}
              onValueChange={(additional_days_first_year) =>
                onChange({ additional_days_first_year })
              }
              size="sm"
              value={value.additional_days_first_year}
              w="full"
            />
          </CaptionInput>
        </HStack>
        <Checkbox
          gridColumn="2"
          label={t("advances_weekday_cycle")}
          onValueChange={(advances_weekday_cycle) => onChange({ advances_weekday_cycle })}
          size="xs"
          value={value.advances_weekday_cycle}
        />
      </Grid>
    </VStack>
  );
}

//------------------------------------------------------------------------------
// I18n Context
//------------------------------------------------------------------------------

const i18nContext = {
  additional_days_count: { en: "Additional days", it: "Giorni aggiuntivi" },
  advances_weekday_cycle: {
    en: "Advances the weekday cycle",
    it: "Avanza il ciclo dei giorni della settimana",
  },
  days_count: { en: "Days", it: "Giorni" },
  drag_to_reorder: { en: "Drag to reorder", it: "Trascina per riordinare" },
  every_years: { en: "Every X years", it: "Ogni X anni" },
  month_placeholder: { en: "E.g. Hammer", it: "Es. Hammer" },
  remove: { en: "Remove", it: "Rimuovi" },
  starting_from_year: { en: "Starting from year", it: "A partire dall'anno" },
};
