import { GridItem, SimpleGrid, Text, VStack } from "@chakra-ui/react";
import { useMemo } from "react";
import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import { useActiveSourceRelatedResourceEntries } from "~/models/catalogue/resource-relation-hooks";
import { characterClassStore } from "~/models/resources/character-classes/character-class-store";
import { characterSubclassStore } from "~/models/resources/character-subclasses/character-subclass-store";
import { equipmentReferenceStore } from "~/models/resources/equipment/equipment-reference-store";
import { featStore } from "~/models/resources/feats/feat-store";
import { featureStore } from "~/models/resources/features/feature-store";
import { speciesStore } from "~/models/resources/species/species-store";
import { resourceDetailRoute } from "~/navigation/routes";
import RouterLink from "~/ui/router-link";
import ResourceDetailContent from "../../resource-detail-content";
import ResourceDetailField from "../../resource-detail-field";

type FeatureDetailResource = ReturnType<typeof featureStore.useLocalizedResource>;
const useLocalizedClassNames = characterClassStore.useLocalizedResourceNames;
const useLocalizedSubclassNames = characterSubclassStore.useLocalizedResourceNames;
const useLocalizedFeatNames = featStore.useLocalizedResourceNames;
const useLocalizedSpeciesNames = speciesStore.useLocalizedResourceNames;
const useLocalizedEquipmentNames = equipmentReferenceStore.useLocalizedEquipmentNames;

//------------------------------------------------------------------------------
// Feature Detail
//------------------------------------------------------------------------------

export default function FeatureDetail({ resource }: { resource: FeatureDetailResource }) {
  const { lang, t } = useI18nLangContext(i18nContext);
  const feature = resource;
  const endpoint = feature ?? defaultFeatureEndpoint;
  const classEntries = useActiveSourceRelatedResourceEntries(
    "character_classes_and_features",
    endpoint,
  );
  const subclassEntries = useActiveSourceRelatedResourceEntries(
    "character_subclasses_and_features",
    endpoint,
  );
  const equipmentEntries = useActiveSourceRelatedResourceEntries(
    "equipments_and_features",
    endpoint,
  );
  const featEntries = useActiveSourceRelatedResourceEntries("feats_and_features", endpoint);
  const speciesEntries = useActiveSourceRelatedResourceEntries("species_and_features", endpoint);
  const classIds = useMemo(() => classEntries.map(({ id }) => id), [classEntries]);
  const subclassIds = useMemo(() => subclassEntries.map(({ id }) => id), [subclassEntries]);
  const featIds = useMemo(() => featEntries.map(({ id }) => id), [featEntries]);
  const speciesIds = useMemo(() => speciesEntries.map(({ id }) => id), [speciesEntries]);
  const classNames = useLocalizedClassNames(classIds);
  const subclassNames = useLocalizedSubclassNames(subclassIds);
  const featNames = useLocalizedFeatNames(featIds);
  const speciesNames = useLocalizedSpeciesNames(speciesIds);
  const equipmentNames = useLocalizedEquipmentNames(lang);
  const grantorGroups = [
    {
      label: t("character_classes"),
      values: classEntries.flatMap((entry, index) => {
        const name = classNames[index];
        return name ? [{ ...entry, name }] : [];
      }),
    },
    {
      label: t("character_subclasses"),
      values: subclassEntries.flatMap((entry, index) => {
        const name = subclassNames[index];
        return name ? [{ ...entry, name }] : [];
      }),
    },
    {
      label: t("equipment"),
      values: equipmentEntries.flatMap((entry) => {
        const name = equipmentNames[entry.id];
        return name ? [{ ...entry, name }] : [];
      }),
    },
    {
      label: t("feats"),
      values: featEntries.flatMap((entry, index) => {
        const name = featNames[index];
        return name ? [{ ...entry, name }] : [];
      }),
    },
    {
      label: t("species"),
      values: speciesEntries.flatMap((entry, index) => {
        const name = speciesNames[index];
        return name ? [{ ...entry, name }] : [];
      }),
    },
  ].filter(({ values }) => values.length > 0);

  return (
    <ResourceDetailContent
      detailsContent={
        feature &&
        ((feature.display_name && feature.display_name !== feature.name) ||
          grantorGroups.length > 0) && (
          <SimpleGrid columns={{ base: 1, sm: 2 }} columnGap={6} rowGap={2}>
            {feature.display_name && feature.display_name !== feature.name && (
              <ResourceDetailField label={t("display_name")}>
                {feature.display_name}
              </ResourceDetailField>
            )}
            {grantorGroups.length > 0 && (
              <GridItem colSpan={{ base: 1, sm: 2 }}>
                <ResourceDetailField label={t("granted_by")}>
                  <VStack align="stretch" gap={2}>
                    {grantorGroups.map(({ label, values }) => (
                      <VStack align="stretch" gap={0} key={label}>
                        <Text fontSize="sm" fontWeight="medium">
                          {label}
                        </Text>
                        <VStack align="flex-start" gap={1}>
                          {values.map(({ id, kind, name, min_level }) => (
                            <Text as="span" key={`${kind}:${id}:${min_level ?? 0}`}>
                              <RouterLink to={resourceDetailRoute(kind, id)}>{name}</RouterLink>
                              {min_level ? ` (${t("level")} ${min_level})` : ""}
                            </Text>
                          ))}
                        </VStack>
                      </VStack>
                    ))}
                  </VStack>
                </ResourceDetailField>
              </GridItem>
            )}
          </SimpleGrid>
        )
      }
      resource={feature}
    />
  );
}

//------------------------------------------------------------------------------
// I18n Context
//------------------------------------------------------------------------------

const i18nContext = {
  character_classes: {
    en: "Classes",
    it: "Classi",
  },
  character_subclasses: {
    en: "Subclasses",
    it: "Sottoclassi",
  },
  display_name: {
    en: "Display Name",
    it: "Nome Visualizzato",
  },
  equipment: {
    en: "Equipment",
    it: "Equipaggiamento",
  },
  feats: {
    en: "Feats",
    it: "Talenti",
  },
  granted_by: {
    en: "Granted By",
    it: "Concesso da",
  },
  level: { en: "Level", it: "Livello" },
  species: {
    en: "Species",
    it: "Specie",
  },
};

const defaultFeatureEndpoint = { id: "", kind: "feature" } as const;
