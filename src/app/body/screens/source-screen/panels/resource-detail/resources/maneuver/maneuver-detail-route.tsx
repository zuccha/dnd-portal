import { SimpleGrid } from "@chakra-ui/react";
import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import { maneuverStore } from "~/models/resources/maneuvers/maneuver-store";
import ResourceDetailContent from "../../resource-detail-content";
import ResourceDetailField from "../../resource-detail-field";

const useLocalizedResource = maneuverStore.useLocalizedResource;

//------------------------------------------------------------------------------
// Maneuver Detail Route
//------------------------------------------------------------------------------

export default function ManeuverDetailRoute({ resourceId }: { resourceId: string }) {
  const { t } = useI18nLangContext(i18nContext);
  const maneuver = useLocalizedResource(resourceId);

  return (
    <ResourceDetailContent
      detailsContent={
        maneuver?.prerequisite && (
          <SimpleGrid columns={{ base: 1, sm: 2 }} columnGap={6} rowGap={2}>
            <ResourceDetailField label={t("prerequisite")}>
              {maneuver.prerequisite}
            </ResourceDetailField>
          </SimpleGrid>
        )
      }
      resource={maneuver}
    />
  );
}

//------------------------------------------------------------------------------
// I18n Context
//------------------------------------------------------------------------------

const i18nContext = {
  prerequisite: {
    en: "Prerequisite",
    it: "Prerequisito",
  },
};
