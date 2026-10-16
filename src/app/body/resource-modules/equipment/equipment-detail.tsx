import { SimpleGrid, VStack } from "@chakra-ui/react";
import ResourceDetail, { type ResourceDetailAction } from "../resource-detail";
import ResourceDetailField from "../resource-detail-field";
import type { Equipment } from "../../../../models/resources/equipment/equipment";
import type { LocalizedResourceUnion } from "../../../../models/resources/resource-union";
import type { ReactNode } from "react";

type LocalizedEquipmentResource = Extract<LocalizedResourceUnion, { kind: Equipment["kind"] }>;

//------------------------------------------------------------------------------
// Equipment Detail
//------------------------------------------------------------------------------

export default function EquipmentDetail({
  actions,
  children,
  resource,
  uses,
}: {
  actions?: ResourceDetailAction[];
  children?: ReactNode;
  resource: LocalizedEquipmentResource | undefined;
  uses?: ReactNode;
}) {
  return (
    <ResourceDetail actions={actions} resource={resource}>
      {resource && (
        <VStack align="stretch" gap={2}>
          <SimpleGrid columns={{ base: 1, sm: 3 }} columnGap={6} rowGap={2}>
            {resource.cost.value && (
              <ResourceDetailField label={resource.cost.label}>
                {resource.cost.value}
              </ResourceDetailField>
            )}
            {resource.weight.value && (
              <ResourceDetailField label={resource.weight.label}>
                {resource.weight.value}
              </ResourceDetailField>
            )}
            <ResourceDetailField label={resource.magicStatus.label}>
              {resource.magicStatus.value}
            </ResourceDetailField>
          </SimpleGrid>
          {resource.magic && (
            <SimpleGrid columns={{ base: 1, sm: 3 }} columnGap={6} rowGap={2}>
              <ResourceDetailField label={resource.rarity.label}>
                {resource.rarity.value}
              </ResourceDetailField>
              <ResourceDetailField label={resource.attunement.label}>
                {resource.attunement.value}
              </ResourceDetailField>
            </SimpleGrid>
          )}
          {uses && (
            <SimpleGrid columns={{ base: 1, sm: 3 }} columnGap={6} rowGap={2}>
              {uses}
            </SimpleGrid>
          )}
          {children && (
            <SimpleGrid columns={{ base: 1, sm: 3 }} columnGap={6} rowGap={2}>
              {children}
            </SimpleGrid>
          )}
        </VStack>
      )}
    </ResourceDetail>
  );
}
