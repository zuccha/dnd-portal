import { SimpleGrid } from "@chakra-ui/react";
import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import { serviceStore } from "~/models/resources/services/service-store";
import ResourceDetail, { type ResourceDetailAction } from "../../resource-detail";
import ResourceDetailField from "../../resource-detail-field";

type ServiceDetailResource = ReturnType<typeof serviceStore.useLocalizedResource>;

//------------------------------------------------------------------------------
// Service Detail
//------------------------------------------------------------------------------

export default function ServiceDetail({
  actions,
  resource,
}: {
  actions?: ResourceDetailAction[];
  resource: ServiceDetailResource;
}) {
  const { t } = useI18nLangContext(i18nContext);
  const service = resource;

  return (
    <ResourceDetail actions={actions} resource={service}>
      {service && (
        <SimpleGrid columns={{ base: 1, sm: 3 }} columnGap={6} rowGap={2}>
          <ResourceDetailField label={t("price")}>{service.price}</ResourceDetailField>
          {service.availability && (
            <ResourceDetailField label={t("availability")}>
              {service.availability}
            </ResourceDetailField>
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
  availability: { en: "Availability", it: "Disponibilità" },
  price: { en: "Price", it: "Prezzo" },
};
