import type { ResourceKind } from "~/models/types/resource-kind";
import { resourceDetailRoute } from "~/navigation/routes";
import RouterLink from "~/ui/router-link";
import type { ReactNode } from "react";

//------------------------------------------------------------------------------
// Resource Card Link
//------------------------------------------------------------------------------

export default function ResourceCardLink({
  children,
  id,
  kind,
}: {
  children: ReactNode;
  id: string;
  kind: ResourceKind;
}) {
  return (
    <RouterLink
      onClick={(event) => event.stopPropagation()}
      onPointerDown={(event) => event.stopPropagation()}
      onPointerUp={(event) => event.stopPropagation()}
      to={resourceDetailRoute(kind, id)}
    >
      {children}
    </RouterLink>
  );
}
