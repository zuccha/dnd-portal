import { useParams } from "react-router";
import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import { resourceKindSchema } from "~/models/types/resource-kind";
import ResourceDetailNotFound from "./resource-detail-not-found";
import { resourceDetailByKind } from "./resource-detail-route-map";

//------------------------------------------------------------------------------
// Resource Detail Route
//------------------------------------------------------------------------------

export default function ResourceDetailRoute() {
  const { kind, resourceId } = useParams();
  const { t } = useI18nLangContext(i18nContext);
  const parsedKind = resourceKindSchema.safeParse(kind);

  if (!parsedKind.success || !resourceId) {
    return <ResourceDetailNotFound message={t("not_found")} />;
  }

  const ResourceDetail = resourceDetailByKind[parsedKind.data];
  return <ResourceDetail resourceId={resourceId} />;
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
