import { useParams } from "react-router";
import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import ResourceDetailNotFound from "../../../../resource-modules/resource-detail-not-found";
import type { ResourceModule } from "../../../../resource-modules/resource-module";

//------------------------------------------------------------------------------
// Resource Detail Route
//------------------------------------------------------------------------------

export default function ResourceDetailRoute({ modules }: { modules: ResourceModule[] }) {
  const { kind, resourceId } = useParams();
  const { t } = useI18nLangContext(i18nContext);
  const resourceModule = modules.find((module) => module.kind === kind);

  if (!resourceModule) {
    return <ResourceDetailNotFound message={t("not_found")} />;
  }

  if (!resourceId) {
    return <ResourceDetailNotFound kind={resourceModule.kind} to={resourceModule.path} />;
  }

  const ResourceDetail = resourceModule.Detail;
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
