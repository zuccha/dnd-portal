import { HStack, Text, VStack } from "@chakra-ui/react";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  CopyPlusIcon,
  Trash2Icon,
} from "lucide-react";
import { useI18nLang } from "~/i18n/i18n-lang";
import { printDeck } from "~/models/print-deck/print-deck-store";
import {
  type ResourceKind,
  useTranslateResourceKind,
} from "~/models/types/resource-kind";
import IconButton from "~/ui/icon-button";
import { type PaletteName, palettes } from "~/utils/palette";

//------------------------------------------------------------------------------
// Print Deck Content List
//------------------------------------------------------------------------------

const { useEntries } = printDeck;

export default function PrintDeckContentList() {
  const entries = useEntries();

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
  onRemove,
  paletteName,
  source,
}: PrintDeckEntryRowProps) {
  const [lang] = useI18nLang();
  const translateKind = useTranslateResourceKind(lang);

  return (
    <HStack
      bgColor="bg"
      borderLeftColor={palettes[paletteName][700]}
      borderLeftWidth={4}
      borderRadius="sm"
      borderRightWidth={1}
      borderYWidth={1}
      gap={3}
      minH={14}
      px={3}
      py={2}
      w="full"
    >
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
          onClick={onMoveUp}
          size="xs"
          variant="ghost"
        />
        <IconButton
          Icon={ArrowDownIcon}
          disabled={!canMoveDown}
          onClick={onMoveDown}
          size="xs"
          variant="ghost"
        />
        <IconButton
          Icon={CopyPlusIcon}
          onClick={onDuplicate}
          size="xs"
          variant="ghost"
        />
        <IconButton
          Icon={Trash2Icon}
          colorPalette="red"
          onClick={onRemove}
          size="xs"
          variant="ghost"
        />
      </HStack>
    </HStack>
  );
}
