import { Fragment } from "react";
import { resourceDetailRoute } from "../../../navigation/routes";
import RouterLink from "../../../ui/router-link";
import type { ResourceKind } from "../../../models/types/resource-kind";

export type ResourceDetailLinkEntry = {
  id: string;
  kind: ResourceKind;
  name: string;
};

//------------------------------------------------------------------------------
// Resource Detail Links
//------------------------------------------------------------------------------

export default function ResourceDetailLinks({
  resources,
}: {
  resources: ResourceDetailLinkEntry[];
}) {
  return resources.map(({ id, kind, name }, index) => (
    <Fragment key={`${kind}:${id}`}>
      {index > 0 && ", "}
      <RouterLink to={resourceDetailRoute(kind, id)}>{name}</RouterLink>
    </Fragment>
  ));
}
