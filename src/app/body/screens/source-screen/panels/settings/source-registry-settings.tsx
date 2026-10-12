import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import CaptionInput from "~/ui/caption-input";
import Select from "~/ui/select";

//------------------------------------------------------------------------------
// Source Registry Settings Props
//------------------------------------------------------------------------------

type SourceRegistrySettingsProps = {
  disabled: boolean;
  onVisibilityChange: (visibility: "public" | "private") => void;
  visibility: "public" | "private";
};

//------------------------------------------------------------------------------
// Source Registry Settings
//------------------------------------------------------------------------------

export default function SourceRegistrySettings({
  disabled,
  onVisibilityChange,
  visibility,
}: SourceRegistrySettingsProps) {
  const { t } = useI18nLangContext(i18nContext);

  return (
    <CaptionInput caption={t("visibility")} w="full">
      <Select.Enum
        disabled={disabled}
        onValueChange={onVisibilityChange}
        options={[
          { label: t("private"), value: "private" },
          { label: t("public"), value: "public" },
        ]}
        size="sm"
        value={visibility}
        w="full"
      />
    </CaptionInput>
  );
}

//------------------------------------------------------------------------------
// I18n Context
//------------------------------------------------------------------------------

const i18nContext = {
  private: { en: "Private", it: "Privata" },
  public: { en: "Public", it: "Pubblica" },
  visibility: { en: "Visibility", it: "Visibilità" },
};
