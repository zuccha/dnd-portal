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
import { signInWithDiscord, signUpWithPassword } from "~/auth/auth";
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
  // const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const signUp = useCallback(async () => {
    if (loading) return;
    // if (!username) return setErrorMessage("error.username.empty");
    if (!email) return setErrorMessage("error.email.empty");
    if (!password) return setErrorMessage("error.password.empty");
    if (password !== passwordConfirmation)
      return setErrorMessage("error.password.mismatch");
    setLoading(true);
    const error = await signUpWithPassword({ email, password });
    if (error) setErrorMessage("error.generic");
    setLoading(false);
  }, [email, loading, password, passwordConfirmation]);

  if (auth.user) return <Redirect route={Route._} />;

  return (
    <Center bgColor="bg.subtle" minH="100vh" position="relative" w="full">
      <VStack align="flex-start" gap={4} maxW="20em" mt={20} w="full">
        <Heading size="2xl">{t("title")}</Heading>

        {/* <Field label={t("username")}>
          <Input onValueChange={setUsername} size="sm" value={username} />
        </Field> */}

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

        <Field label={t("password_confirmation")}>
          <Input
            onValueChange={setPasswordConfirmation}
            size="sm"
            type="password"
            value={passwordConfirmation}
          />
        </Field>

        {errorMessage && (
          <Span color="fg.error" fontSize="sm" w="full">
            {t(errorMessage)}
          </Span>
        )}

        <Span fontSize="sm" w="full">
          {`${t("already_registered")} `}
          <Link onClick={() => history.pushState({}, "", Route.SignIn)}>
            {t("signin")}
          </Link>
        </Span>

        <Button alignSelf="flex-end" onClick={signUp} size="sm">
          {t("signup")}
        </Button>

        <HStack fontSize="xs" w="full">
          <Span bgColor="border.emphasized" flex={1} h="1px" />
          <Span color="fg.muted">{t("or")}</Span>
          <Span bgColor="border.emphasized" flex={1} h="1px" />
        </HStack>

        <Button
          borderColor="bg.inverted"
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
  "already_registered": {
    en: "Already have an account?",
    it: "Hai già un account?",
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
  "error.generic": {
    en: "Something went wrong",
    it: "Qualcosa è andato storto",
  },
  "error.password.empty": {
    en: "The password cannot be empty",
    it: "La password non può essere vuota",
  },
  "error.password.mismatch": {
    en: "Password and password confirmation must be the same",
    it: "Password e conferma password devono essere uguali",
  },
  "error.username.empty": {
    en: "The username cannot be empty",
    it: "Il nome utente non può essere vuoto",
  },
  "or": {
    en: "OR",
    it: "OPPURE",
  },
  "password": {
    en: "Password",
    it: "Password",
  },
  "password_confirmation": {
    en: "Confirm Password",
    it: "Conferma Password",
  },
  "signin": {
    en: "Sign in",
    it: "Loggati",
  },
  "signup": {
    en: "Register",
    it: "Registrati",
  },
  "subtitle": {
    en: "Fill the form to register.",
    it: "Compila il modulo per registrarti.",
  },
  "title": {
    en: "Register for D&D Portal",
    it: "Registrati su D&D Portal",
  },
  "username": {
    en: "Username",
    it: "Nome Utente",
  },
};
