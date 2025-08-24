import { createContext } from "react";
import type { Auth } from "./auth";

//------------------------------------------------------------------------------
// Auth Context
//------------------------------------------------------------------------------

const AuthContext = createContext<Auth>({ loading: true, user: undefined });

export default AuthContext;
