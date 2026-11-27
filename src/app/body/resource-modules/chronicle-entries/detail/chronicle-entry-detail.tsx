import { SimpleGrid } from "@chakra-ui/react";
import { chronicleEntryStore } from "~/models/resources/chronicle-entries/chronicle-entry-store";
import ResourceDetail, { type ResourceDetailAction } from "../../resource-detail";
import ResourceDetailField from "../../resource-detail-field";
import ResourceDetailLinks from "../../resource-detail-links";

//------------------------------------------------------------------------------
// Chronicle Entry Detail Props
//------------------------------------------------------------------------------

type ChronicleEntryDetailProps = {
  actions?: ResourceDetailAction[];
  resource: ReturnType<typeof chronicleEntryStore.useLocalizedResource>;
};

//------------------------------------------------------------------------------
// Chronicle Entry Detail
//------------------------------------------------------------------------------

export default function ChronicleEntryDetail({ actions, resource }: ChronicleEntryDetailProps) {
  return (
    <ResourceDetail actions={actions} resource={resource}>
      {resource && (
        <SimpleGrid columns={{ base: 1, sm: 2 }} columnGap={6} rowGap={2}>
          <ResourceDetailField label={resource.date.label}>
            {resource.date.value || "-"}
          </ResourceDetailField>
          <ResourceDetailField label={resource.subjects.label}>
            {resource.subjects.resources.length ? (
              <ResourceDetailLinks resources={resource.subjects.resources} />
            ) : (
              "-"
            )}
          </ResourceDetailField>
        </SimpleGrid>
      )}
    </ResourceDetail>
  );
}
