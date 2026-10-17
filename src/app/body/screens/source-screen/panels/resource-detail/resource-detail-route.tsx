import { useParams } from "react-router";
import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import ResourceDetailNotFound from "../../../../resource-modules/resource-detail-not-found";
import type { ComponentType } from "react";

//------------------------------------------------------------------------------
// Resource Detail Route
//------------------------------------------------------------------------------

export default function ResourceDetailRoute({
  Detail,
}: {
  Detail: ComponentType<{ resourceId: string }>;
}) {
  const { resourceId } = useParams();
  const { t } = useI18nLangContext(i18nContext);

  if (!resourceId) return <ResourceDetailNotFound message={t("not_found")} />;

  return <Detail resourceId={resourceId} />;
}

//------------------------------------------------------------------------------
// I18n Context
//------------------------------------------------------------------------------

const i18nContext = {
  not_found: {
    en: "This resource could not be found.",
    it: "Impossibile trovare questa risorsa.",
  },
};
