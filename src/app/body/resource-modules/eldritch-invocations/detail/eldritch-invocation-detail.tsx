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
      {invocation && (invocation.minWarlockLevel.value || invocation.otherPrerequisite.value) && (
        <SimpleGrid columns={1} columnGap={6} rowGap={2}>
          {invocation.otherPrerequisite.value && (
            <ResourceDetailField label={invocation.otherPrerequisite.label}>
              {invocation.otherPrerequisite.value}
            </ResourceDetailField>
          )}
          {invocation.minWarlockLevel.value && (
            <ResourceDetailField label={invocation.minWarlockLevel.label}>
              {invocation.minWarlockLevel.value}
            </ResourceDetailField>
          )}
        </SimpleGrid>
      )}
    </ResourceDetail>
  );
}
