import { z } from "zod/v4";
import { createLocalStore } from "../store/local-store";

//------------------------------------------------------------------------------
// I18n Lang Store
//------------------------------------------------------------------------------

export const i18nLangStore = createLocalStore(
  "i18n.lang",
  "en",
  z.string().parse
);
