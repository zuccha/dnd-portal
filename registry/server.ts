import { readFile, readdir } from "node:fs/promises";
import { createServer } from "node:http";
import { join, resolve } from "node:path";
import { z } from "zod";

//------------------------------------------------------------------------------
// Registry Data
//------------------------------------------------------------------------------

const registryDataDirectory = resolve(
  process.env.REGISTRY_DATA_DIR ?? "registry/sources",
);

const registrySourceSchema = z
  .object({
    code: z.string(),
    id: z.uuid(),
    includes: z.array(z.unknown()).default([]),
    name: z.record(z.string(), z.string().nullable().optional()),
    registry: z.unknown().optional(),
    requires: z.array(z.unknown()).default([]),
    type: z.string(),
    version: z.string(),
  })
  .passthrough();

const sourceBundleSchema = z.object({
  resources: z.record(z.string(), z.array(z.unknown())),
  source: registrySourceSchema,
});

type RegistrySource = z.infer<typeof registrySourceSchema>;
type SourceBundle = z.infer<typeof sourceBundleSchema>;

async function loadSourceBundles(): Promise<SourceBundle[]> {
  const filenames = (await readdir(registryDataDirectory))
    .filter((filename) => filename.endsWith(".json"))
    .sort();

  return Promise.all(
    filenames.map(async (filename) => {
      const content = await readFile(
        join(registryDataDirectory, filename),
        "utf8",
      );
      return sourceBundleSchema.parse(JSON.parse(content));
    }),
  );
}

//------------------------------------------------------------------------------
// HTTP Responses
//------------------------------------------------------------------------------

function sendJson(
  response: import("node:http").ServerResponse,
  status: number,
  data: unknown,
): void {
  response.writeHead(status, {
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Origin": "*",
    "Content-Type": "application/json; charset=utf-8",
  });
  response.end(JSON.stringify(data));
}

function sendError(
  response: import("node:http").ServerResponse,
  status: number,
  message: string,
): void {
  sendJson(response, status, { error: message });
}

//------------------------------------------------------------------------------
// HTTP Server
//------------------------------------------------------------------------------

const port = Number(process.env.REGISTRY_PORT ?? 8787);

const server = createServer(async (request, response) => {
  if (request.method === "OPTIONS") {
    sendJson(response, 204, null);
    return;
  }

  if (request.method !== "GET" || !request.url) {
    sendError(response, 405, "Method not allowed");
    return;
  }

  const pathname = new URL(
    request.url,
    `http://${request.headers.host ?? "localhost"}`,
  ).pathname;

  try {
    const bundles = await loadSourceBundles();

    if (pathname === "/registry/sources") {
      const sources = bundles.map(({ source }): RegistrySource => source);
      sendJson(response, 200, sources);
      return;
    }

    const sourceId = pathname.match(/^\/registry\/sources\/([^/]+)$/)?.[1];
    if (sourceId) {
      const bundle = bundles.find(({ source }) => source.id === sourceId);
      if (!bundle) {
        sendError(response, 404, "Registry source not found");
        return;
      }

      sendJson(response, 200, bundle);
      return;
    }

    sendError(response, 404, "Route not found");
  } catch (error) {
    console.error(error);
    sendError(response, 500, "Could not load registry sources");
  }
});

server.listen(port, "0.0.0.0", () => {
  console.log(`Local registry listening on port ${port}`);
  console.log(
    "Use the development machine's LAN address in VITE_REGISTRY_URL.",
  );
  console.log(`Reading source bundles from ${registryDataDirectory}`);
});
