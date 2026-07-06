import { HStack, Text, VStack } from "@chakra-ui/react";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  CopyPlusIcon,
  PrinterIcon,
  Trash2Icon,
} from "lucide-react";
import { useState } from "react";
import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import { printDeck } from "~/models/print-deck/print-deck-store";
import Button from "~/ui/button";
import EmptyState from "~/ui/empty-state";
import IconButton from "~/ui/icon-button";
import SectionHeading from "~/ui/section-heading";
import { type PaletteName, palettes } from "~/utils/palette";
import PrintDeckPrintMode from "./print-deck-print-mode";

//------------------------------------------------------------------------------
// Print Deck Panel
//------------------------------------------------------------------------------

export default function PrintDeckPanel() {
  const { t, tpi } = useI18nLangContext(i18nContext);
  const entries = printDeck.useEntries();
  const [printMode, setPrintMode] = useState(false);

  if (!entries.length)
    return (
      <EmptyState
        Icon={PrinterIcon}
        alignContent="center"
        flex={1}
        h="full"
        subtitle={t("empty.subtitle")}
        title={t("empty.title")}
      />
    );

  if (printMode)
    return (
      <PrintDeckPrintMode
        entries={entries}
        flex={1}
        h="full"
        onClose={() => setPrintMode(false)}
      />
    );

  return (
    <VStack align="stretch" bgColor="bg.subtle" flex={1} gap={0} h="full">
      <HStack
        bgColor="bg"
        borderBottomWidth={1}
        gap={3}
        justify="space-between"
        px={6}
        py={4}
      >
        <HStack gap={3}>
          <SectionHeading>{t("title")}</SectionHeading>
          <Text color="fg.muted" fontSize="sm">
            {tpi("cards", entries.length, `${entries.length}`)}
          </Text>
        </HStack>

        <HStack gap={2}>
          <Button
            disabled={!entries.length}
            onClick={printDeck.clearEntries}
            size="sm"
            variant="outline"
          >
            {t("clear")}
          </Button>
          <Button onClick={() => setPrintMode(true)} size="sm">
            {t("print")}
          </Button>
        </HStack>
      </HStack>

      <VStack align="stretch" flex={1} gap={2} overflow="auto" p={4}>
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
    </VStack>
  );
}

//------------------------------------------------------------------------------
// Print Deck Entry Row
//------------------------------------------------------------------------------

type PrintDeckEntryRowProps = {
  canMoveDown: boolean;
  canMoveUp: boolean;
  kind: string;
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
  const { t } = useI18nLangContext(i18nContext);

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
          {source} · {t(`kind.${kind}`)}
        </Text>
      </VStack>

      <HStack gap={1}>
        <IconButton
          Icon={ArrowUpIcon}
          aria-label={t("move_up")}
          disabled={!canMoveUp}
          onClick={onMoveUp}
          size="xs"
          variant="ghost"
        />
        <IconButton
          Icon={ArrowDownIcon}
          aria-label={t("move_down")}
          disabled={!canMoveDown}
          onClick={onMoveDown}
          size="xs"
          variant="ghost"
        />
        <IconButton
          Icon={CopyPlusIcon}
          aria-label={t("duplicate")}
          onClick={onDuplicate}
          size="xs"
          variant="ghost"
        />
        <IconButton
          Icon={Trash2Icon}
          aria-label={t("remove")}
          colorPalette="red"
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
  "cards/*": {
    en: "<1> cards",
    it: "<1> carte",
  },
  "cards/1": {
    en: "<1> card",
    it: "<1> carta",
  },
  "clear": {
    en: "Clear",
    it: "Svuota",
  },
  "duplicate": {
    en: "Duplicate",
    it: "Duplica",
  },
  "empty.subtitle": {
    en: "Add cards from any resource list",
    it: "Aggiungi carte da qualsiasi lista di risorse",
  },
  "empty.title": {
    en: "Print deck is empty",
    it: "Il mazzo di stampa è vuoto",
  },
  "kind.armor": {
    en: "Armor",
    it: "Armatura",
  },
  "kind.armor_modifier": {
    en: "Armor modifier",
    it: "Modificatore armatura",
  },
  "kind.background": {
    en: "Background",
    it: "Background",
  },
  "kind.character_class": {
    en: "Class",
    it: "Classe",
  },
  "kind.character_subclass": {
    en: "Subclass",
    it: "Sottoclasse",
  },
  "kind.creature": {
    en: "Creature",
    it: "Creatura",
  },
  "kind.creature_tag": {
    en: "Creature tag",
    it: "Tag creatura",
  },
  "kind.eldritch_invocation": {
    en: "Eldritch invocation",
    it: "Supplica occulta",
  },
  "kind.feat": {
    en: "Feat",
    it: "Talento",
  },
  "kind.feature": {
    en: "Feature",
    it: "Privilegio",
  },
  "kind.item": {
    en: "Item",
    it: "Oggetto",
  },
  "kind.item_modifier": {
    en: "Item modifier",
    it: "Modificatore oggetto",
  },
  "kind.language": {
    en: "Language",
    it: "Linguaggio",
  },
  "kind.maneuver": {
    en: "Maneuver",
    it: "Manovra",
  },
  "kind.metamagic": {
    en: "Metamagic",
    it: "Metamagia",
  },
  "kind.plane": {
    en: "Plane",
    it: "Piano",
  },
  "kind.service": {
    en: "Service",
    it: "Servizio",
  },
  "kind.species": {
    en: "Species",
    it: "Specie",
  },
  "kind.spell": {
    en: "Spell",
    it: "Incantesimo",
  },
  "kind.tool": {
    en: "Tool",
    it: "Strumento",
  },
  "kind.tool_modifier": {
    en: "Tool modifier",
    it: "Modificatore strumento",
  },
  "kind.vehicle": {
    en: "Vehicle",
    it: "Veicolo",
  },
  "kind.weapon": {
    en: "Weapon",
    it: "Arma",
  },
  "kind.weapon_modifier": {
    en: "Weapon modifier",
    it: "Modificatore arma",
  },
  "move_down": {
    en: "Move down",
    it: "Sposta giù",
  },
  "move_up": {
    en: "Move up",
    it: "Sposta su",
  },
  "print": {
    en: "Print",
    it: "Stampa",
  },
  "remove": {
    en: "Remove",
    it: "Rimuovi",
  },
  "title": {
    en: "Print Deck",
    it: "Mazzo di Stampa",
  },
};
