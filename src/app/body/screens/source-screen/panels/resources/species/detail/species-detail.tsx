import { SimpleGrid } from "@chakra-ui/react";
import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import { speciesStore } from "~/models/resources/species/species-store";
import ResourceDetailContent from "../../detail/resource-detail-content";
import ResourceDetailField from "../../detail/resource-detail-field";

type SpeciesDetailResource = ReturnType<typeof speciesStore.useLocalizedResource>;

//------------------------------------------------------------------------------
// Species Detail
//------------------------------------------------------------------------------

export default function SpeciesDetail({ resource }: { resource: SpeciesDetailResource }) {
  const { t } = useI18nLangContext(i18nContext);
  const species = resource;

  return (
    <ResourceDetailContent
      detailsContent={
        species && (
          <SimpleGrid columns={{ base: 1, sm: 2 }} columnGap={6} rowGap={2}>
            <ResourceDetailField label={t("speed")}>{species.speed}</ResourceDetailField>
          </SimpleGrid>
        )
      }
      resource={species}
    />
  );
}

//------------------------------------------------------------------------------
// I18n Context
//------------------------------------------------------------------------------

const i18nContext = {
  speed: {
    en: "Speed",
    it: "Velocità",
  },
};
