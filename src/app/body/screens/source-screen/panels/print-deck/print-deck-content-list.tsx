import { HStack, Text, VStack } from "@chakra-ui/react";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  CopyPlusIcon,
  EditIcon,
  RatIcon,
  Trash2Icon,
} from "lucide-react";
import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import { printDeck } from "~/models/print-deck/print-deck-store";
import {
  type ResourceKind,
  useTranslateResourceKind,
} from "~/models/types/resource-kind";
import EmptyState from "~/ui/empty-state";
import IconButton from "~/ui/icon-button";
import PalettePicker from "~/ui/palette-picker";
import { type PaletteName } from "~/utils/palette";

//------------------------------------------------------------------------------
// Print Deck Content List
//------------------------------------------------------------------------------

const { useEntries } = printDeck;

export default function PrintDeckContentList() {
  const entries = useEntries();
  const { t } = useI18nLangContext(i18nContext);

  if (entries.length === 0) {
    return (
      <EmptyState
        Icon={RatIcon}
        h="full"
        subtitle={t("empty.subtitle")}
        title={t("empty.title")}
      />
    );
  }

  return (
    <VStack bgColor="bg.subtle" flex={1} gap={2} h="full" overflow="auto" p={4}>
      {entries.map((entry, index) => (
        <PrintDeckEntryRow
          canMoveDown={index < entries.length - 1}
          canMoveUp={index > 0}
          key={entry.id}
          kind={entry.localized_resource.kind}
          name={entry.localized_resource.name}
          onDuplicate={() => printDeck.duplicateEntry(entry.id)}
          onMoveDown={() => printDeck.moveEntry(entry.id, index + 1)}
          onMoveUp={() => printDeck.moveEntry(entry.id, index - 1)}
          onPaletteChange={(paletteName) =>
            printDeck.setEntryPalette(entry.id, paletteName)
          }
          onRemove={() => printDeck.removeEntry(entry.id)}
          paletteName={entry.palette_name}
          source={entry.localized_resource.source}
        />
      ))}
    </VStack>
  );
}

//------------------------------------------------------------------------------
// Print Deck Entry Row
//------------------------------------------------------------------------------

type PrintDeckEntryRowProps = {
  canMoveDown: boolean;
  canMoveUp: boolean;
  kind: ResourceKind;
  name: string;
  onDuplicate: () => void;
  onMoveDown: () => void;
  onMoveUp: () => void;
  onPaletteChange: (paletteName: PaletteName) => void;
  onRemove: () => void;
  paletteName: PaletteName;
  source: string;
};

function PrintDeckEntryRow({
  canMoveDown,
  canMoveUp,
  kind,
  name,
  onDuplicate,
  onMoveDown,
  onMoveUp,
  onPaletteChange,
  onRemove,
  paletteName,
  source,
}: PrintDeckEntryRowProps) {
  const { lang, t } = useI18nLangContext(i18nContext);
  const translateKind = useTranslateResourceKind(lang);

  return (
    <HStack
      bgColor="bg"
      borderRadius="sm"
      borderWidth={1}
      gap={3}
      minH={14}
      px={3}
      py={2}
      w="full"
    >
      <PalettePicker onValueChange={onPaletteChange} value={paletteName} />

      <VStack align="flex-start" flex={1} gap={0} minW={0}>
        <Text fontWeight="semibold" truncate>
          {name}
        </Text>
        <Text color="fg.muted" fontSize="xs" truncate>
          {source} · {translateKind(kind).label}
        </Text>
      </VStack>

      <HStack gap={1}>
        <IconButton
          Icon={ArrowUpIcon}
          disabled={!canMoveUp}
          label={t("move_up")}
          onClick={onMoveUp}
          size="xs"
          variant="ghost"
        />
        <IconButton
          Icon={ArrowDownIcon}
          disabled={!canMoveDown}
          label={t("move_down")}
          onClick={onMoveDown}
          size="xs"
          variant="ghost"
        />
        <IconButton
          Icon={EditIcon}
          disabled
          label={t("edit")}
          onClick={() => {}}
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
  "edit": {
    en: "Edit",
    it: "Modifica",
  },
  "empty.subtitle": {
    en: "Add resources to the print deck and they will appear here.",
    it: "Aggiungi risorse alla coda di stampa e visualizzale qui.",
  },
  "empty.title": {
    en: "The print deck is empty",
    it: "La coda di stampa è vuota",
  },
  "move_down": {
    en: "Move down",
    it: "Sposta sotto",
  },
  "move_up": {
    en: "Move up",
    it: "Sposta sopra",
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
