import { GridItem, SimpleGrid } from "@chakra-ui/react";
import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import { useActiveSourceRelatedResourceEntries } from "~/models/catalogue/resource-relation-hooks";
import { characterClassStore } from "~/models/resources/character-classes/character-class-store";
import { defaultSpell } from "~/models/resources/spells/spell";
import { spellStore } from "~/models/resources/spells/spell-store";
import ResourceDetailContent from "../../resource-detail-content";
import ResourceDetailField from "../../resource-detail-field";
import ResourceDetailLinks from "../../resource-detail-links";

type SpellDetailResource = ReturnType<typeof spellStore.useLocalizedResource>;
const { useLocalizedResourceNames: useLocalizedClassNames } = characterClassStore;

//------------------------------------------------------------------------------
// Spell Detail
//------------------------------------------------------------------------------

export default function SpellDetail({ resource }: { resource: SpellDetailResource }) {
  const { t, ti } = useI18nLangContext(i18nContext);
  const spell = resource;
  const classEntries = useActiveSourceRelatedResourceEntries(
    "character_classes_and_spells",
    spell ?? defaultSpell,
  );
  const classIds = classEntries.map(({ id }) => id);
  const classNames = useLocalizedClassNames(classIds);
  const classes = classEntries.flatMap((entry, index) => {
    const name = classNames[index];
    return name ? [{ ...entry, name }] : [];
  });
  const fields = spell
    ? [
        [t("casting_time"), spell.casting_time_with_ritual],
        [t("range"), spell.range],
        [t("components"), spell.components || "—"],
        [
          t("duration"),
          spell.concentration ? ti("duration_with_concentration", spell.duration) : spell.duration,
        ],
        ...(spell.materials ? [[t("materials"), spell.materials]] : []),
      ]
    : [];

  return (
    <ResourceDetailContent
      detailsContent={
        spell && (
          <SimpleGrid columns={{ base: 1, sm: 2 }} columnGap={6} rowGap={2}>
            {fields.map(([label, value], index) => (
              <ResourceDetailField key={index} label={label}>
                {value}
              </ResourceDetailField>
            ))}
            {classes.length > 0 && (
              <GridItem colSpan={{ base: 1, sm: 2 }}>
                <ResourceDetailField label={t("classes")}>
                  <ResourceDetailLinks resources={classes} />
                </ResourceDetailField>
              </GridItem>
            )}
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
