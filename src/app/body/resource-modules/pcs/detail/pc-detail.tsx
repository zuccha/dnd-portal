import { SimpleGrid } from "@chakra-ui/react";
import { pcStore } from "~/models/resources/pcs/pc-store";
import { resourceDetailRoute } from "~/navigation/routes";
import RouterLink from "~/ui/router-link";
import ResourceDetail, { type ResourceDetailAction } from "../../resource-detail";
import ResourceDetailField from "../../resource-detail-field";

//------------------------------------------------------------------------------
// PC Detail Resource
//------------------------------------------------------------------------------

type PcDetailResource = ReturnType<typeof pcStore.useLocalizedResource>;

//------------------------------------------------------------------------------
// PC Detail Props
//------------------------------------------------------------------------------

type PcDetailProps = {
  actions?: ResourceDetailAction[];
  resource: PcDetailResource;
};

//------------------------------------------------------------------------------
// PC Detail
//------------------------------------------------------------------------------

export default function PcDetail({ actions, resource }: PcDetailProps) {
  return (
    <ResourceDetail actions={actions} resource={resource}>
      {resource && (
        <SimpleGrid columns={{ base: 1, sm: 2 }} columnGap={6} rowGap={2}>
          <ResourceDetailField label={resource.species.label}>
            {resource.species.resource ? (
              <RouterLink
                to={resourceDetailRoute(
                  resource.species.resource.kind,
                  resource.species.resource.id,
                )}
              >
                {resource.species.resource.name}
              </RouterLink>
            ) : (
              "-"
            )}
          </ResourceDetailField>
          <ResourceDetailField label={resource.classes.label}>
            {resource.classes.resources.length
              ? resource.classes.resources.map(({ id, kind, name }, index) => (
                  <span key={id}>
                    {index > 0 ? ", " : ""}
                    <RouterLink to={resourceDetailRoute(kind, id)}>{name}</RouterLink>
                  </span>
                ))
              : "-"}
          </ResourceDetailField>
          <ResourceDetailField label={resource.level.label}>
            {resource.level.value}
          </ResourceDetailField>
          <ResourceDetailField label={resource.status.label}>
            {resource.status.value}
          </ResourceDetailField>
          <ResourceDetailField label={resource.date_of_birth.label}>
            {resource.date_of_birth.value || "-"}
          </ResourceDetailField>
          <ResourceDetailField label={resource.date_of_death.label}>
            {resource.date_of_death.value || "-"}
          </ResourceDetailField>
        </SimpleGrid>
      )}
    </ResourceDetail>
  );
}
