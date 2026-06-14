import { useMemo } from "react";
import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import { i18nSystems, useI18nSystem } from "~/i18n/i18n-system";
import CaptionInput from "~/ui/caption-input";
import Select from "~/ui/select";
import { compareObjects } from "~/utils/object";

//------------------------------------------------------------------------------
// System Select
//------------------------------------------------------------------------------

export default function SystemSelect() {
  const { t } = useI18nLangContext(i18nContext);
  const [system, setSystem] = useI18nSystem();

  const systemOptions = useMemo(
    () =>
      i18nSystems
        .map((system) => ({
          label: t(`system.${system}`),
          value: system,
        }))
        .sort(compareObjects("label")),
    [t],
  );

  return (
    <CaptionInput caption={t("system")} flex={1}>
      <Select.Enum
        onValueChange={setSystem}
        options={systemOptions}
        positioning={{ slide: true }}
        size="sm"
        value={system}
      />
    </CaptionInput>
  );
}

//------------------------------------------------------------------------------
// I18n Context
//------------------------------------------------------------------------------

const i18nContext = {
  "system": {
    en: "Units",
    it: "Unità",
  },
  "system.imperial": {
    en: "Imperial",
    it: "Imperiale",
  },
  "system.metric": {
    en: "Metric",
    it: "Metrico",
  },
};
