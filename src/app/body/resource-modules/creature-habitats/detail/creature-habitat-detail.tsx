import { GridItem, SimpleGrid, VStack } from "@chakra-ui/react";
import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import { creatureFamilyStore } from "~/models/resources/creature-families/creature-family-store";
import { creatureHabitatStore } from "~/models/resources/creature-habitats/creature-habitat-store";
import { resourceDetailRoute } from "~/navigation/routes";
import RouterLink from "~/ui/router-link";
import ResourceDetail, { type ResourceDetailAction } from "../../resource-detail";
import ResourceDetailField from "../../resource-detail-field";

type CreatureHabitatDetailResource = ReturnType<typeof creatureHabitatStore.useLocalizedResource>;
const useHabitatFamilyEntries = creatureHabitatStore.useRelatedEntries;
const useLocalizedFamilyNames = creatureFamilyStore.useLocalizedResourceNames;

//------------------------------------------------------------------------------
// Creature Habitat Detail
//------------------------------------------------------------------------------

export default function CreatureHabitatDetail({
  actions,
  resource,
}: {
  actions?: ResourceDetailAction[];
  resource: CreatureHabitatDetailResource;
}) {
  const { lang, t } = useI18nLangContext(i18nContext);
  const habitat = resource;
  const familyEntries = useHabitatFamilyEntries(habitat?._raw.id ?? "", "families");
  const familyNames = useLocalizedFamilyNames(familyEntries.map(({ id }) => id));
  const families = familyEntries
    .flatMap((entry, index) => {
      const name = familyNames[index];
      return name ? [{ ...entry, name }] : [];
    })
    .sort((a, b) => a.name.localeCompare(b.name, lang));

  return (
    <ResourceDetail actions={actions} resource={habitat}>
      {families.length > 0 && (
        <SimpleGrid columns={{ base: 1, sm: 2 }} columnGap={6} rowGap={3}>
          <GridItem colSpan={{ base: 1, sm: 2 }}>
            <ResourceDetailField label={t("families")}>
              <VStack align="flex-start" gap={1}>
                {families.map(({ id, name }) => (
                  <RouterLink key={id} to={resourceDetailRoute("creature_family", id)}>
                    {name}
                  </RouterLink>
                ))}
              </VStack>
            </ResourceDetailField>
          </GridItem>
        </SimpleGrid>
      )}
    </ResourceDetail>
  );
}

//------------------------------------------------------------------------------
// I18n Context
//------------------------------------------------------------------------------

const i18nContext = {
  families: { en: "Families", it: "Famiglie" },
};
