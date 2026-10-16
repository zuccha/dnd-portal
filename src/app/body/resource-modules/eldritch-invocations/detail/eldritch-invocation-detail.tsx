import { SimpleGrid } from "@chakra-ui/react";
import { eldritchInvocationStore } from "~/models/resources/eldritch-invocations/eldritch-invocation-store";
import ResourceDetail, { type ResourceDetailAction } from "../../resource-detail";
import ResourceDetailField from "../../resource-detail-field";

type EldritchInvocationDetailResource = ReturnType<
  typeof eldritchInvocationStore.useLocalizedResource
>;

//------------------------------------------------------------------------------
// Eldritch Invocation Detail
//------------------------------------------------------------------------------

export default function EldritchInvocationDetail({
  actions,
  resource,
}: {
  actions?: ResourceDetailAction[];
  resource: EldritchInvocationDetailResource;
}) {
  const invocation = resource;

  return (
    <ResourceDetail actions={actions} resource={invocation}>
      {invocation && (invocation.minimum_warlock_level.value || invocation.prerequisite.value) && (
        <SimpleGrid columns={1} columnGap={6} rowGap={2}>
          {invocation.prerequisite.value && (
            <ResourceDetailField label={invocation.prerequisite.label}>
              {invocation.prerequisite.value}
            </ResourceDetailField>
          )}
          {invocation.minimum_warlock_level.value && (
            <ResourceDetailField label={invocation.minimum_warlock_level.label}>
              {invocation.minimum_warlock_level.value}
            </ResourceDetailField>
          )}
        </SimpleGrid>
      )}
    </ResourceDetail>
  );
}
