import { GridItem, SimpleGrid, Text, VStack } from "@chakra-ui/react";
import { Fragment } from "react";
import { featureStore } from "~/models/resources/features/feature-store";
import { resourceDetailRoute } from "~/navigation/routes";
import RouterLink from "~/ui/router-link";
import ResourceDetail, { type ResourceDetailAction } from "../../resource-detail";
import ResourceDetailField from "../../resource-detail-field";

//------------------------------------------------------------------------------
// Feature Detail Resource
//------------------------------------------------------------------------------

type FeatureDetailResource = ReturnType<typeof featureStore.useLocalizedResource>;

//------------------------------------------------------------------------------
// Feature Detail
//------------------------------------------------------------------------------

export default function FeatureDetail({
  actions,
  resource,
}: {
  actions?: ResourceDetailAction[];
  resource: FeatureDetailResource;
}) {
  const feature = resource;

  return (
    <ResourceDetail actions={actions} resource={feature}>
      {feature &&
        ((feature.displayName.value && feature.displayName.value !== feature.name) ||
          feature.grantedBy.length > 0) && (
          <SimpleGrid columns={{ base: 1, sm: 2 }} columnGap={6} rowGap={2}>
            {feature.displayName.value && feature.displayName.value !== feature.name && (
              <ResourceDetailField label={feature.displayName.label}>
                {feature.displayName.value}
              </ResourceDetailField>
            )}
            {feature.grantedBy.length > 0 && (
              <GridItem colSpan={{ base: 1, sm: 2 }}>
                <ResourceDetailField label={feature.grantedByLabel}>
                  <VStack align="stretch" gap={2}>
                    {feature.grantedBy.map(({ label, values }) => (
                      <VStack align="stretch" gap={0} key={label}>
                        <Text fontSize="sm" fontWeight="medium">
                          {label}
                        </Text>
                        <Text>
                          {values.map(({ id, kind, level, name }, index) => (
                            <Fragment key={`${kind}:${id}:${level}`}>
                              {index > 0 ? ", " : ""}
                              <RouterLink to={resourceDetailRoute(kind, id)}>{name}</RouterLink>
                              {level ? ` ${level}` : ""}
                            </Fragment>
                          ))}
                        </Text>
                      </VStack>
                    ))}
                  </VStack>
                </ResourceDetailField>
              </GridItem>
            )}
          </SimpleGrid>
        )}
    </ResourceDetail>
  );
}
