import { Navigate } from "react-router";
import { useActiveSourceId } from "~/models/catalogue/catalogue";
import { Route } from "~/navigation/routes";

//------------------------------------------------------------------------------
// Resource Panel Route
//------------------------------------------------------------------------------

export type ResourcePanel = (props: { sourceId: string }) => React.ReactNode;

export type ResourcePanelRouteProps = {
  Panel: ResourcePanel;
};

export default function ResourcePanelRoute({ Panel }: ResourcePanelRouteProps) {
  const sourceId = useActiveSourceId();

  if (!sourceId) return <Navigate replace to={Route.Sources} />;

  return <Panel sourceId={sourceId} />;
}
