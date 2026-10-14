import { SimpleGrid, VStack } from "@chakra-ui/react";
import { useI18nLangContext } from "../../../../i18n/i18n-lang-context";
import ResourceDetailContent from "../resource-detail-content";
import ResourceDetailField from "../resource-detail-field";
import type { Equipment } from "../../../../models/resources/equipment/equipment";
import type { LocalizedResourceUnion } from "../../../../models/resources/resource-union";
import type { ReactNode } from "react";

type LocalizedEquipmentResource = Extract<LocalizedResourceUnion, { kind: Equipment["kind"] }>;

//------------------------------------------------------------------------------
// Equipment Detail
//------------------------------------------------------------------------------

export default function EquipmentDetail({
  children,
  resource,
  uses,
}: {
  children?: ReactNode;
  resource: LocalizedEquipmentResource | undefined;
  uses?: ReactNode;
}) {
  const { t } = useI18nLangContext(i18nContext);
  const cost = resource?.cost ?? "";
  const weight = resource?.weight ?? "";

  return (
    <ResourceDetailContent
      detailsContent={
        resource && (
          <VStack align="stretch" gap={3}>
            <SimpleGrid columns={{ base: 1, sm: 3 }} columnGap={6} rowGap={2}>
              {cost && <ResourceDetailField label={t("cost")}>{cost}</ResourceDetailField>}
              {weight && <ResourceDetailField label={t("weight")}>{weight}</ResourceDetailField>}
              <ResourceDetailField label={t("magic")}>
                {t(resource.magic ? "yes" : "no")}
              </ResourceDetailField>
              {resource.magic && (
                <ResourceDetailField label={t("rarity")}>{resource.rarity}</ResourceDetailField>
              )}
              {uses}
              {resource.magic && resource._raw.required_attunement_slots > 0 && (
                <ResourceDetailField label={t("attunement_slots")}>
                  {resource._raw.required_attunement_slots}
                </ResourceDetailField>
              )}
            </SimpleGrid>
            {children && (
              <SimpleGrid columns={{ base: 1, sm: 3 }} columnGap={6} rowGap={2}>
                {children}
              </SimpleGrid>
            )}
          </VStack>
        )
      }
      resource={resource}
    />
  );
}

//------------------------------------------------------------------------------
// I18n Context
//------------------------------------------------------------------------------

const i18nContext = {
  attunement_slots: { en: "Attunement Slots", it: "Slot di Sintonia" },
  cost: { en: "Cost", it: "Costo" },
  magic: { en: "Magical", it: "Magico" },
  no: { en: "No", it: "No" },
  rarity: { en: "Rarity", it: "Rarità" },
  yes: { en: "Yes", it: "Sì" },
  weight: { en: "Weight", it: "Peso" },
};
