import type { Session, User } from "@supabase/supabase-js";
import supabase from "./supabase";

//------------------------------------------------------------------------------
// Auth User
//------------------------------------------------------------------------------

export type AuthUser = {
  id: string;
  email?: string;
  name?: string;
  avatarUrl?: string;
};

//------------------------------------------------------------------------------
// Auth
//------------------------------------------------------------------------------

export type Auth = {
  user: AuthUser | undefined;
};

//------------------------------------------------------------------------------
// Sign In With Discord
//------------------------------------------------------------------------------

export async function signInWithDiscord() {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: "discord",
    options: {
      redirectTo: window.location.origin,
      scopes: "identify email",
    },
  });
  if (error) console.error(error);
}

//------------------------------------------------------------------------------
// Sign Out
//------------------------------------------------------------------------------

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) console.error(error);
}

//------------------------------------------------------------------------------
// Map Session To Auth User
//------------------------------------------------------------------------------

const firstDefined = <T>(...vals: Array<T | undefined>) =>
  vals.find((v) => v !== undefined) as T | undefined;

const fromIdentities = <T>(user: User, pick: (data: any) => T | undefined) =>
  user.identities
    ?.map((i) => pick(i.identity_data))
    .find((v) => v !== undefined);

export function mapSessionToAuthUser(
  session: Session | undefined
): AuthUser | undefined {
  const user = session?.user;
  if (!user) return undefined;

  const email =
    user.email ??
    (user.user_metadata?.email as string | undefined) ??
    fromIdentities(user, (d) => d?.email as string | undefined);

  const name = firstDefined<string>(
    user.user_metadata?.full_name as string | undefined,
    user.user_metadata?.name as string | undefined,
    user.user_metadata?.user_name as string | undefined,
    user.user_metadata?.preferred_username as string | undefined,
    fromIdentities(
      user,
      (d) => d?.name ?? d?.full_name ?? d?.username ?? d?.user_name
    ),
    email ? email.split("@")[0] : undefined
  );

  const avatarUrl = firstDefined<string>(
    user.user_metadata?.avatar_url as string | undefined,
    user.user_metadata?.picture as string | undefined,
    fromIdentities(user, (d) => d?.avatar_url ?? d?.picture)
  );

  return {
    id: user.id,
    email: email ?? undefined,
    name: name ?? undefined,
    avatarUrl: avatarUrl ?? undefined,
  };
}
