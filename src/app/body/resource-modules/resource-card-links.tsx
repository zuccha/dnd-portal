import { Fragment } from "react";
import type { LocalizedResourceLink } from "~/models/resources/localized-resource";
import type { ResourceKind } from "~/models/types/resource-kind";
import ResourceCardLink from "./resource-card-link";

//------------------------------------------------------------------------------
// Resource Card Links
//------------------------------------------------------------------------------

export default function ResourceCardLinks({
  resources,
}: {
  resources: LocalizedResourceLink<ResourceKind>[];
}) {
  return resources.map(({ id, kind, name }, index) => (
    <Fragment key={`${kind}:${id}`}>
      {index > 0 && ", "}
      <ResourceCardLink id={id} kind={kind}>
        {name}
      </ResourceCardLink>
    </Fragment>
  ));
}
