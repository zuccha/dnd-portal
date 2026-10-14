import { Box, SimpleGrid, Text } from "@chakra-ui/react";
import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import { spellStore } from "~/models/resources/spells/spell-store";
import ResourceDetailContent from "../resource-detail-content";

const useLocalizedResource = spellStore.useLocalizedResource;

//------------------------------------------------------------------------------
// Spell Detail Route
//------------------------------------------------------------------------------

export default function SpellDetailRoute({ resourceId }: { resourceId: string }) {
  const { t, ti } = useI18nLangContext(i18nContext);
  const spell = useLocalizedResource(resourceId);
  const fields = spell
    ? [
        [t("casting_time"), spell.casting_time_with_ritual],
        [t("range"), spell.range],
        [t("components"), spell.components || "—"],
        [
          t("duration"),
          spell.concentration ? ti("duration_with_concentration", spell.duration) : spell.duration,
        ],
        ...(spell.character_classes ? [[t("classes"), spell.character_classes]] : []),
        ...(spell.materials ? [[t("materials"), spell.materials]] : []),
      ]
    : [];

  return (
    <ResourceDetailContent
      detailsContent={
        spell && (
          <SimpleGrid columns={{ base: 1, sm: 2 }} columnGap={8} rowGap={4}>
            {fields.map(([label, value]) => (
              <Box as="dl" key={label}>
                <Text as="dt" color="fg.muted" fontSize="sm">
                  {label}
                </Text>
                <Text as="dd">{value}</Text>
              </Box>
            ))}
          </SimpleGrid>
        )
      }
      resource={spell}
    />
  );
}

//------------------------------------------------------------------------------
// I18n Context
//------------------------------------------------------------------------------

const i18nContext = {
  casting_time: {
    en: "Casting time",
    it: "Tempo di lancio",
  },
  classes: {
    en: "Classes",
    it: "Classi",
  },
  components: {
    en: "Components",
    it: "Componenti",
  },
  duration_with_concentration: {
    en: "Up to <1> (concentration)",
    it: "Fino a <1> (concentrazione)",
  },
  duration: {
    en: "Duration",
    it: "Durata",
  },
  materials: {
    en: "Materials",
    it: "Materiali",
  },
  range: {
    en: "Range",
    it: "Gittata",
  },
};
