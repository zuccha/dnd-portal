import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const registryBundleBucket = "registry-bundles";

//------------------------------------------------------------------------------
// JSON Response
//------------------------------------------------------------------------------

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    headers: {
      "Access-Control-Allow-Headers":
        "authorization, x-client-info, apikey, content-type",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Origin": "*",
      "Content-Type": "application/json",
    },
    status,
  });
}

//------------------------------------------------------------------------------
// Canonical JSON
//------------------------------------------------------------------------------

function canonicalJson(value: unknown): string {
  return JSON.stringify(value, (_key, currentValue) => {
    if (!currentValue || typeof currentValue !== "object") return currentValue;
    if (Array.isArray(currentValue)) return currentValue;

    return Object.keys(currentValue)
      .sort()
      .reduce<Record<string, unknown>>((object, key) => {
        object[key] = currentValue[key];
        return object;
      }, {});
  });
}

//------------------------------------------------------------------------------
// SHA-256
//------------------------------------------------------------------------------

async function sha256(value: string): Promise<string> {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(value),
  );

  return Array.from(new Uint8Array(digest), (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("");
}

//------------------------------------------------------------------------------
// Publish Registry Source
//------------------------------------------------------------------------------

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return jsonResponse({}, 204);
  if (request.method !== "POST")
    return jsonResponse({ error: "Method not allowed" }, 405);

  const authorization = request.headers.get("Authorization");
  if (!authorization)
    return jsonResponse({ error: "Authentication required" }, 401);

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !anonKey || !serviceRoleKey)
    return jsonResponse({ error: "Function is not configured" }, 500);

  const userClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authorization } },
  });
  const serviceClient = createClient(supabaseUrl, serviceRoleKey);

  const { data: userData, error: userError } = await userClient.auth.getUser();
  if (userError || !userData.user)
    return jsonResponse({ error: "Authentication required" }, 401);

  let body: {
    base_revision_id?: unknown;
    bundle?: unknown;
    source_id?: unknown;
  };
  try {
    body = await request.json();
  } catch {
    return jsonResponse({ error: "Invalid JSON" }, 400);
  }

  if (
    typeof body.source_id !== "string" ||
    typeof body.base_revision_id !== "string" ||
    !body.bundle ||
    typeof body.bundle !== "object"
  )
    return jsonResponse({ error: "Invalid publish request" }, 400);

  const sourceId = body.source_id;
  const permanentPath = `sources/${sourceId}/bundle.json`;
  const bundleHash = await sha256(canonicalJson(body.bundle));

  const { data, error: revisionError } = await serviceClient.rpc(
    "publish_registry_source_revision",
    {
      p_base_revision_id: body.base_revision_id,
      p_bundle_hash: bundleHash,
      p_source_id: sourceId,
      p_storage_path: permanentPath,
      p_user_id: userData.user.id,
    },
  );

  if (revisionError) {
    const status =
      ["40001", "55P03"].includes(revisionError.code ?? "") ? 409 : 400;
    return jsonResponse({ error: revisionError.message }, status);
  }

  const { error: uploadError } = await serviceClient.storage
    .from(registryBundleBucket)
    .upload(permanentPath, JSON.stringify(body.bundle), {
      contentType: "application/json",
      upsert: true,
    });

  if (uploadError) return jsonResponse({ error: uploadError.message }, 500);

  return jsonResponse(data);
});
