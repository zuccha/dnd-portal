import { GridItem, SimpleGrid, VStack } from "@chakra-ui/react";
import ResourceDetail, { type ResourceDetailAction } from "../../resource-detail";
import ResourceDetailField from "../../resource-detail-field";
import ResourceDetailLinks from "../../resource-detail-links";
import type { EquipmentModifier } from "../../../../../models/resources/modifiers/equipment/equipment-modifier";
import type { LocalizedEquipmentModifier } from "../../../../../models/resources/modifiers/equipment/localized-equipment-modifier";

//------------------------------------------------------------------------------
// Equipment Modifier Detail
//------------------------------------------------------------------------------

export default function EquipmentModifierDetail({
  actions,
  resource,
}: {
  actions?: ResourceDetailAction[];
  resource: LocalizedEquipmentModifier<EquipmentModifier> | undefined;
}) {
  return (
    <ResourceDetail actions={actions} resource={resource}>
      {resource && (
        <VStack align="stretch" gap={2}>
          <SimpleGrid columns={{ base: 1, sm: 3 }} columnGap={6} rowGap={2}>
            {[
              { field: resource.additional_cost, key: "additional_cost" },
              { field: resource.additional_weight, key: "additional_weight" },
              { field: resource.magic_status, key: "magic_status" },
              { field: resource.minimum_rarity, key: "minimum_rarity" },
              { field: resource.attunement, key: "attunement" },
            ].map(({ field, key }) =>
              field ? (
                <ResourceDetailField key={key} label={field.label}>
                  {field.value}
                </ResourceDetailField>
              ) : (
                <GridItem display={{ base: "none", sm: "block" }} key={key} />
              ),
            )}
          </SimpleGrid>
          {resource.supported_equipment.resources.length > 0 && (
            <ResourceDetailField label={resource.supported_equipment.label}>
              <ResourceDetailLinks resources={resource.supported_equipment.resources} />
            </ResourceDetailField>
          )}
        </VStack>
      )}
    </ResourceDetail>
  );
}
