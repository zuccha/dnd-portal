import { GridItem, SimpleGrid, VStack } from "@chakra-ui/react";
import { useMemo } from "react";
import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import { creatureTagStore } from "~/models/resources/creature-tags/creature-tag-store";
import { creatureStore } from "~/models/resources/creatures/creature-store";
import { resourceDetailRoute } from "~/navigation/routes";
import RouterLink from "~/ui/router-link";
import ResourceDetailContent from "../../resource-detail-content";
import ResourceDetailField from "../../resource-detail-field";

const useLocalizedResource = creatureTagStore.useLocalizedResource;
const useCreatureResourceIds = creatureStore.useResourceIds;
const useCreatureResources = creatureStore.useResources;
const useLocalizedCreatureNames = creatureStore.useLocalizedResourceNames;

//------------------------------------------------------------------------------
// Creature Tag Detail Route
//------------------------------------------------------------------------------

export default function CreatureTagDetailRoute({ resourceId }: { resourceId: string }) {
  const { t } = useI18nLangContext(i18nContext);
  const tag = useLocalizedResource(resourceId);
  const tagId = tag?._raw.id;
  const creatureIds = useCreatureResourceIds(tag?._raw.source_id ?? "");
  const creatures = useCreatureResources(creatureIds);
  const taggedCreatureIds = useMemo(
    () =>
      creatures
        .filter(({ tag_ids }) => tagId !== undefined && tag_ids.includes(tagId))
        .map(({ id }) => id),
    [creatures, tagId],
  );
  const creatureNames = useLocalizedCreatureNames(taggedCreatureIds);
  const sortedCreatures = useMemo(
    () =>
      taggedCreatureIds
        .flatMap((id, index) => {
          const name = creatureNames[index];
          return name ? [{ id, name }] : [];
        })
        .sort((a, b) => a.name.localeCompare(b.name)),
    [creatureNames, taggedCreatureIds],
  );

  return (
    <ResourceDetailContent
      detailsContent={
        tag && (
          <SimpleGrid columns={{ base: 1, sm: 2 }} columnGap={6} rowGap={3}>
            {sortedCreatures.length > 0 && (
              <GridItem colSpan={{ base: 1, sm: 2 }}>
                <ResourceDetailField label={t("creatures")}>
                  <VStack align="flex-start" gap={1}>
                    {sortedCreatures.map(({ id, name }) => (
                      <RouterLink key={id} to={resourceDetailRoute("creature", id)}>
                        {name}
                      </RouterLink>
                    ))}
                  </VStack>
                </ResourceDetailField>
              </GridItem>
            )}
          </SimpleGrid>
        )
      }
      resource={tag}
    />
  );
}

//------------------------------------------------------------------------------
// I18n Context
//------------------------------------------------------------------------------

const i18nContext = {
  creatures: { en: "Creatures", it: "Creature" },
};
