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
        { label: spell.casting_time.label, value: spell.casting_time.value_with_ritual },
        spell.range,
        spell.components,
        { label: spell.duration.label, value: spell.duration.value_with_concentration },
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
          {spell.character_classes.length > 0 && (
            <GridItem colSpan={{ base: 1, sm: 2 }}>
              <ResourceDetailField label={spell.character_classes_label}>
                <ResourceDetailLinks resources={spell.character_classes} />
              </ResourceDetailField>
            </GridItem>
          )}
        </SimpleGrid>
      )}
    </ResourceDetail>
  );
}
