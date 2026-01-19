import { useLayoutEffect } from "react";
import type { Route } from "./routes";

//------------------------------------------------------------------------------
// Redirect
//------------------------------------------------------------------------------

export type RedirectProps = {
  route: Route;
};

export default function Redirect({ route }: RedirectProps) {
  useLayoutEffect(() => {
    history.replaceState({}, "", route);
  }, [route]);

  return null;
}
