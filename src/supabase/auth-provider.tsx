import { useEffect, useMemo, useState, type ReactNode } from "react";
import type { Session } from "@supabase/supabase-js";
import supabase from "./supabase";
import AuthContext from "./auth-context";
import { mapSessionToAuthUser } from "./auth";

//------------------------------------------------------------------------------
// Auth Provider
//------------------------------------------------------------------------------

export type AuthProviderProps = {
  children: ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
  const [session, setSession] = useState<Session | undefined>(undefined);

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (mounted) setSession(data.session ?? undefined);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (mounted) setSession(session ?? undefined);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const auth = useMemo(
    () => ({
      user: mapSessionToAuthUser(session),
    }),
    [session]
  );

  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
}
