import { useLayoutEffect } from "react";
import { useNavigate } from "react-router";
import type { Route } from "./routes";

//------------------------------------------------------------------------------
// Redirect
//------------------------------------------------------------------------------

export type RedirectProps = {
  route: Route;
};

export default function Redirect({ route }: RedirectProps) {
  const navigate = useNavigate();

  useLayoutEffect(() => {
    navigate(route, { replace: true });
  }, [navigate, route]);

  return null;
}
