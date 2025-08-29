import { Box } from "@chakra-ui/react";
import { useMemo } from "react";
import { useI18nLangContext } from "../../../../../../i18n/i18n-lang-context";
import DataTable from "../../../../../../ui/data-table";
import useFilteredSpellTranslations from "./use-filtered-spell-translations";

//------------------------------------------------------------------------------
// Spells List Table
//------------------------------------------------------------------------------

export type SpellsListTableProps = {
  campaignId: string;
};

export default function SpellsListTable({ campaignId }: SpellsListTableProps) {
  const { t } = useI18nLangContext(i18nContext);
  const spellTranslations = useFilteredSpellTranslations(campaignId);

  const columns = useMemo(
    () =>
      rawColumns.map((raw) => ({
        ...raw,
        label: t(`table.header.${raw.key}`),
      })),
    [t]
  );

  if (!spellTranslations) return null;

  return (
    <Box w="full">
      <DataTable
        columns={columns}
        expandedKey="description"
        rows={spellTranslations}
      />
    </Box>
  );
}

//------------------------------------------------------------------------------
// Column Keys
//------------------------------------------------------------------------------

const rawColumns = [
  { key: "name" },
  { key: "level", maxW: "5em", textAlign: "center" },
  { key: "character_classes", maxW: "8em" },
  { key: "school", maxW: "8em" },
  { key: "casting_time", maxW: "9em" },
  { key: "ritual", maxW: "4.5em", textAlign: "center" },
  { key: "range", maxW: "8em" },
  { key: "duration", maxW: "9em" },
  { key: "concentration", maxW: "4.5em", textAlign: "center" },
  { key: "components" },
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
    en: "R",
    it: "R",
  },

  "table.header.concentration": {
    en: "C",
    it: "C",
  },

  "table.header.components": {
    en: "V, S, M",
    it: "V, S, M",
  },
};
