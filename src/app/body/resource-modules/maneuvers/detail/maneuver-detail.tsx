import { SimpleGrid } from "@chakra-ui/react";
import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import { maneuverStore } from "~/models/resources/maneuvers/maneuver-store";
import ResourceDetail, { type ResourceDetailAction } from "../../resource-detail";
import ResourceDetailField from "../../resource-detail-field";

type ManeuverDetailResource = ReturnType<typeof maneuverStore.useLocalizedResource>;

//------------------------------------------------------------------------------
// Maneuver Detail
//------------------------------------------------------------------------------

export default function ManeuverDetail({
  actions,
  resource,
}: {
  actions?: ResourceDetailAction[];
  resource: ManeuverDetailResource;
}) {
  const { t } = useI18nLangContext(i18nContext);
  const maneuver = resource;

  return (
    <ResourceDetail actions={actions} resource={maneuver}>
      {maneuver?.prerequisite && (
        <SimpleGrid columns={{ base: 1, sm: 2 }} columnGap={6} rowGap={2}>
          <ResourceDetailField label={t("prerequisite")}>
            {maneuver.prerequisite}
          </ResourceDetailField>
        </SimpleGrid>
      )}
    </ResourceDetail>
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
