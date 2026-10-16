import { GridItem, SimpleGrid, VStack } from "@chakra-ui/react";
import { Fragment } from "react";
import { creatureStore } from "~/models/resources/creatures/creature-store";
import { resourceDetailRoute } from "~/navigation/routes";
import RouterLink from "~/ui/router-link";
import ResourceDetail, { type ResourceDetailAction } from "../../resource-detail";
import ResourceDetailField from "../../resource-detail-field";
import ResourceDetailLinks from "../../resource-detail-links";
import CreatureDetailAbilityScoreTable from "./creature-detail-ability-score-table";

type CreatureDetailResource = ReturnType<typeof creatureStore.useLocalizedResource>;

//------------------------------------------------------------------------------
// Creature Detail
//------------------------------------------------------------------------------

export default function CreatureDetail({
  actions,
  resource,
}: {
  actions?: ResourceDetailAction[];
  resource: CreatureDetailResource;
}) {
  const creature = resource;
  const infoFields: {
    currency?: string;
    detailParts?: NonNullable<CreatureDetailResource>["languages_info"]["detail_parts"];
    entries?: NonNullable<CreatureDetailResource>["gear"]["entries"];
    label: string;
    value: string;
  }[] = creature
    ? [
        { ...creature.skills, detailParts: undefined },
        { ...creature.immunities, detailParts: undefined },
        { ...creature.resistances, detailParts: undefined },
        { ...creature.vulnerabilities, detailParts: undefined },
        creature.gear,
        creature.languages_info,
        { ...creature.senses, detailParts: undefined },
      ].filter(({ value }) => value)
    : [];

  return (
    <ResourceDetail actions={actions} resource={creature}>
      {creature && (
        <VStack align="stretch" gap={3}>
          <SimpleGrid columns={{ base: 1, md: 3 }} columnGap={6} rowGap={2}>
            <ResourceDetailField label={creature.challenge_rating.label}>
              {creature.challenge_rating.value}
            </ResourceDetailField>
            <ResourceDetailField label={creature.proficiency_bonus.label}>
              {creature.proficiency_bonus.value}
            </ResourceDetailField>
            <ResourceDetailField label={creature.experience.label}>
              {creature.experience.value_with_lair}
            </ResourceDetailField>
          </SimpleGrid>

          <SimpleGrid columns={{ base: 1, md: 3 }} columnGap={6} rowGap={3}>
            <ResourceDetailField label={creature.armor_class.label}>
              {creature.armor_class.value}
            </ResourceDetailField>
            <ResourceDetailField label={creature.hit_points.label}>
              {creature.hit_points.value_with_formula}
            </ResourceDetailField>
            <ResourceDetailField label={creature.initiative.label}>
              {creature.initiative.value} ({creature.initiative.passive})
            </ResourceDetailField>

            <ResourceDetailField label={creature.passive_perception.label}>
              {creature.passive_perception.value}
            </ResourceDetailField>
            <GridItem gridColumn={{ base: 1, md: 2 }}>
              {creature.family.resource && (
                <ResourceDetailField label={creature.family.label}>
                  <RouterLink
                    to={resourceDetailRoute(
                      creature.family.resource.kind,
                      creature.family.resource.id,
                    )}
                  >
                    {creature.family.resource.name}
                  </RouterLink>
                </ResourceDetailField>
              )}
            </GridItem>
            <GridItem gridColumn={{ base: 1, md: 3 }}>
              {creature.tags.resources.length > 0 && (
                <ResourceDetailField label={creature.tags.label}>
                  <ResourceDetailLinks resources={creature.tags.resources} />
                </ResourceDetailField>
              )}
            </GridItem>
          </SimpleGrid>

          <ResourceDetailField label={creature.speed.label}>
            {creature.speed.value}
          </ResourceDetailField>

          <CreatureDetailAbilityScoreTable creature={creature} />

          <VStack align="stretch" gap={1}>
            {infoFields.map((field) => (
              <ResourceDetailField key={field.label} label={field.label}>
                {field.entries
                  ? field.entries.length || field.currency
                    ? [
                        ...field.entries.map((entry, index) => (
                          <Fragment key={`${entry.resource?.kind}:${entry.resource?.id}:${index}`}>
                            {index > 0 && ", "}
                            {entry.resource ? (
                              <RouterLink
                                to={resourceDetailRoute(entry.resource.kind, entry.resource.id)}
                              >
                                {entry.resource.name}
                              </RouterLink>
                            ) : (
                              entry.name
                            )}
                            {entry.notes && ` (${entry.notes})`}
                            {entry.quantity && ` (${entry.quantity})`}
                          </Fragment>
                        )),
                        ...(field.currency
                          ? [
                              <Fragment key="currency">
                                {field.entries.length > 0 && ", "}
                                {field.currency}
                              </Fragment>,
                            ]
                          : []),
                      ]
                    : field.value
                  : field.detailParts
                    ? field.detailParts.map((part, index) =>
                        part.type === "resource" ? (
                          <RouterLink
                            key={`${part.resource.kind}:${part.resource.id}`}
                            to={resourceDetailRoute(part.resource.kind, part.resource.id)}
                          >
                            {part.resource.name}
                          </RouterLink>
                        ) : (
                          <span key={index}>{part.value}</span>
                        ),
                      )
                    : field.value}
              </ResourceDetailField>
            ))}
          </VStack>
        </VStack>
      )}
    </ResourceDetail>
  );
}
