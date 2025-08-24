import { createStorePersistent } from "../utils/store-persistent";
import { i18nLanguageSchema } from "./i18n-language";

export const i18nLanguageStore = createStorePersistent(
  "i18n.language",
  "en",
  i18nLanguageSchema.parse,
);

export default function useI18nLanguage() {
  return i18nLanguageStore.use();
}
