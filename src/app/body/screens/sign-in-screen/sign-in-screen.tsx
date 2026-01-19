import { Center, Heading, VStack, chakra } from "@chakra-ui/react";
import { ArrowLeftIcon } from "lucide-react";
import RawDiscordIcon from "~/assets/images/icons/discord.svg?react";
import { signInWithDiscord } from "~/auth/auth";
import useAuth from "~/auth/use-auth";
import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import Redirect from "~/navigation/redirect";
import { Route } from "~/navigation/routes";
import Button from "~/ui/button";
import IconButton from "~/ui/icon-button";

//------------------------------------------------------------------------------
// Sign In Screen
//------------------------------------------------------------------------------

export default function SignInScreen() {
  const auth = useAuth();
  const { t } = useI18nLangContext(i18nContext);

  if (auth.user) return <Redirect route={Route._} />;

  return (
    <Center position="relative" w="full">
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

      <IconButton
        Icon={ArrowLeftIcon}
        left={4}
        onClick={() => history.pushState({}, "", Route._)}
        position="absolute"
        // size="sm"
        top={4}
      />
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
