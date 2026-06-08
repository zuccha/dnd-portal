import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import {
  type SourceVersion,
  useSourceVersionOptions,
} from "~/models/types/source-version";
import CaptionInput from "~/ui/caption-input";
import Select from "~/ui/select";

//------------------------------------------------------------------------------
// Sidebar Source Versions Selector
//------------------------------------------------------------------------------

export type SidebarSourceVersionsSelectorProps = {
  onSourceVersionsChange: (versions: SourceVersion[]) => void;
  sourceVersions: SourceVersion[];
};

export default function SidebarSourceVersionsSelector({
  onSourceVersionsChange,
  sourceVersions,
}: SidebarSourceVersionsSelectorProps) {
  const { t } = useI18nLangContext(i18nContext);
  const options = useSourceVersionOptions();

  return (
    <CaptionInput caption={t("versions")} w="4em">
      <Select.Enum
        multiple
        onValueChange={onSourceVersionsChange}
        options={options}
        positioning={{ slide: true }}
        size="sm"
        value={sourceVersions}
      />
    </CaptionInput>
  );
}

//------------------------------------------------------------------------------
// I18n Context
//------------------------------------------------------------------------------

const i18nContext = {
  versions: {
    en: "Versions",
    it: "Versioni",
  },
};
