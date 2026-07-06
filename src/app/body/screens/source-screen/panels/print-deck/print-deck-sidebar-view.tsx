import { HStack } from "@chakra-ui/react";
import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import Button from "~/ui/button";
import Section from "~/ui/section";
import { usePrintDeckMode } from "./print-deck";

//------------------------------------------------------------------------------
// Print Deck Sidebar View
//------------------------------------------------------------------------------

export default function PrintDeckSidebarView() {
  const { t } = useI18nLangContext(i18nContext);
  const [mode, setMode] = usePrintDeckMode();

  return (
    <Section title={t("heading")}>
      <HStack w="full">
        <Button
          bgColor={mode === "list" ? "bg.emphasized" : undefined}
          flex={1}
          onClick={() => setMode("list")}
          size="sm"
          variant="outline"
        >
          {t("mode.list")}
        </Button>
        <Button
          bgColor={mode === "preview" ? "bg.emphasized" : undefined}
          flex={1}
          onClick={() => setMode("preview")}
          size="sm"
          variant="outline"
        >
          {t("mode.preview")}
        </Button>
      </HStack>
    </Section>
  );
}

//------------------------------------------------------------------------------
// I18n Context
//------------------------------------------------------------------------------

const i18nContext = {
  "heading": {
    en: "View",
    it: "Vista",
  },
  "mode.list": {
    en: "List",
    it: "Lista",
  },
  "mode.preview": {
    en: "Preview",
    it: "Anteprima",
  },
};
