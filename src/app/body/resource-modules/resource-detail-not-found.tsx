import { Button, Center, Text } from "@chakra-ui/react";
import { ArrowLeftIcon } from "lucide-react";
import { useNavigate } from "react-router";
import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import { translate, type I18nString } from "~/i18n/i18n-string";
import type { ResourceKind } from "~/models/types/resource-kind";
import PageTitle from "~/navigation/page-title";

//------------------------------------------------------------------------------
// Resource Detail Not Found
//------------------------------------------------------------------------------

export default function ResourceDetailNotFound({
  kind,
  message,
  to,
}: {
  kind?: ResourceKind;
  message?: string;
  to?: string;
}) {
  const { lang, t } = useI18nLangContext(i18nContext);
  const navigate = useNavigate();
  const resourceLabel = kind ? translate(resourcePluralLabels[kind], lang) : undefined;

  return (
    <>
      <PageTitle title={message ?? t("not_found")} />
      <Center flexDirection="column" gap={4} h="full" textAlign="center">
        <Text role="alert" fontSize="lg">
          {message ?? t("not_found")}
        </Text>
        {resourceLabel && to && (
          <Button onClick={() => navigate(to)} variant="outline">
            <ArrowLeftIcon style={{ height: 14, width: 14 }} />
            {resourceLabel}
          </Button>
        )}
      </Center>
    </>
  );
}

//------------------------------------------------------------------------------
// Resource Plural Labels
//------------------------------------------------------------------------------

const resourcePluralLabels: Record<ResourceKind, I18nString> = {
  armor: { en: "Armors", it: "Armature" },
  armor_modifier: { en: "Armor Variants", it: "Varianti armature" },
  background: { en: "Backgrounds", it: "Background" },
  character_class: { en: "Classes", it: "Classi" },
  character_subclass: { en: "Subclasses", it: "Sottoclassi" },
  creature: { en: "Creatures", it: "Creature" },
  creature_family: { en: "Creature Families", it: "Famiglie di creature" },
  creature_habitat: { en: "Creature Habitats", it: "Habitat" },
  creature_tag: { en: "Groups", it: "Gruppi" },
  creature_treasure: { en: "Treasures", it: "Tesori" },
  eldritch_invocation: { en: "Eldritch Invocations", it: "Suppliche Occulte" },
  feat: { en: "Feats", it: "Talenti" },
  feature: { en: "Features", it: "Privilegi" },
  item: { en: "Items", it: "Oggetti" },
  item_modifier: { en: "Item Variants", it: "Varianti oggetti" },
  language: { en: "Languages", it: "Lingue" },
  maneuver: { en: "Maneuvers", it: "Manovre" },
  metamagic: { en: "Metamagic", it: "Metamagia" },
  plane: { en: "Planes", it: "Piani" },
  service: { en: "Services", it: "Servizi" },
  species: { en: "Species", it: "Specie" },
  spell: { en: "Spells", it: "Incantesimi" },
  tool: { en: "Tools", it: "Strumenti" },
  tool_modifier: { en: "Tool Variants", it: "Varianti strumenti" },
  vehicle: { en: "Vehicles", it: "Veicoli" },
  weapon: { en: "Weapons", it: "Armi" },
  weapon_modifier: { en: "Weapon Variants", it: "Varianti armi" },
};

//------------------------------------------------------------------------------
// I18n Context
//------------------------------------------------------------------------------

const i18nContext = {
  not_found: {
    en: "This resource could not be found.",
    it: "Impossibile trovare questa risorsa.",
  },
};
