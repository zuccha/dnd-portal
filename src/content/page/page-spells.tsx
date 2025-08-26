import { Flex } from "@chakra-ui/react";
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
    () => columnKeys.map((key) => ({ key, label: t(`table.header.${key}`) })),
    [t]
  );

  const rows = useMemo(
    () => (spells ? spells.map(translateSpell) : undefined),
    [spells, translateSpell]
  );

  if (!rows) return null;

  return (
    <Flex fontSize="sm" h="full" position="relative" w="full">
      <DataTable columns={columns} rows={rows} stickyHeader />
    </Flex>
  );
}

//------------------------------------------------------------------------------
// Column Keys
//------------------------------------------------------------------------------

const columnKeys = [
  "name",
  "level",
  "character_classes",
  "school",
  "casting_time",
  "range",
  "duration",
  "ritual",
  "concentration",
  "components",
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
    en: "Level",
    it: "Livello",
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
    en: "Casting Time",
    it: "Tempo di lancio",
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
    en: "V,S,M",
    it: "V,S,M",
  },
};
