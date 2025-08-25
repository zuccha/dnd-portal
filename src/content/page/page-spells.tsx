import { Flex, Table } from "@chakra-ui/react";
import { useI18n } from "../../i18n/i18n";
import { t } from "../../i18n/i18n-string";
import { useCampaignSpells } from "../../supabase/resources/spells";

//------------------------------------------------------------------------------
// Page Spells
//------------------------------------------------------------------------------

export type PageSpellsProps = {
  campaignId: string;
};

export default function PageSpells({ campaignId }: PageSpellsProps) {
  const i18n = useI18n(i18nContext);
  const { data: spells } = useCampaignSpells(campaignId, {}, [i18n.lang]);

  if (!spells) return null;

  return (
    <Flex fontSize="sm" h="full" w="full">
      <Table.Root>
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeader>
              {i18n.t("table.header.name")}
            </Table.ColumnHeader>
            <Table.ColumnHeader>
              {i18n.t("table.header.level")}
            </Table.ColumnHeader>
            <Table.ColumnHeader>
              {i18n.t("table.header.school")}
            </Table.ColumnHeader>
            <Table.ColumnHeader>
              {i18n.t("table.header.casting_time")}
            </Table.ColumnHeader>
            <Table.ColumnHeader>
              {i18n.t("table.header.range")}
            </Table.ColumnHeader>
            <Table.ColumnHeader>
              {i18n.t("table.header.duration")}
            </Table.ColumnHeader>
          </Table.Row>
        </Table.Header>

        <Table.Body>
          {spells.map((spell) => (
            <Table.Row key={spell.id}>
              <Table.Cell>{t(spell.name, i18n.lang)}</Table.Cell>
              <Table.Cell>{spell.level}</Table.Cell>
              <Table.Cell>{spell.school}</Table.Cell>
              <Table.Cell>{spell.casting_time}</Table.Cell>
              <Table.Cell>{spell.range_met}</Table.Cell>
              <Table.Cell>{spell.duration}</Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>
    </Flex>
  );
}

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
};
