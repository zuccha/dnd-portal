import { Box, HStack, Span, Text, VStack } from "@chakra-ui/react";
import { CopyPlusIcon, PencilIcon, RatIcon, Trash2Icon } from "lucide-react";
import { useState } from "react";
import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import type { PrintDeckEntryUnion } from "~/models/print-deck/print-deck-entry";
import { printDeck } from "~/models/print-deck/print-deck-store";
import { type ResourceKind, useTranslateResourceKind } from "~/models/types/resource-kind";
import EmptyState from "~/ui/empty-state";
import IconButton from "~/ui/icon-button";
import PalettePicker from "~/ui/palette-picker";
import SortableListDropIndicator from "~/ui/sortable-list-drop-indicator";
import SortableListHandle from "~/ui/sortable-list-handle";
import { useSortableList, type SortableListItemProps } from "~/ui/use-sortable-list";
import { type PaletteName } from "~/utils/palette";
import PrintDeckEntryEditorDialog from "./print-deck-entry-editor-dialog";

//------------------------------------------------------------------------------
// Print Deck Content List
//------------------------------------------------------------------------------

const { useEntries } = printDeck;

export default function PrintDeckContentList() {
  const entries = useEntries();
  const { t } = useI18nLangContext(i18nContext);
  const [editingEntry, setEditingEntry] = useState<PrintDeckEntryUnion>();
  const getSortableItemProps = useSortableList(entries, printDeck.moveEntry);

  return (
    <>
      {entries.length === 0 ? (
        <EmptyState
          Icon={RatIcon}
          h="full"
          subtitle={t("empty.subtitle")}
          title={t("empty.title")}
        />
      ) : (
        <VStack bgColor="bg.subtle" flex={1} gap={2} h="full" overflow="auto" p={4}>
          {entries.map((entry, index) => (
            <PrintDeckEntryRow
              key={entry.id}
              kind={entry.resource.kind}
              name={entry.resource.name}
              onEdit={() => setEditingEntry(entry)}
              onDuplicate={() => printDeck.duplicateEntry(entry.id)}
              onPaletteChange={(paletteName) => printDeck.setEntryPalette(entry.id, paletteName)}
              onRemove={() => printDeck.removeEntry(entry.id)}
              sortableProps={getSortableItemProps(entry.id, index)}
              entryLang={entry.lang}
              paletteName={entry.palette_name}
              source={entry.resource.source_code}
            />
          ))}
        </VStack>
      )}
      {editingEntry && (
        <PrintDeckEntryEditorDialog
          entry={editingEntry}
          onClose={() => setEditingEntry(undefined)}
          onSave={printDeck.updateEntryResource}
        />
      )}
    </>
  );
}

//------------------------------------------------------------------------------
// Print Deck Entry Row
//------------------------------------------------------------------------------

type PrintDeckEntryRowProps = {
  kind: ResourceKind;
  entryLang: string;
  name: string;
  onDuplicate: () => void;
  onEdit: () => void;
  onPaletteChange: (paletteName: PaletteName) => void;
  onRemove: () => void;
  paletteName: PaletteName;
  sortableProps: SortableListItemProps;
  source: string;
};

function PrintDeckEntryRow({
  kind,
  name,
  onEdit,
  onDuplicate,
  onPaletteChange,
  onRemove,
  paletteName,
  sortableProps,
  source,
}: PrintDeckEntryRowProps) {
  const { lang, t } = useI18nLangContext(i18nContext);
  const translateKind = useTranslateResourceKind(lang);

  return (
    <HStack
      align="center"
      bgColor="bg"
      borderColor="border"
      borderRadius="sm"
      borderWidth={1}
      gap={3}
      minH={14}
      px={3}
      py={2}
      position="relative"
      w="full"
      wrap={{ base: "wrap", md: "nowrap" }}
      {...sortableProps.itemProps}
    >
      {sortableProps.dropPosition && (
        <SortableListDropIndicator gap={2} position={sortableProps.dropPosition} />
      )}
      <SortableListHandle label={t("drag_to_reorder")} {...sortableProps.dragHandleProps} />

      <Box alignSelf="center">
        <PalettePicker onValueChange={onPaletteChange} value={paletteName} />
      </Box>

      <VStack
        align="flex-start"
        flex={1}
        gap={0}
        minW={{ base: "calc(100% - 3rem)", md: 0 }}
        textAlign="left"
      >
        <Text
          as="button"
          cursor="pointer"
          fontWeight="semibold"
          lineClamp={2}
          onClick={onEdit}
          textAlign="left"
          _hover={{ textDecoration: "underline" }}
        >
          {name || <Span fontStyle="italic">{t("name.missing")}</Span>}
        </Text>
        <Text color="fg.muted" fontSize="xs" lineClamp={1} textAlign="left">
          {source ? `${source} · ${translateKind(kind)}` : translateKind(kind)}
        </Text>
      </VStack>

      <HStack alignSelf="center" gap={1} ml="auto">
        <IconButton
          Icon={PencilIcon}
          label={t("edit")}
          onClick={onEdit}
          size="xs"
          variant="ghost"
        />
        <IconButton
          Icon={CopyPlusIcon}
          label={t("clone")}
          onClick={onDuplicate}
          size="xs"
          variant="ghost"
        />
        <IconButton
          Icon={Trash2Icon}
          colorPalette="red"
          label={t("remove")}
          onClick={onRemove}
          size="xs"
          variant="ghost"
        />
      </HStack>
    </HStack>
  );
}

//------------------------------------------------------------------------------
// I18n Context
//------------------------------------------------------------------------------

const i18nContext = {
  "clone": {
    en: "Clone",
    it: "Duplica",
  },
  "empty.subtitle": {
    en: "Add resources to the print deck and they will appear here.",
    it: "Aggiungi risorse alla coda di stampa e visualizzale qui.",
  },
  "empty.title": {
    en: "The print deck is empty",
    it: "La coda di stampa è vuota",
  },
  "edit": {
    en: "Edit",
    it: "Modifica",
  },
  "drag_to_reorder": {
    en: "Drag to reorder",
    it: "Trascina per riordinare",
  },
  "name.missing": {
    en: "Unnamed",
    it: "Senza Nome",
  },
  "palette": {
    en: "Change palette",
    it: "Cambia palette",
  },
  "remove": {
    en: "Remove",
    it: "Rimuovi",
  },
};
