import { useMemo } from "react";
import { useI18nLang } from "~/i18n/i18n-lang";
import { useLangs } from "~/models/lang";
import Select, { type SelectEnumProps } from "~/ui/select";

//------------------------------------------------------------------------------
// Language Select
//------------------------------------------------------------------------------

export type LanguageSelectProps = {
  w?: SelectEnumProps<string>["w"];
};

export default function LanguageSelect(props: LanguageSelectProps) {
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
    <Select.Enum
      onValueChange={setLanguage}
      options={languageOptions}
      positioning={{ slide: true }}
      size="xs"
      value={language}
      w="5em"
      {...props}
    />
  );
}
