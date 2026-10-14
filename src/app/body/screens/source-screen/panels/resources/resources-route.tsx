import { Navigate } from "react-router";
import { useActiveSourceId } from "~/models/catalogue/catalogue";
import { Route } from "~/navigation/routes";
import type { ComponentType } from "react";

//------------------------------------------------------------------------------
// Resources Route
//------------------------------------------------------------------------------

type ResourcePanel = ComponentType<{ sourceId: string }>;

type ResourcesRouteProps = {
  Panel: ResourcePanel;
};

export default function ResourcesRoute({ Panel }: ResourcesRouteProps) {
  const sourceId = useActiveSourceId();

  if (!sourceId) return <Navigate replace to={Route.Sources} />;

  return <Panel sourceId={sourceId} />;
}
