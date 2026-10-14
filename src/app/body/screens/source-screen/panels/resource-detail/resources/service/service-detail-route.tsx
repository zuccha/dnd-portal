import { SimpleGrid } from "@chakra-ui/react";
import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import { serviceStore } from "~/models/resources/services/service-store";
import ResourceDetailContent from "../../resource-detail-content";
import ResourceDetailField from "../../resource-detail-field";

const useLocalizedResource = serviceStore.useLocalizedResource;

//------------------------------------------------------------------------------
// Service Detail Route
//------------------------------------------------------------------------------

export default function ServiceDetailRoute({ resourceId }: { resourceId: string }) {
  const { t } = useI18nLangContext(i18nContext);
  const service = useLocalizedResource(resourceId);

  return (
    <ResourceDetailContent
      detailsContent={
        service && (
          <SimpleGrid columns={{ base: 1, sm: 3 }} columnGap={6} rowGap={2}>
            <ResourceDetailField label={t("price")}>{service.price}</ResourceDetailField>
            {service.availability && (
              <ResourceDetailField label={t("availability")}>
                {service.availability}
              </ResourceDetailField>
            )}
          </SimpleGrid>
        )
      }
      resource={service}
    />
  );
}

//------------------------------------------------------------------------------
// I18n Context
//------------------------------------------------------------------------------

const i18nContext = {
  availability: { en: "Availability", it: "Disponibilità" },
  price: { en: "Price", it: "Prezzo" },
};
