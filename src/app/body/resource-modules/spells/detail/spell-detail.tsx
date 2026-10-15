import { GridItem, SimpleGrid } from "@chakra-ui/react";
import { spellStore } from "~/models/resources/spells/spell-store";
import ResourceDetail, { type ResourceDetailAction } from "../../resource-detail";
import ResourceDetailField from "../../resource-detail-field";
import ResourceDetailLinks from "../../resource-detail-links";

type SpellDetailResource = ReturnType<typeof spellStore.useLocalizedResource>;

//------------------------------------------------------------------------------
// Spell Detail
//------------------------------------------------------------------------------

export default function SpellDetail({
  actions,
  resource,
}: {
  actions?: ResourceDetailAction[];
  resource: SpellDetailResource;
}) {
  const spell = resource;
  const fields = spell
    ? [
        { label: spell.castingTime.label, value: spell.castingTime.valueWithRitual },
        spell.range,
        spell.components,
        { label: spell.duration.label, value: spell.duration.valueWithConcentration },
      ]
    : [];

  return (
    <ResourceDetail actions={actions} resource={spell}>
      {spell && (
        <SimpleGrid columns={{ base: 1, sm: 2 }} columnGap={6} rowGap={2}>
          {fields.map(({ label, value }) => (
            <ResourceDetailField key={label} label={label}>
              {value}
            </ResourceDetailField>
          ))}
          {spell.materials.value && (
            <GridItem colSpan={{ base: 1, sm: 2 }}>
              <ResourceDetailField label={spell.materials.label}>
                {spell.materials.value}
              </ResourceDetailField>
            </GridItem>
          )}
          {spell.characterClasses.length > 0 && (
            <GridItem colSpan={{ base: 1, sm: 2 }}>
              <ResourceDetailField label={spell.characterClassesLabel}>
                <ResourceDetailLinks resources={spell.characterClasses} />
              </ResourceDetailField>
            </GridItem>
          )}
        </SimpleGrid>
      )}
    </ResourceDetail>
  );
}
