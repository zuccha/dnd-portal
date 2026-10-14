import { SimpleGrid } from "@chakra-ui/react";
import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import { serviceStore } from "~/models/resources/services/service-store";
import ResourceDetailContent from "../../detail/resource-detail-content";
import ResourceDetailField from "../../detail/resource-detail-field";

type ServiceDetailResource = ReturnType<typeof serviceStore.useLocalizedResource>;

//------------------------------------------------------------------------------
// Service Detail
//------------------------------------------------------------------------------

export default function ServiceDetail({ resource }: { resource: ServiceDetailResource }) {
  const { t } = useI18nLangContext(i18nContext);
  const service = resource;

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
