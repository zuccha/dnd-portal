import { SimpleGrid } from "@chakra-ui/react";
import { featStore } from "~/models/resources/feats/feat-store";
import ResourceDetail, { type ResourceDetailAction } from "../../resource-detail";
import ResourceDetailField from "../../resource-detail-field";

type FeatDetailResource = ReturnType<typeof featStore.useLocalizedResource>;

//------------------------------------------------------------------------------
// Feat Detail
//------------------------------------------------------------------------------

export default function FeatDetail({
  actions,
  resource,
}: {
  actions?: ResourceDetailAction[];
  resource: FeatDetailResource;
}) {
  const feat = resource;

  return (
    <ResourceDetail actions={actions} resource={feat}>
      {feat && (feat.minLevel.value || feat.prerequisite.value) && (
        <SimpleGrid columns={{ base: 1, sm: 2 }} columnGap={6} rowGap={2}>
          {feat.minLevel.value && (
            <ResourceDetailField label={feat.minLevel.label}>
              {feat.minLevel.value}
            </ResourceDetailField>
          )}
          {feat.prerequisite.value && (
            <ResourceDetailField label={feat.prerequisite.label}>
              {feat.prerequisite.value}
            </ResourceDetailField>
          )}
        </SimpleGrid>
      )}
    </ResourceDetail>
  );
}
