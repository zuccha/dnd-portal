import { Box, VStack } from "@chakra-ui/react";
import { useMemo } from "react";
import { useI18nLangContext } from "../../i18n/i18n-lang-context";
import { useCampaignSpells } from "../../resources/spells";
import { useTranslateSpell } from "../../resources-i18n/translate-spell";
import DataTable from "../../ui/data-table";

//------------------------------------------------------------------------------
// Page Spells
//------------------------------------------------------------------------------

export type PageSpellsProps = {
  campaignId: string;
};

export default function PageSpells({ campaignId }: PageSpellsProps) {
  const { lang, t } = useI18nLangContext(i18nContext);
  const { data: spells } = useCampaignSpells(campaignId, {}, [lang]);
  const translateSpell = useTranslateSpell();

  const columns = useMemo(
    () =>
      rawColumns.map((raw) => ({
        ...raw,
        label: t(`table.header.${raw.key}`),
      })),
    [t]
  );

  const rows = useMemo(
    () => (spells ? spells.map(translateSpell) : undefined),
    [spells, translateSpell]
  );

  if (!rows) return null;

  return (
    <VStack flex={1} gap={0} h="full" overflow="auto" w="full">
      <Box h="full" overflow="auto" w="full">
        <DataTable columns={columns} expandedKey="description" rows={rows} />
      </Box>
    </VStack>
  );
}

//------------------------------------------------------------------------------
// Column Keys
//------------------------------------------------------------------------------

const rawColumns = [
  { key: "name" },
  { filter: true, key: "level", maxW: "5em" },
  { filter: true, key: "character_classes", maxW: "8em" },
  { filter: true, key: "school", maxW: "8em" },
  { key: "casting_time", maxW: "9em" },
  { filter: true, key: "ritual", maxW: "4.5em" },
  { key: "range", maxW: "8em" },
  { key: "duration", maxW: "9em" },
  { filter: true, key: "concentration", maxW: "4.5em" },
  { filter: true, key: "components" },
] as const;

//------------------------------------------------------------------------------
// I18n Context
//------------------------------------------------------------------------------

const i18nContext = {
  "table.header.name": {
    en: "Name",
    it: "Nome",
  },

  "table.header.level": {
    en: "Lvl",
    it: "Lvl",
  },

  "table.header.character_classes": {
    en: "Classes",
    it: "Classi",
  },

  "table.header.school": {
    en: "School",
    it: "Scuola",
  },

  "table.header.casting_time": {
    en: "Cast",
    it: "Lancio",
  },

  "table.header.range": {
    en: "Range",
    it: "Gittata",
  },

  "table.header.duration": {
    en: "Duration",
    it: "Durata",
  },

  "table.header.ritual": {
    en: "R.",
    it: "R.",
  },

  "table.header.concentration": {
    en: "C.",
    it: "C.",
  },

  "table.header.components": {
    en: "V, S, M",
    it: "V, S, M",
  },
};
