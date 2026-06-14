import {
  Box,
  Circle,
  HStack,
  Heading,
  SimpleGrid,
  Span,
  Text,
  VStack,
} from "@chakra-ui/react";
import {
  BookOpenIcon,
  PrinterIcon,
  ScrollTextIcon,
  SearchIcon,
} from "lucide-react";
import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import DragonIcon from "~/icons/dragon-icon";
import { Route } from "~/navigation/routes";
import Button from "~/ui/button";
import Icon from "~/ui/icon";
import { palettes } from "~/utils/palette";
import { CreatureCard } from "../resources/creatures/creature-card";
import { SpellCard } from "../resources/spells/spell-card";
import fireball from "./data/fireball";
import owlbear from "./data/owlbear";

//------------------------------------------------------------------------------
// Home Panel
//------------------------------------------------------------------------------

export default function HomePanel() {
  const { lang, t } = useI18nLangContext(i18nContext);

  return (
    <VStack
      flex={1}
      gap={8}
      h="full"
      overflow="auto"
      px={{ base: 5, md: 10 }}
      py={{ base: 6, md: 10 }}
    >
      <HStack
        align="center"
        gap={{ base: 8, lg: 12 }}
        justify="center"
        maxW="7xl"
        w="full"
        wrap="wrap"
      >
        <VStack align="flex-start" flex={1} gap={5} minW="20em">
          <VStack align="flex-start" gap={3}>
            <Heading
              fontSize={{ base: "2xl", md: "4xl" }}
              fontWeight="semibold"
              lineHeight={1.1}
            >
              {t("home.title")}
            </Heading>
            <Text color="fg.muted" fontSize={{ base: "md", md: "lg" }}>
              {t("home.subtitle")}
            </Text>
          </VStack>

          <HStack flexWrap="wrap" gap={3}>
            <Button
              onClick={() =>
                history.pushState({}, "", Route.ResourcesAbilitiesSpells)
              }
            >
              <Icon Icon={ScrollTextIcon} size="sm" />
              {t("home.action.spells")}
            </Button>
            <Button
              onClick={() =>
                history.pushState({}, "", Route.ResourcesBestiaryMonsters)
              }
              variant="outline"
            >
              <Icon Icon={DragonIcon} size="sm" />
              {t("home.action.creatures")}
            </Button>
          </HStack>
        </VStack>

        <HStack
          bg="bg.subtle"
          borderColor="border"
          borderRadius="lg"
          borderWidth={1}
          justify="center"
          maxW={`${CreatureCard.w + SpellCard.w + 0.75}in`}
          minW={`${Math.max(CreatureCard.w, SpellCard.w)}in`}
          overflow="hidden"
          p={6}
          w="full"
        >
          <Box
            h={`${Math.max(CreatureCard.h, SpellCard.h)}in`}
            position="relative"
            w="full"
          >
            <SpellCard
              left={0}
              localizedResource={fireball[lang]!}
              palette={palettes.brick}
              position="absolute"
              selectedPageIndex={0}
              showImage
            />

            <CreatureCard
              localizedResource={owlbear[lang]!}
              palette={palettes.copper}
              position="absolute"
              right={0}
              selectedPageIndex={0}
              showImage
            />
          </Box>
        </HStack>
      </HStack>

      <SimpleGrid
        columns={{ base: 1, lg: 3, md: 2 }}
        gap={4}
        maxW="7xl"
        mx="auto"
        w="full"
      >
        <HomeStep
          Icon={BookOpenIcon}
          index="01"
          text={t("home.step.browse.text")}
          title={t("home.step.browse.title")}
        />
        <HomeStep
          Icon={SearchIcon}
          index="02"
          text={t("home.step.filter.text")}
          title={t("home.step.filter.title")}
        />
        <HomeStep
          Icon={PrinterIcon}
          index="03"
          text={t("home.step.print.text")}
          title={t("home.step.print.title")}
        />
      </SimpleGrid>
    </VStack>
  );
}

//------------------------------------------------------------------------------
// Home Step
//------------------------------------------------------------------------------

type HomeStepProps = {
  Icon: typeof BookOpenIcon;
  index: string;
  text: string;
  title: string;
};

function HomeStep({ Icon: StepIcon, index, text, title }: HomeStepProps) {
  return (
    <HStack
      align="flex-start"
      borderColor="border"
      borderRadius="md"
      borderWidth={1}
      gap={4}
      p={4}
    >
      <Circle bg="bg.muted" color="fg.muted" flexShrink={0} size={9}>
        <Icon Icon={StepIcon} size="sm" />
      </Circle>

      <VStack align="flex-start" gap={1}>
        <HStack gap={2}>
          <Span color="fg.subtle" fontSize="xs" fontWeight="semibold">
            {index}
          </Span>
          <Heading fontSize="sm" fontWeight="semibold">
            {title}
          </Heading>
        </HStack>
        <Text color="fg.muted" fontSize="sm">
          {text}
        </Text>
      </VStack>
    </HStack>
  );
}

//------------------------------------------------------------------------------
// I18n Context
//------------------------------------------------------------------------------

const i18nContext = {
  "home.action.creatures": {
    en: "Creatures",
    it: "Creature",
  },
  "home.action.spells": {
    en: "Spells",
    it: "Incantesimi",
  },
  "home.preview.card.creature": {
    en: "Printable creature card",
    it: "Carta creatura stampabile",
  },
  "home.preview.card.spell": {
    en: "Printable spell card",
    it: "Carta incantesimo stampabile",
  },
  "home.preview.creature": {
    en: "Owlbear",
    it: "Orsogufo",
  },
  "home.preview.spell": {
    en: "Fireball",
    it: "Palla di Fuoco",
  },
  "home.step.browse.text": {
    en: "Pick a resource group from the sidebar, then switch between table and card view depending on what you need.",
    it: "Scegli un gruppo di risorse dal menu laterale, poi passa tra vista tabella e vista carte in base a ciò che ti serve.",
  },
  "home.step.browse.title": {
    en: "Browse the catalog",
    it: "Sfoglia il catalogo",
  },
  "home.step.filter.text": {
    en: "Use filters to narrow your search down to the exact spells, creatures, equipment, or character options you want.",
    it: "Usa i filtri per restringere la ricerca agli incantesimi, creature, equipaggiamento o opzioni personaggio che ti servono.",
  },
  "home.step.filter.title": {
    en: "Find what matters",
    it: "Trova ciò che serve",
  },
  "home.step.print.text": {
    en: "Select resources that you want, open print mode, and export a sheet of cards for your table.",
    it: "Seleziona le risorse che desideri, apri la modalità stampa ed esporta un foglio di carte per il tavolo.",
  },
  "home.step.print.title": {
    en: "Print your cards",
    it: "Stampa le carte",
  },
  "home.subtitle": {
    en: "Browse sourcebook resources, collect the cards you need, and print them for quick reference during play.",
    it: "Sfoglia le risorse dei manuali, raccogli le carte che ti servono e stampale per consultarle rapidamente durante il gioco.",
  },
  "home.title": {
    en: "Welcome to D&D Portal",
    it: "Benvenutə su D&D Portal",
  },
};
