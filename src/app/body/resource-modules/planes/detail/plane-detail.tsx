import { SimpleGrid } from "@chakra-ui/react";
import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import { planeStore } from "~/models/resources/planes/plane-store";
import ResourceDetail, { type ResourceDetailAction } from "../../resource-detail";
import ResourceDetailField from "../../resource-detail-field";

type PlaneDetailResource = ReturnType<typeof planeStore.useLocalizedResource>;

//------------------------------------------------------------------------------
// Plane Detail
//------------------------------------------------------------------------------

export default function PlaneDetail({
  actions,
  resource,
}: {
  actions?: ResourceDetailAction[];
  resource: PlaneDetailResource;
}) {
  const { t } = useI18nLangContext(i18nContext);
  const plane = resource;

  return (
    <ResourceDetail actions={actions} resource={plane}>
      {plane && (
        <SimpleGrid columns={{ base: 1, sm: 3 }} columnGap={6} rowGap={2}>
          {plane.alignments && (
            <ResourceDetailField label={t("alignments")}>{plane.alignments}</ResourceDetailField>
          )}
        </SimpleGrid>
      )}
    </ResourceDetail>
  );
}

//------------------------------------------------------------------------------
// I18n Context
//------------------------------------------------------------------------------

const i18nContext = {
  alignments: { en: "Alignments", it: "Allineamenti" },
};
