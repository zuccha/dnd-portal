import { useContext } from "react";
import AuthContext from "./auth-context";
import type { Auth } from "./auth";

//------------------------------------------------------------------------------
// Use Auth
//------------------------------------------------------------------------------

export default function useAuth(): Auth {
  return useContext(AuthContext);
}
