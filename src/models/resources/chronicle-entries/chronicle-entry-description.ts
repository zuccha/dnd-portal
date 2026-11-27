import type { I18nLang } from "~/i18n/i18n-lang";
import { translate } from "~/i18n/i18n-string";
import { compareChronicleDates, formatChronicleDate } from "~/models/other/chronicle-date";
import { serializeResourceLink } from "../resource-link";
import type { ChronicleEntry } from "./chronicle-entry";

//------------------------------------------------------------------------------
// Append Chronicle Entries To Description
//------------------------------------------------------------------------------

export function appendChronicleEntriesToDescription(
  description: string,
  entries: ChronicleEntry[],
  lang: I18nLang,
): string {
  const sortedEntries = entries
    .map((entry, position) => ({ entry, position }))
    .sort((first, second) => {
      const dateOrder = compareChronicleDates(first.entry.date, second.entry.date);
      return dateOrder || first.position - second.position;
    });

  if (!sortedEntries.length) return description;

  const heading = translate({ en: "Chronicle", it: "Cronologia" }, lang);
  const lines = sortedEntries.map(({ entry }) => {
    const name = translate(entry.name, lang);
    const date = formatChronicleDate(entry.date);
    const datePrefix = date ? `**${date}:** ` : "";
    return `• ${datePrefix}${serializeResourceLink(entry, "", name)}`;
  });
  const section = `##${heading}##\r${lines.join("\n")}`;

  return description ? `${description}\n${section}` : section;
}
