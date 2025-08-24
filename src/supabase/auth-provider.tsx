import type { Session } from "@supabase/supabase-js";
import { type ReactNode, useEffect, useMemo, useState } from "react";
import { mapSessionToAuthUser } from "./auth";
import AuthContext from "./auth-context";
import supabase from "./supabase";

//------------------------------------------------------------------------------
// Auth Provider
//------------------------------------------------------------------------------

export type AuthProviderProps = {
  children: ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<Session | undefined>(undefined);

  useEffect(() => {
    let mounted = true;

    supabase.auth
      .getSession()
      .then(({ data }) => {
        if (mounted) {
          setLoading(false);
          setSession(data.session ?? undefined);
        }
      })
      .catch(() => setLoading(false));

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
    () => ({ loading, user: mapSessionToAuthUser(session) }),
    [loading, session]
  );

  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
}
