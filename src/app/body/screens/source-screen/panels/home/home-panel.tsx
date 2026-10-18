import { HStack, Heading, Separator, SimpleGrid, Span, Text, VStack } from "@chakra-ui/react";
import { ArrowRightIcon } from "lucide-react";
import { useMemo } from "react";
import { useNavigate } from "react-router";
import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import { useActiveSource } from "~/models/catalogue/catalogue";
import { printDeck } from "~/models/print-deck/print-deck-store";
import { armorStore } from "~/models/resources/equipment/armors/armor-store";
import { localizeArmor } from "~/models/resources/equipment/armors/localized-armor";
import { itemStore } from "~/models/resources/equipment/items/item-store";
import { localizeItem } from "~/models/resources/equipment/items/localized-item";
import { localizeWeapon } from "~/models/resources/equipment/weapons/localized-weapon";
import { weaponStore } from "~/models/resources/equipment/weapons/weapon-store";
import { localizedResourceUnionSchema } from "~/models/resources/resource-union";
import { useTranslateSourceVersion } from "~/models/types/source-version";
import { Route } from "~/navigation/routes";
import Button from "~/ui/button";
import Icon from "~/ui/icon";
import ZorboDnDWordmark from "~/ui/zorbo-dnd-wordmark";
import breastplate from "./data/breastplate";
import fireball from "./data/fireball";
import healingPotion from "./data/healing-potion";
import lightCrossbow from "./data/light-crossbow";
import owlbear from "./data/owlbear";
import HomeCardFan from "./home-card-fan";

const { useLocalizationContext: useArmorLocalizationContext } = armorStore;
const { useLocalizationContext: useItemLocalizationContext } = itemStore;
const { useLocalizationContext: useWeaponLocalizationContext } = weaponStore;

//------------------------------------------------------------------------------
// Sample Print Deck Cards
//------------------------------------------------------------------------------

const samplePrintDeckCards = [
  { palette_name: "copper", resource: "owlbear" },
  { palette_name: "brick", resource: "fireball" },
  { palette_name: "red", resource: "potion" },
  { palette_name: "slate", resource: "breastplate" },
  { palette_name: "brown", resource: "crossbow" },
] as const;

//------------------------------------------------------------------------------
// Home Panel
//------------------------------------------------------------------------------

export default function HomePanel() {
  const { lang, t, tpi } = useI18nLangContext(i18nContext);
  const navigate = useNavigate();
  const source = useActiveSource();
  const printDeckEntries = printDeck.useEntries();
  const translateSourceVersion = useTranslateSourceVersion(lang);
  const potionContext = useItemLocalizationContext(healingPotion);
  const armorContext = useArmorLocalizationContext(breastplate);
  const weaponContext = useWeaponLocalizationContext(lightCrossbow);
  const localizedPotion = useMemo(
    () => localizeItem(healingPotion, potionContext),
    [potionContext],
  );
  const localizedBreastplate = useMemo(
    () => localizeArmor(breastplate, armorContext),
    [armorContext],
  );
  const localizedCrossbow = useMemo(
    () => localizeWeapon(lightCrossbow, weaponContext),
    [weaponContext],
  );
  const sampleResources = {
    breastplate: localizedBreastplate,
    crossbow: localizedCrossbow,
    fireball: fireball[lang]!,
    owlbear: owlbear[lang]!,
    potion: localizedPotion,
  };

  return (
    <VStack align="stretch" flex={1} gap={0} h="full" overflowY="auto">
      <VStack align="stretch" gap={6} maxW="6xl" mx="auto" px={{ base: 5, md: 8 }} py={8} w="full">
        <VStack align="flex-start" gap={1}>
          <Heading fontSize={{ base: "3xl", md: "4xl" }} fontWeight="normal" lineHeight="shorter">
            <ZorboDnDWordmark />
          </Heading>
          <Text color="fg.muted" fontSize={{ base: "md", md: "lg" }}>
            {t("home.subtitle")}
          </Text>
        </VStack>

        <HStack
          align={{ base: "flex-start", sm: "center" }}
          borderBottomWidth={1}
          borderTopWidth={1}
          gap={4}
          justify="space-between"
          py={4}
          wrap="wrap"
        >
          <VStack align="flex-start" gap={0} minW={0}>
            <Text color="fg.muted" fontSize="sm">
              {t("home.active_source")}
            </Text>
            {source ? (
              <HStack align="baseline" flexWrap="wrap" gap={2}>
                <Text fontWeight="semibold" overflowWrap="anywhere">
                  {source.name[lang] || source.code}
                </Text>
                <Span color="fg.muted" fontSize="sm">
                  {source.code} · {translateSourceVersion(source.version)}
                </Span>
              </HStack>
            ) : (
              <Text fontWeight="medium">{t("home.no_active_source")}</Text>
            )}
          </VStack>
          <Button onClick={() => navigate(Route.Sources)} size="sm" variant="outline">
            {t("home.manage_sources")}
          </Button>
        </HStack>

        <SimpleGrid columns={{ base: 1, md: 2 }} gap={{ base: 8, md: 12 }}>
          <VStack align="stretch" gap={3}>
            <Heading fontSize="lg" fontWeight="semibold">
              {t("home.browse")}
            </Heading>
            <VStack align="stretch" gap={0}>
              <HomeDestination
                label={t("home.spells")}
                onClick={() => navigate(Route.ResourcesAbilitiesSpells)}
              />
              <Separator />
              <HomeDestination
                label={t("home.creatures")}
                onClick={() => navigate(Route.ResourcesBestiaryMonsters)}
              />
              <Separator />
              <HomeDestination
                label={t("home.equipment")}
                onClick={() => navigate(Route.ResourcesEquipmentItems)}
              />
              <Separator />
              <HomeDestination
                label={t("home.armors")}
                onClick={() => navigate(Route.ResourcesEquipmentArmors)}
              />
              <Separator />
              <HomeDestination
                label={t("home.weapons")}
                onClick={() => navigate(Route.ResourcesEquipmentWeapons)}
              />
            </VStack>
          </VStack>

          <VStack align="stretch" gap={3}>
            <Heading fontSize="lg" fontWeight="semibold">
              {t("home.print_deck")}
            </Heading>
            <Text color="fg.muted" fontSize="sm">
              {printDeckEntries.length
                ? tpi(
                    "home.print_deck_count",
                    printDeckEntries.length,
                    `${printDeckEntries.length}`,
                  )
                : t("home.print_deck_empty")}
            </Text>
            {printDeckEntries.length > 0 ? (
              <Button
                alignSelf="flex-start"
                onClick={() => navigate(Route.PrintDeck)}
                size="sm"
                variant="outline"
              >
                {t("home.open_print_deck")}
              </Button>
            ) : (
              <Button
                alignSelf="flex-start"
                onClick={() =>
                  printDeck.addEntries([
                    ...samplePrintDeckCards.map(({ palette_name, resource }) => ({
                      lang,
                      palette_name,
                      resource: localizedResourceUnionSchema.parse(sampleResources[resource]),
                    })),
                  ])
                }
                size="sm"
                variant="outline"
              >
                {t("home.add_sample_cards")}
              </Button>
            )}
          </VStack>
        </SimpleGrid>
      </VStack>
      <HomeCardFan
        breastplate={localizedBreastplate}
        crossbow={localizedCrossbow}
        fireball={fireball[lang]!}
        owlbear={owlbear[lang]!}
        potion={localizedPotion}
      />
    </VStack>
  );
}

//------------------------------------------------------------------------------
// Home Destination
//------------------------------------------------------------------------------

type HomeDestinationProps = {
  label: string;
  onClick: () => void;
};

function HomeDestination({ label, onClick }: HomeDestinationProps) {
  return (
    <Button
      _hover={{ bg: "bg.muted", color: "fg" }}
      color="fg"
      justifyContent="space-between"
      onClick={onClick}
      px={2}
      variant="ghost"
      w="full"
    >
      <Span>{label}</Span>
      <Icon Icon={ArrowRightIcon} size="xs" />
    </Button>
  );
}

//------------------------------------------------------------------------------
// Home Card Fan
//------------------------------------------------------------------------------

//------------------------------------------------------------------------------
// I18n Context
//------------------------------------------------------------------------------

const i18nContext = {
  "home.active_source": {
    en: "Active source",
    it: "Fonte attiva",
  },
  "home.add_sample_cards": {
    en: "Add sample cards",
    it: "Aggiungi carte di esempio",
  },
  "home.browse": {
    en: "Browse resources",
    it: "Sfoglia le risorse",
  },
  "home.armors": {
    en: "Armor",
    it: "Armature",
  },
  "home.creatures": {
    en: "Creatures",
    it: "Creature",
  },
  "home.equipment": {
    en: "Items",
    it: "Oggetti",
  },
  "home.manage_sources": {
    en: "Manage sources",
    it: "Gestisci fonti",
  },
  "home.no_active_source": {
    en: "No source selected",
    it: "Nessuna fonte selezionata",
  },
  "home.open_print_deck": {
    en: "Open print deck",
    it: "Apri il mazzo di stampa",
  },
  "home.print_deck": {
    en: "Print deck",
    it: "Mazzo di stampa",
  },
  "home.print_deck_count/*": {
    en: "<1> cards",
    it: "<1> carte",
  },
  "home.print_deck_count/1": {
    en: "1 card",
    it: "1 carta",
  },
  "home.print_deck_empty": {
    en: "No cards added",
    it: "Nessuna carta aggiunta",
  },
  "home.spells": {
    en: "Spells",
    it: "Incantesimi",
  },
  "home.subtitle": {
    en: "Find, create, and print your cards!",
    it: "Trova, crea e stampa le tue carte!",
  },
  "home.weapons": {
    en: "Weapons",
    it: "Armi",
  },
};
