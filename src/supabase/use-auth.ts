import { useContext } from "react";
import type { Auth } from "./auth";
import AuthContext from "./auth-context";

//------------------------------------------------------------------------------
// Use Auth
//------------------------------------------------------------------------------

export default function useAuth(): Auth {
  return useContext(AuthContext);
}
