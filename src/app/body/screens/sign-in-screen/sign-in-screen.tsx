import { Center, Heading, VStack, chakra } from "@chakra-ui/react";
import RawDiscordIcon from "~/assets/images/icons/discord.svg?react";
import { signInWithDiscord } from "~/auth/auth";
import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import Button from "~/ui/button";

//------------------------------------------------------------------------------
// Sign In Screen
//------------------------------------------------------------------------------

export default function SignInScreen() {
  const { t } = useI18nLangContext(i18nContext);

  return (
    <Center w="full">
      <VStack align="flex-start" gap={10} maxW="20em" mt={20} w="full">
        <VStack align="flex-start" gap={0}>
          <Heading size="2xl">{t("title")}</Heading>
          <Heading color="fg.subtle" size="2xl">
            {t("subtitle")}
          </Heading>
        </VStack>
        <Button
          borderColor="bg.inverted"
          onClick={signInWithDiscord}
          variant="outline"
          w="full"
        >
          <DiscordIcon />
          {t("button.discord")}
        </Button>
      </VStack>
    </Center>
  );
}

//------------------------------------------------------------------------------
// Discord Icon
//------------------------------------------------------------------------------

const DiscordIcon = chakra(RawDiscordIcon);

//------------------------------------------------------------------------------
// I18n Context
//------------------------------------------------------------------------------

const i18nContext = {
  "title": {
    en: "Welcome to D&D Portal.",
    it: "Benvenutə su D&D Portal.",
  },

  "subtitle": {
    en: "Please, sign in to use the app.",
    it: "Loggati per usare l'app.",
  },

  "button.discord": {
    en: "Continue with Discord",
    it: "Continua con Discord",
  },
};
