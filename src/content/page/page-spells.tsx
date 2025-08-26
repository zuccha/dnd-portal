import { Flex, Table } from "@chakra-ui/react";
import { useI18n } from "../../i18n/i18n";
import { useCampaignSpells } from "../../resources/spells";
import { useTranslateSpell } from "../../resources-i18n/translate-spell";

//------------------------------------------------------------------------------
// Page Spells
//------------------------------------------------------------------------------

export type PageSpellsProps = {
  campaignId: string;
};

export default function PageSpells({ campaignId }: PageSpellsProps) {
  const i18n = useI18n(i18nContext);
  const { data: spells } = useCampaignSpells(campaignId, {}, [i18n.lang]);
  const translateSpell = useTranslateSpell();

  if (!spells) return null;

  return (
    <Flex fontSize="sm" h="full" position="relative" w="full">
      <Table.Root>
        <Table.Header position="sticky" top={0}>
          <Table.Row
            bgColor="bg.subtle"
            boxShadow="0px 0.5px 0px var(--shadow-color)"
            boxShadowColor="border"
          >
            <Table.ColumnHeader>
              {i18n.t("table.header.name")}
            </Table.ColumnHeader>
            <Table.ColumnHeader>
              {i18n.t("table.header.level")}
            </Table.ColumnHeader>
            <Table.ColumnHeader>
              {i18n.t("table.header.character_classes")}
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
            <Table.ColumnHeader>
              {i18n.t("table.header.components")}
            </Table.ColumnHeader>
          </Table.Row>
        </Table.Header>

        <Table.Body>
          {spells.map((spell) => {
            const translatedSpell = translateSpell(spell);
            return (
              <Table.Row key={spell.id}>
                <Table.Cell>{translatedSpell.name}</Table.Cell>
                <Table.Cell>{translatedSpell.level}</Table.Cell>
                <Table.Cell>{translatedSpell.character_classes}</Table.Cell>
                <Table.Cell>{translatedSpell.school}</Table.Cell>
                <Table.Cell>{translatedSpell.casting_time}</Table.Cell>
                <Table.Cell>{translatedSpell.range}</Table.Cell>
                <Table.Cell>{translatedSpell.duration}</Table.Cell>
                <Table.Cell>{translatedSpell.components}</Table.Cell>
              </Table.Row>
            );
          })}
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

  "table.header.components": {
    en: "V,S,M",
    it: "V,S,M",
  },
};
