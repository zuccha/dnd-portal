import fs from "node:fs";

const filename = process.argv[2];

function format(text) {
  if (!text) return "";
  let formatted = text.replace(/\{/g, "{{").replace(/\}/g, "}}").replace(/_/g, "__");
  for (const [prev, next] of corrections) formatted = formatted.replaceAll(prev, next);
  return formatted;
}

const richTextFields = [
  ["armor_modifiers", ["description_delta"]],
  ["armors", ["description"]],
  [
    "creatures",
    ["actions", "bonus_actions", "lair_effects", "legendary_actions", "reactions", "traits"],
  ],
  ["eldritch_invocations", ["description"]],
  ["feats", ["description"]],
  ["features", ["description"]],
  ["item_modifiers", ["description_delta"]],
  ["items", ["description"]],
  ["maneuvers", ["description"]],
  ["metamagics", ["description"]],
  ["services", ["description"]],
  ["species", ["description"]],
  ["spells", ["description", "upgrade"]],
  ["tool_modifiers", ["description_delta"]],
  ["tools", ["description"]],
  ["vehicles", ["description"]],
  ["weapon_modifiers", ["description_delta"]],
  ["weapons", ["description"]],
];

const corrections = [
  ["armor__modifier", "armor_modifier"],
  ["character__class", "character_class"],
  ["character__subclass", "character_subclass"],
  ["creature__family", "creature_family"],
  ["creature__habitat", "creature_habitat"],
  ["creature__tag", "creature_tag"],
  ["creature__treasure", "creature_treasure"],
  ["eldritch__invocation", "eldritch_invocation"],
  ["item__modifier", "item_modifier"],
  ["tool__modifier", "tool_modifier"],
  ["weapon__modifier", "weapon_modifier"],
];

if (!filename || !fs.existsSync(filename)) {
  console.error(`Filename "${filename}" doesn't exist.`);
  process.exit(1);
}

try {
  const text = fs.readFileSync(filename, "utf8");
  const data = JSON.parse(text);

  for (const richTextField of richTextFields) {
    const [kind, props] = richTextField;
    for (const resource of data.resources[kind]) {
      for (const prop of props) {
        if (resource[prop]) {
          resource[prop]["en"] = format(resource[prop]["en"]);
          resource[prop]["it"] = format(resource[prop]["it"]);
        }
      }
    }
  }

  fs.writeFileSync(filename, JSON.stringify(data, null, 2));
} catch (err) {
  console.error(err);
}
