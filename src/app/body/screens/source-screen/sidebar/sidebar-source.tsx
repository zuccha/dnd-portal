import { Separator, VStack } from "@chakra-ui/react";
import { SettingsIcon } from "lucide-react";
import { useMemo } from "react";
import SectionButton from "~/app/body/screens/source-screen/sidebar/section-button";
import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import { useCanEditSourceResources } from "~/models/sources";
import { useRoute } from "~/navigation/navigation";
import { Route } from "~/navigation/routes";
import { resourcePanels } from "../panels/panels";
import SidebarSection from "./sidebar-section";

//------------------------------------------------------------------------------
// Sidebar Source
//------------------------------------------------------------------------------

export type SidebarSourceProps = {
  sourceId: string;
};

export default function SidebarSource({ sourceId }: SidebarSourceProps) {
  const { t } = useI18nLangContext(i18nContext);
  const route = useRoute();
  const canEdit = useCanEditSourceResources(sourceId);

  const localizedResourcePanels = useMemo(
    () =>
      resourcePanels.map(({ id, items }) => ({
        id,
        items: items.map(({ modifier, route: value }) => ({
          label: t(value),
          modifier,
          onClick: () => history.pushState({}, "", value),
          selected: route === value,
          value,
        })),
      })),
    [route, t],
  );

  return (
    <VStack
      align="flex-start"
      borderTopWidth={1}
      flex={1}
      gap={5}
      pt={2}
      separator={<Separator w="full" />}
      w="full"
    >
      <VStack flex={1} separator={<Separator w="full" />} w="full">
        {localizedResourcePanels.map(({ id, items }) => (
          <SidebarSection id={id} items={items} key={id} title={t(id)} />
        ))}
      </VStack>

      {canEdit && (
        <VStack justifyContent="flex-end" px={2} w="full">
          <SectionButton
            Icon={SettingsIcon}
            active={route === Route.SettingsCampaign}
            label={t(Route.SettingsCampaign)}
            onClick={() => history.pushState({}, "", Route.SettingsCampaign)}
          />
        </VStack>
      )}
    </VStack>
  );
}

//------------------------------------------------------------------------------
// I18n Context
//------------------------------------------------------------------------------

const i18nContext = {
  [Route.ResourcesAbilities]: {
    en: "Abilities",
    it: "Abilità",
  },
  [Route.ResourcesAbilitiesEldritchInvocations]: {
    en: "Eldritch Invocations",
    it: "Suppliche Occulte",
  },
  [Route.ResourcesAbilitiesManeuvers]: {
    en: "Maneuvers",
    it: "Manovre",
  },
  [Route.ResourcesAbilitiesMetamagic]: {
    en: "Metamagic",
    it: "Metamagia",
  },
  [Route.ResourcesAbilitiesSpells]: {
    en: "Spells",
    it: "Incantesimi",
  },
  [Route.ResourcesBestiary]: {
    en: "Bestiary",
    it: "Bestiario",
  },
  [Route.ResourcesBestiaryMonsters]: {
    en: "Creatures",
    it: "Creature",
  },
  [Route.ResourcesBestiaryTags]: {
    en: "Groups",
    it: "Gruppi",
  },
  [Route.ResourcesBlocks]: {
    en: "Blocks",
    it: "Blocchi",
  },
  [Route.ResourcesBlocksFeatures]: {
    en: "Features",
    it: "Privilegi",
  },
  [Route.ResourcesCharacter]: {
    en: "Character",
    it: "Personaggio",
  },
  [Route.ResourcesCharacterBackgrounds]: {
    en: "Backgrounds",
    it: "Background",
  },
  [Route.ResourcesCharacterClasses]: {
    en: "Classes",
    it: "Classi",
  },
  [Route.ResourcesCharacterFeats]: {
    en: "Feats",
    it: "Talenti",
  },
  [Route.ResourcesCharacterSpecies]: {
    en: "Species",
    it: "Specie",
  },
  [Route.ResourcesCharacterSubclasses]: {
    en: "Subclasses",
    it: "Sottoclassi",
  },
  [Route.ResourcesEquipment]: {
    en: "Equipment",
    it: "Equipaggiamento",
  },
  [Route.ResourcesEquipmentArmors]: {
    en: "Armors",
    it: "Armature",
  },
  [Route.ResourcesEquipmentArmorModifiers]: {
    en: "Variants",
    it: "Varianti",
  },
  [Route.ResourcesEquipmentItems]: {
    en: "Adventuring Gear",
    it: "Attrezzatura",
  },
  [Route.ResourcesEquipmentItemModifiers]: {
    en: "Variants",
    it: "Varianti",
  },
  [Route.ResourcesEquipmentTools]: {
    en: "Tools",
    it: "Strumenti",
  },
  [Route.ResourcesEquipmentToolModifiers]: {
    en: "Variants",
    it: "Varianti",
  },
  [Route.ResourcesEquipmentWeapons]: {
    en: "Weapons",
    it: "Armi",
  },
  [Route.ResourcesEquipmentWeaponModifiers]: {
    en: "Variants",
    it: "Varianti",
  },
  [Route.ResourcesMarket]: {
    en: "Market",
    it: "Mercato",
  },
  [Route.ResourcesMarketServices]: {
    en: "Services",
    it: "Servizi",
  },
  [Route.ResourcesMarketVehicles]: {
    en: "Vehicles",
    it: "Veicoli",
  },
  [Route.ResourcesWorld]: {
    en: "World",
    it: "Mondo",
  },
  [Route.ResourcesWorldLanguages]: {
    en: "Languages",
    it: "Lingue",
  },
  [Route.ResourcesWorldPlanes]: {
    en: "Planes",
    it: "Piani",
  },
  [Route.Settings]: {
    en: "Settings",
    it: "Impostazioni",
  },
  [Route.SettingsCampaign]: {
    en: "Settings",
    it: "Impostazioni",
  },
};
