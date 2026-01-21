import { useMemo } from "react";
import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import { type I18nString } from "~/i18n/i18n-string";

//------------------------------------------------------------------------------
// Use Boolean Options
//------------------------------------------------------------------------------

export default function useBooleanOptions(i18nContext: {
  false: I18nString;
  true: I18nString;
}) {
  const { t } = useI18nLangContext(i18nContext);
  const options = useMemo(
    () => [
      { label: t("false"), value: false },
      { label: t("true"), value: true },
    ],
    [t],
  );
  return options;
}
