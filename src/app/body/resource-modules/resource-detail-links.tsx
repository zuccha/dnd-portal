import { Fragment } from "react";
import { resourceDetailRoute } from "../../../navigation/routes";
import RouterLink from "../../../ui/router-link";
import type { LocalizedResourceLink } from "../../../models/resources/localized-resource";
import type { ResourceKind } from "../../../models/types/resource-kind";

//------------------------------------------------------------------------------
// Resource Detail Link Entry
//------------------------------------------------------------------------------

export type ResourceDetailLinkEntry = LocalizedResourceLink<ResourceKind>;

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
