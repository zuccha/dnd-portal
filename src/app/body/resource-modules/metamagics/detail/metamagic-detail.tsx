import { SimpleGrid } from "@chakra-ui/react";
import { metamagicStore } from "~/models/resources/metamagics/metamagic-store";
import ResourceDetail, { type ResourceDetailAction } from "../../resource-detail";
import ResourceDetailField from "../../resource-detail-field";

type MetamagicDetailResource = ReturnType<typeof metamagicStore.useLocalizedResource>;

//------------------------------------------------------------------------------
// Metamagic Detail
//------------------------------------------------------------------------------

export default function MetamagicDetail({
  actions,
  resource,
}: {
  actions?: ResourceDetailAction[];
  resource: MetamagicDetailResource;
}) {
  const metamagic = resource;

  return (
    <ResourceDetail actions={actions} resource={metamagic}>
      {metamagic && (
        <SimpleGrid columns={{ base: 1, sm: 2 }} columnGap={6} rowGap={2}>
          <ResourceDetailField label={metamagic.sorceryPoints.label}>
            {metamagic.sorceryPoints.value}
          </ResourceDetailField>
          {metamagic.prerequisite.value && (
            <ResourceDetailField label={metamagic.prerequisite.label}>
              {metamagic.prerequisite.value}
            </ResourceDetailField>
          )}
        </SimpleGrid>
      )}
    </ResourceDetail>
  );
}
