import { VStack } from "@chakra-ui/react";
import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import SectionHeading from "~/ui/section-heading";
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
    <VStack align="flex-start" gap={3} w="full">
      <SectionHeading>{t("registry")}</SectionHeading>
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
    </VStack>
  );
}

//------------------------------------------------------------------------------
// I18n Context
//------------------------------------------------------------------------------

const i18nContext = {
  private: { en: "Private", it: "Privata" },
  public: { en: "Public", it: "Pubblica" },
  registry: { en: "Registry", it: "Registro" },
};
