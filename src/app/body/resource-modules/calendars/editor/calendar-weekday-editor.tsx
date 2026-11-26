import { HStack } from "@chakra-ui/react";
import { XIcon } from "lucide-react";
import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import { translate } from "~/i18n/i18n-string";
import type { Calendar } from "~/models/resources/calendars/calendar";
import IconButton from "~/ui/icon-button";
import Input from "~/ui/input";
import SortableListDropIndicator from "~/ui/sortable-list-drop-indicator";
import SortableListHandle from "~/ui/sortable-list-handle";
import type { SortableListItemProps } from "~/ui/use-sortable-list";
import { useResourceEditorLang } from "../../resource-editor-language-context";

//------------------------------------------------------------------------------
// Calendar Weekday Editor Props
//------------------------------------------------------------------------------

type CalendarWeekdayEditorProps = {
  onChange: (weekday: Calendar["weekdays"][number]) => void;
  onRemove: () => void;
  sortableProps: SortableListItemProps;
  value: Calendar["weekdays"][number];
};

//------------------------------------------------------------------------------
// Calendar Weekday Editor
//------------------------------------------------------------------------------

export default function CalendarWeekdayEditor({
  onChange,
  onRemove,
  sortableProps,
  value,
}: CalendarWeekdayEditorProps) {
  const { lang } = useResourceEditorLang();
  const { t } = useI18nLangContext(i18nContext);

  return (
    <HStack position="relative" w="full" {...sortableProps.itemProps}>
      {sortableProps.dropPosition && (
        <SortableListDropIndicator gap={1} position={sortableProps.dropPosition} />
      )}
      <SortableListHandle label={t("drag_to_reorder")} {...sortableProps.dragHandleProps} />
      <Input
        bgColor="bg.info"
        flex={1}
        minW={0}
        onValueChange={(name) => onChange({ ...value, name: { ...value.name, [lang]: name } })}
        placeholder={t("weekday_placeholder")}
        size="sm"
        value={translate(value.name, lang)}
      />
      <IconButton Icon={XIcon} label={t("remove")} onClick={onRemove} size="sm" variant="ghost" />
    </HStack>
  );
}

//------------------------------------------------------------------------------
// I18n Context
//------------------------------------------------------------------------------

const i18nContext = {
  drag_to_reorder: { en: "Drag to reorder", it: "Trascina per riordinare" },
  remove: { en: "Remove", it: "Rimuovi" },
  weekday_placeholder: { en: "E.g. Moonday", it: "Es. Lunedì" },
};
