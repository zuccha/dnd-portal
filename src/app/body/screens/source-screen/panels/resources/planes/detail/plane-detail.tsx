import { SimpleGrid } from "@chakra-ui/react";
import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import { planeStore } from "~/models/resources/planes/plane-store";
import ResourceDetailContent from "../../resource-detail-content";
import ResourceDetailField from "../../resource-detail-field";

type PlaneDetailResource = ReturnType<typeof planeStore.useLocalizedResource>;

//------------------------------------------------------------------------------
// Plane Detail
//------------------------------------------------------------------------------

export default function PlaneDetail({ resource }: { resource: PlaneDetailResource }) {
  const { t } = useI18nLangContext(i18nContext);
  const plane = resource;

  return (
    <ResourceDetailContent
      detailsContent={
        plane && (
          <SimpleGrid columns={{ base: 1, sm: 3 }} columnGap={6} rowGap={2}>
            {plane.alignments && (
              <ResourceDetailField label={t("alignments")}>{plane.alignments}</ResourceDetailField>
            )}
          </SimpleGrid>
        )
      }
      resource={plane}
    />
  );
}

//------------------------------------------------------------------------------
// I18n Context
//------------------------------------------------------------------------------

const i18nContext = {
  alignments: { en: "Alignments", it: "Allineamenti" },
};
