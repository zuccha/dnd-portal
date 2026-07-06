import {
  Center,
  HStack,
  Heading,
  Span,
  VStack,
  chakra,
} from "@chakra-ui/react";
import { ArrowLeftIcon } from "lucide-react";
import { useCallback, useState } from "react";
import RawDiscordIcon from "~/assets/images/icons/discord.svg?react";
import { signInWithDiscord, signInWithPassword } from "~/auth/auth";
import useAuth from "~/auth/use-auth";
import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import Redirect from "~/navigation/redirect";
import { Route } from "~/navigation/routes";
import Button from "~/ui/button";
import Field from "~/ui/field";
import IconButton from "~/ui/icon-button";
import Input from "~/ui/input";
import Link from "~/ui/link";

//------------------------------------------------------------------------------
// Sign In Screen
//------------------------------------------------------------------------------

export default function SignInScreen() {
  const auth = useAuth();
  const { t } = useI18nLangContext(i18nContext);

  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const signIn = useCallback(async () => {
    if (loading) return;
    if (!email) return setErrorMessage("error.email.empty");
    if (!password) return setErrorMessage("error.password.empty");
    setLoading(true);
    const error = await signInWithPassword({ email, password });
    if (error) setErrorMessage("error.generic");
    setLoading(false);
  }, [email, loading, password]);

  if (auth.user) return <Redirect route={Route._} />;

  return (
    <Center bgColor="bg.subtle" minH="100vh" position="relative" w="full">
      <VStack align="flex-start" gap={4} maxW="20em" w="full">
        <Heading size="2xl">{t("title")}</Heading>

        <Field label={t("email")}>
          <Input
            onValueChange={setEmail}
            size="sm"
            type="email"
            value={email}
          />
        </Field>

        <Field label={t("password")}>
          <Input
            onValueChange={setPassword}
            size="sm"
            type="password"
            value={password}
          />
        </Field>

        {errorMessage && (
          <Span color="fg.error" fontSize="sm" w="full">
            {t(errorMessage)}
          </Span>
        )}

        <Span fontSize="sm" w="full">
          {`${t("not_registered")} `}
          <Link onClick={() => history.pushState({}, "", Route.SignUp)}>
            {t("signup")}
          </Link>
        </Span>

        <Button alignSelf="flex-end" onClick={signIn} size="sm">
          {t("signin")}
        </Button>

        <HStack fontSize="xs" w="full">
          <Span bgColor="border.emphasized" flex={1} h="1px" />
          <Span color="fg.muted">{t("or")}</Span>
          <Span bgColor="border.emphasized" flex={1} h="1px" />
        </HStack>

        <Button
          borderColor="bg.inverted"
          disabled={loading}
          onClick={signInWithDiscord}
          variant="outline"
          w="full"
        >
          <DiscordIcon />
          {t("discord")}
        </Button>
      </VStack>

      <IconButton
        Icon={ArrowLeftIcon}
        disabled={loading}
        label={t("back")}
        left={4}
        onClick={() => history.pushState({}, "", Route._)}
        position="absolute"
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
  "back": {
    en: "Back to home",
    it: "Torna alla home",
  },
  "discord": {
    en: "Use Discord",
    it: "Usa Discord",
  },
  "email": {
    en: "Email",
    it: "Email",
  },
  "error.email.empty": {
    en: "The email address cannot be empty",
    it: "L'indirizzo email non può essere vuoto",
  },
  "error.password.empty": {
    en: "The password cannot be empty",
    it: "La password non può essere vuota",
  },
  "not_registered": {
    en: "Don't have an account?",
    it: "Non hai un account?",
  },
  "or": {
    en: "OR",
    it: "OPPURE",
  },
  "password": {
    en: "Password",
    it: "Password",
  },
  "signin": {
    en: "Sign in",
    it: "Loggati",
  },
  "signup": {
    en: "Register",
    it: "Registrati",
  },
  "title": {
    en: "Sign In for D&D Portal",
    it: "Loggati su D&D Portal",
  },
};
