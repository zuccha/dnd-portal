import { Heading, Link, Separator, Text, VStack } from "@chakra-ui/react";
import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import RichText, { type RichTextPattern } from "~/ui/rich-text";
import type { ReactNode } from "react";

//------------------------------------------------------------------------------
// About Panel
//------------------------------------------------------------------------------

export default function AboutPanel() {
  const { t } = useI18nLangContext(i18nContext);

  return (
    <VStack
      align="stretch"
      flex={1}
      gap={6}
      h="full"
      overflow="auto"
      px={{ base: 5, md: 10 }}
      py={{ base: 6, md: 10 }}
    >
      <VStack align="stretch" gap={3} maxW="4xl" mx="auto" w="full">
        <Heading fontSize={{ base: "2xl", md: "4xl" }} fontWeight="semibold" lineHeight={1.1}>
          {t("about.title")}
        </Heading>
        <Text color="fg.muted" fontSize={{ base: "md", md: "lg" }}>
          {t("about.subtitle")}
        </Text>
      </VStack>

      <VStack align="stretch" gap={6} maxW="4xl" mx="auto" w="full">
        <VStack align="stretch" as="section" gap={2}>
          <Heading as="h2" fontSize="xl" fontWeight="semibold">
            {t("about.origin")}
          </Heading>
          <Text>{t("about.origin_description")}</Text>
          <Text>{t("about.independence")}</Text>
        </VStack>

        <Separator />

        <VStack align="stretch" as="section" gap={2}>
          <Heading as="h2" fontSize="xl" fontWeight="semibold">
            {t("about.content_and_software")}
          </Heading>
          <Text>{t("about.content_sources")}</Text>
          <RichText patterns={[externalLinkPattern]} text={t("about.srd_attribution")} />
          <Text>{t("about.software_and_fonts")}</Text>
          <Text>{t("about.third_party_rights")}</Text>
        </VStack>

        <Separator />

        <VStack align="stretch" as="section" gap={2}>
          <Heading as="h2" fontSize="xl" fontWeight="semibold">
            {t("about.data_and_privacy")}
          </Heading>
          <Text>{t("about.local_storage")}</Text>
          <Text>{t("about.registration")}</Text>
          <Text>{t("about.tracking")}</Text>
        </VStack>
      </VStack>
    </VStack>
  );
}

//------------------------------------------------------------------------------
// I18n Context
//------------------------------------------------------------------------------

const i18nContext = {
  "about.content_and_software": {
    en: "Content and software",
    it: "Contenuti e software",
  },
  "about.content_sources": {
    en: "The catalogue includes content from Wizards of the Coast's System Reference Document (SRD). Other sources may have their own origins and terms of use.",
    it: "Il catalogo include contenuti tratti dallo System Reference Document (SRD) di Wizards of the Coast. Ogni altra fonte può avere una provenienza e condizioni d'uso proprie.",
  },
  "about.data_and_privacy": {
    en: "Data and privacy",
    it: "Dati e privacy",
  },
  "about.independence": {
    en: "ZorboDnD is an independent project, not an official product, and is not affiliated with or endorsed by the owners of Dungeons & Dragons.",
    it: "ZorboDnD è un progetto indipendente, non un prodotto ufficiale e non è affiliato né approvato dai titolari di Dungeons & Dragons.",
  },
  "about.local_storage": {
    en: "Installed sources and the print deck are stored locally in the browser using IndexedDB. Interface settings and preferences are stored in localStorage. These data stay in the browser and do not require an account.",
    it: "Le fonti installate e il mazzo di stampa sono conservati localmente nel browser tramite IndexedDB. Le impostazioni e le preferenze dell'interfaccia sono conservate in localStorage. Questi dati restano nel browser e non richiedono un account.",
  },
  "about.origin": {
    en: "Origin",
    it: "Origine",
  },
  "about.origin_description": {
    en: "The project was created by zuccha to meet a personal need: printing D&D cards with a polished layout, including custom cards and languages other than English. Over time, it evolved into a tool for searching, organizing, and managing information for a campaign.",
    it: "Il progetto è stato creato da zuccha per un'esigenza personale: stampare carte per D&D con un'impaginazione curata, anche personalizzate e in lingue diverse dall'inglese. Nel tempo si è evoluto in uno strumento per cercare, organizzare e gestire le informazioni utili a una campagna.",
  },
  "about.registration": {
    en: "Registration is optional. An account is intended for access to source-publishing features, which are not currently available to the public. When signing up with email, the email address and password are sent to Supabase Auth to create and authenticate the account; with Discord, authentication also involves Discord. Supabase stores account data in its authentication system.",
    it: "Registrarsi è facoltativo. L'account è pensato per accedere alle funzioni di pubblicazione delle fonti, che al momento non sono disponibili al pubblico. Con la registrazione via email, l'indirizzo email e la password vengono inviati a Supabase Auth per creare e autenticare l'account; con Discord, l'autenticazione passa anche da Discord. Supabase conserva i dati dell'account nel proprio sistema di autenticazione.",
  },
  "about.software_and_fonts": {
    en: "The application is built with open-source software libraries, including React, TypeScript, Chakra UI, Dexie, and Supabase JS. Bundled fonts have different licenses: Lato, Fira Mono, and Mitr use the SIL Open Font License; Bookinsanity and Mr Eaves Small Caps Remake use Creative Commons BY-SA 4.0; Title Wave is freeware.",
    it: "L'applicazione è realizzata con librerie software open source, tra cui React, TypeScript, Chakra UI, Dexie e Supabase JS. I font inclusi hanno licenze diverse: Lato, Fira Mono e Mitr sono distribuiti con SIL Open Font License; Bookinsanity e Mr Eaves Small Caps Remake con Creative Commons BY-SA 4.0; Title Wave è freeware.",
  },
  "about.srd_attribution": {
    en: 'This work includes material from the System Reference Document 5.2.1 ("SRD 5.2.1") by Wizards of the Coast LLC, available at [[https://www.dndbeyond.com/srd]]. The SRD 5.2.1 is licensed under the Creative Commons Attribution 4.0 International License, available at [[https://creativecommons.org/licenses/by/4.0/legalcode]].',
    it: "Quest'opera include materiale tratto dallo System Reference Document 5.2.1 (\"SRD 5.2.1\") di Wizards of the Coast LLC, disponibile all'indirizzo [[https://www.dndbeyond.com/srd]]. Lo SRD 5.2.1 è concesso in licenza ai sensi della licenza di attribuzione 4.0 Internazionale di Creative Commons, disponibile all'indirizzo [[https://creativecommons.org/licenses/by/4.0/legalcode]].",
  },
  "about.subtitle": {
    en: "ZorboDnD helps you find, create, and print D&D cards, and manage information for a campaign.",
    it: "ZorboDnD aiuta a trovare, creare e stampare carte per D&D, e a gestire le informazioni di una campagna.",
  },
  "about.third_party_rights": {
    en: "Third-party names and trademarks remain the property of their respective owners. The SRD license does not automatically apply to other material in the app.",
    it: "I nomi e i marchi di terzi restano dei rispettivi titolari. La licenza della SRD non si estende automaticamente agli altri materiali presenti nell'app.",
  },
  "about.title": {
    en: "About",
    it: "Informazioni",
  },
  "about.tracking": {
    en: "ZorboDnD does not use analytics, advertising, profiling, or in-app activity tracking. Online features send their respective services only the requests needed to operate.",
    it: "ZorboDnD non usa strumenti di analytics, pubblicità, profilazione o tracciamento dell'attività nell'app. Le funzioni online inviano ai rispettivi servizi solo le richieste necessarie al loro funzionamento.",
  },
};

//------------------------------------------------------------------------------
// External Link Pattern
//------------------------------------------------------------------------------

const externalLinkPattern: RichTextPattern = {
  regex: /\[\[(https?:\/\/[^\]]+)\]\]/,
  render: (value: ReactNode) => {
    if (typeof value !== "string") return value;

    return (
      <Link href={value} rel="noreferrer" target="_blank">
        {value}
      </Link>
    );
  },
};
