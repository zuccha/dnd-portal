import { createContext, useContext } from "react";
import type { StateSetter } from "~/utils/state";

//------------------------------------------------------------------------------
// Resource Editor Language Context Value
//------------------------------------------------------------------------------

export type ResourceEditorLanguageContextValue = {
  lang: string;
  setLang: StateSetter<string>;
};

const defaultResourceEditorLanguageContextValue: ResourceEditorLanguageContextValue = {
  lang: "en",
  setLang: () => "en",
};

//------------------------------------------------------------------------------
// Resource Editor Language Context
//------------------------------------------------------------------------------

export const resourceEditorLanguageContext = createContext(
  defaultResourceEditorLanguageContextValue,
);

//------------------------------------------------------------------------------
// Use Resource Editor Language
//------------------------------------------------------------------------------

export function useResourceEditorLang(): ResourceEditorLanguageContextValue {
  return useContext(resourceEditorLanguageContext);
}
