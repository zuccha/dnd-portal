import { RatIcon } from "lucide-react";
import { useI18nLangContext } from "../../../../../../i18n/i18n-lang-context";
import EmptyState from "../../../../../../ui/empty-state";

//----------------------------------------------------------------------------
// Resources List Empty
//----------------------------------------------------------------------------

export default function ResourcesListEmpty() {
  const { t } = useI18nLangContext(i18nContext);

  return (
    <EmptyState
      Icon={RatIcon}
      mt="10%"
      subtitle={t("subtitle")}
      title={t("title")}
    />
  );
}

//----------------------------------------------------------------------------
// I18n Context
//----------------------------------------------------------------------------

const i18nContext = {
  title: {
    en: "No items found",
    it: "Nessun elemento trovato",
  },

  subtitle: {
    en: "Clear your filters and try again",
    it: "Resetta i filtri e riprova",
  },
};
