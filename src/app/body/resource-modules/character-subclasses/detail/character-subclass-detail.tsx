import { SimpleGrid } from "@chakra-ui/react";
import { characterSubclassStore } from "~/models/resources/character-subclasses/character-subclass-store";
import { resourceDetailRoute } from "~/navigation/routes";
import RouterLink from "~/ui/router-link";
import ResourceDetail, { type ResourceDetailAction } from "../../resource-detail";
import ResourceDetailField from "../../resource-detail-field";

type CharacterSubclassDetailResource = ReturnType<
  typeof characterSubclassStore.useLocalizedResource
>;

//------------------------------------------------------------------------------
// Character Subclass Detail
//------------------------------------------------------------------------------

export default function CharacterSubclassDetail({
  actions,
  resource,
}: {
  actions?: ResourceDetailAction[];
  resource: CharacterSubclassDetailResource;
}) {
  const characterSubclass = resource;

  return (
    <ResourceDetail actions={actions} resource={characterSubclass}>
      {characterSubclass?.characterClass.value && (
        <SimpleGrid columns={{ base: 1, sm: 2 }} columnGap={6} rowGap={2}>
          <ResourceDetailField label={characterSubclass.characterClass.label}>
            <RouterLink
              to={resourceDetailRoute("character_class", characterSubclass.characterClass.id)}
            >
              {characterSubclass.characterClass.value}
            </RouterLink>
          </ResourceDetailField>
        </SimpleGrid>
      )}
    </ResourceDetail>
  );
}
