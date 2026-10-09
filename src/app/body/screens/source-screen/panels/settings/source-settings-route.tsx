import { Navigate, useParams } from "react-router";
import { Route } from "~/navigation/routes";
import SourceSettingsPanel from "./source-settings-panel";

//------------------------------------------------------------------------------
// Source Settings Route
//------------------------------------------------------------------------------

export default function SourceSettingsRoute() {
  const { sourceId } = useParams();

  if (!sourceId) return <Navigate replace to={Route.Sources} />;

  return <SourceSettingsPanel sourceId={sourceId} />;
}
