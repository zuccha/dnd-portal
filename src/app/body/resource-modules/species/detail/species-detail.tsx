import { SimpleGrid } from "@chakra-ui/react";
import { speciesStore } from "~/models/resources/species/species-store";
import ResourceDetail, { type ResourceDetailAction } from "../../resource-detail";
import ResourceDetailField from "../../resource-detail-field";

type SpeciesDetailResource = ReturnType<typeof speciesStore.useLocalizedResource>;

//------------------------------------------------------------------------------
// Species Detail
//------------------------------------------------------------------------------

export default function SpeciesDetail({
  actions,
  resource,
}: {
  actions?: ResourceDetailAction[];
  resource: SpeciesDetailResource;
}) {
  const species = resource;

  return (
    <ResourceDetail actions={actions} resource={species}>
      {species && (
        <SimpleGrid columns={{ base: 1, sm: 2 }} columnGap={6} rowGap={2}>
          <ResourceDetailField label={species.speed.label}>
            {species.speed.value}
          </ResourceDetailField>
        </SimpleGrid>
      )}
    </ResourceDetail>
  );
}
