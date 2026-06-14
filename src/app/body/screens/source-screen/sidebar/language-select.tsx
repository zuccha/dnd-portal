import { useMemo } from "react";
import { useI18nLang } from "~/i18n/i18n-lang";
import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import { useLangs } from "~/models/lang";
import CaptionInput from "~/ui/caption-input";
import Select from "~/ui/select";

//------------------------------------------------------------------------------
// Language Select
//------------------------------------------------------------------------------

export default function LanguageSelect() {
  const { t } = useI18nLangContext(i18nContext);
  const [language, setLanguage] = useI18nLang();

  const languages = useLangs();
  const languageOptions = useMemo(
    () =>
      languages.data?.map(({ code, label }) => ({
        label: label,
        value: code,
      })) ?? [{ label: "English", value: "en" }],
    [languages.data],
  );

  return (
    <CaptionInput caption={t("language")} flex={1}>
      <Select.Enum
        onValueChange={setLanguage}
        options={languageOptions}
        positioning={{ slide: true }}
        size="sm"
        value={language}
      />
    </CaptionInput>
  );
}

//------------------------------------------------------------------------------
// I18n Context
//------------------------------------------------------------------------------

const i18nContext = {
  language: {
    en: "Language",
    it: "Lingua",
  },
};
