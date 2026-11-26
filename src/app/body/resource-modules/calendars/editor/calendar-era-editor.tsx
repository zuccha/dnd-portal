import { Center, HStack, VStack } from "@chakra-ui/react";
import { XIcon } from "lucide-react";
import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import { translate } from "~/i18n/i18n-string";
import type { Calendar } from "~/models/resources/calendars/calendar";
import CaptionInput from "~/ui/caption-input";
import IconButton from "~/ui/icon-button";
import Input from "~/ui/input";
import SortableListDropIndicator from "~/ui/sortable-list-drop-indicator";
import SortableListHandle from "~/ui/sortable-list-handle";
import type { SortableListItemProps } from "~/ui/use-sortable-list";
import { useResourceEditorLang } from "../../resource-editor-language-context";

//------------------------------------------------------------------------------
// Calendar Era Editor Props
//------------------------------------------------------------------------------

type CalendarEraEditorProps = {
  onChange: (era: Calendar["eras"][number]) => void;
  onRemove: () => void;
  sortableProps: SortableListItemProps;
  value: Calendar["eras"][number];
};

//------------------------------------------------------------------------------
// Calendar Era Editor
//------------------------------------------------------------------------------

export default function CalendarEraEditor({
  onChange,
  onRemove,
  sortableProps,
  value,
}: CalendarEraEditorProps) {
  const { lang } = useResourceEditorLang();
  const { t } = useI18nLangContext(i18nContext);

  return (
    <VStack align="stretch" gap={2} position="relative" w="full" {...sortableProps.itemProps}>
      {sortableProps.dropPosition && (
        <SortableListDropIndicator gap={1} position={sortableProps.dropPosition} />
      )}
      <HStack align="flex-end" flexWrap="wrap" gap={2}>
        <Center alignSelf="center">
          <SortableListHandle label={t("drag_to_reorder")} {...sortableProps.dragHandleProps} />
        </Center>
        <CaptionInput caption={t("era_name")} flex={2}>
          <Input
            bgColor="bg.info"
            onValueChange={(name) => onChange({ ...value, name: { ...value.name, [lang]: name } })}
            placeholder={t("era_placeholder")}
            size="sm"
            value={translate(value.name, lang)}
          />
        </CaptionInput>
        <CaptionInput caption={t("era_short_name")} flex={1}>
          <Input
            bgColor="bg.info"
            onValueChange={(short_name) =>
              onChange({ ...value, short_name: { ...value.short_name, [lang]: short_name } })
            }
            placeholder={t("era_short_name_placeholder")}
            size="sm"
            value={translate(value.short_name, lang)}
          />
        </CaptionInput>
        <IconButton
          alignSelf="center"
          Icon={XIcon}
          label={t("remove")}
          onClick={onRemove}
          size="sm"
          variant="ghost"
          h={8}
          minW={8}
          w={8}
        />
      </HStack>
    </VStack>
  );
}

//------------------------------------------------------------------------------
// I18n Context
//------------------------------------------------------------------------------

const i18nContext = {
  drag_to_reorder: { en: "Drag to reorder", it: "Trascina per riordinare" },
  era_placeholder: { en: "E.g. BCE", it: "Es. a.C." },
  era_name: { en: "Era name", it: "Nome dell'era" },
  era_short_name: { en: "Short name", it: "Nome breve" },
  era_short_name_placeholder: { en: "E.g. AD", it: "Es. d.C." },
  remove: { en: "Remove", it: "Rimuovi" },
};
