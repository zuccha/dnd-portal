import { useMemo } from "react";
import { z } from "zod";

//------------------------------------------------------------------------------
// Json
//------------------------------------------------------------------------------

type Json = z.infer<ReturnType<typeof z.json>>;

//------------------------------------------------------------------------------
// Is Json Leaf
//------------------------------------------------------------------------------

function isJsonLeaf(
  json: Json | undefined,
): json is string | number | boolean | null {
  return (
    typeof json === "string" ||
    typeof json === "number" ||
    typeof json === "boolean" ||
    json === null ||
    json === undefined
  );
}

//------------------------------------------------------------------------------
// Get Json Value
//------------------------------------------------------------------------------

function getJsonValue(json: Json, path: string): string {
  path = path.replace(/\[(\w+)\]/g, ".$1");
  const keys = path.split(".");
  let value: Json | undefined = json;
  while (keys.length) {
    if (isJsonLeaf(value)) return "";
    const key = keys.shift()!;
    value = Array.isArray(value) ? value[+key] : value![key];
  }
  return value === null || value === undefined ? "" : String(value);
}

//------------------------------------------------------------------------------
// Interpolate Text
//------------------------------------------------------------------------------

function interpolateText(text: string, json: Json): string {
  return text
    .replace(/\\n/g, "\n")
    .replace(/\\r/g, "\r")
    .replace(/<([^<>]+)>/g, (_, path) => getJsonValue(json, path));
}

//------------------------------------------------------------------------------
// Use Interpolated Text
//------------------------------------------------------------------------------

export default function useInterpolatedText(text: string, json: Json): string {
  return useMemo(() => interpolateText(text, json), [json, text]);
}
