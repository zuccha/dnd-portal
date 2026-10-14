import { GridItem, SimpleGrid, VStack } from "@chakra-ui/react";
import { useMemo } from "react";
import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import { creatureFamilyStore } from "~/models/resources/creature-families/creature-family-store";
import { creatureStore } from "~/models/resources/creatures/creature-store";
import { planeStore } from "~/models/resources/planes/plane-store";
import { resourceDetailRoute } from "~/navigation/routes";
import RouterLink from "~/ui/router-link";
import ResourceDetailContent from "../../resource-detail-content";
import ResourceDetailField from "../../resource-detail-field";

const useLocalizedResource = creatureFamilyStore.useLocalizedResource;
const useCreatureResourceIds = creatureStore.useResourceIds;
const useCreatureResources = creatureStore.useResources;
const useLocalizedCreatureNames = creatureStore.useLocalizedResourceNames;
const useLocalizedPlaneNames = planeStore.useLocalizedResourceNames;
const noPlaneIds: string[] = [];

//------------------------------------------------------------------------------
// Creature Family Detail Route
//------------------------------------------------------------------------------

export default function CreatureFamilyDetailRoute({ resourceId }: { resourceId: string }) {
  const { t } = useI18nLangContext(i18nContext);
  const family = useLocalizedResource(resourceId);
  const creatureIds = useCreatureResourceIds(family?._raw.source_id ?? "");
  const creatures = useCreatureResources(creatureIds);
  const familyCreatureIds = useMemo(
    () => creatures.filter(({ family_id }) => family_id === family?._raw.id).map(({ id }) => id),
    [creatures, family?._raw.id],
  );
  const creatureNames = useLocalizedCreatureNames(familyCreatureIds);
  const planeNames = useLocalizedPlaneNames(family?._raw.plane_ids ?? noPlaneIds);
  const sortedCreatures = useMemo(
    () =>
      familyCreatureIds
        .flatMap((id, index) => {
          const name = creatureNames[index];
          return name ? [{ id, name }] : [];
        })
        .sort((a, b) => a.name.localeCompare(b.name)),
    [creatureNames, familyCreatureIds],
  );

  return (
    <ResourceDetailContent
      detailsContent={
        family && (
          <SimpleGrid columns={{ base: 1, sm: 2 }} columnGap={6} rowGap={3}>
            {family.habitats && (
              <ResourceDetailField label={t("habitats")}>{family.habitats}</ResourceDetailField>
            )}
            {planeNames.some(Boolean) && (
              <ResourceDetailField label={t("planes")}>
                {planeNames.filter(Boolean).join(", ")}
              </ResourceDetailField>
            )}
            {family.treasures && (
              <ResourceDetailField label={t("treasures")}>{family.treasures}</ResourceDetailField>
            )}
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
      resource={family}
    />
  );
}

//------------------------------------------------------------------------------
// I18n Context
//------------------------------------------------------------------------------

const i18nContext = {
  creatures: { en: "Creatures", it: "Creature" },
  habitats: { en: "Habitats", it: "Habitat" },
  planes: { en: "Planes", it: "Piani" },
  treasures: { en: "Treasures", it: "Tesori" },
};
