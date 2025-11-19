import js from "@eslint/js";
import globals from "globals";
import imports from "eslint-plugin-import";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";

export default tseslint.config(
  { ignores: ["dist"] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      "react": react,
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
      "import": imports,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "import/order": [
        "error",
        {
          "groups": [
            "builtin",
            "external",
            "internal",
            "parent",
            "sibling",
            "index",
          ],
          "pathGroups": [
            { pattern: "@/**", group: "external" },
            { pattern: "~/**", group: "internal" },
          ],
          "pathGroupsExcludedImportTypes": ["builtin"],
          "alphabetize": { order: "asc", caseInsensitive: false },
          "newlines-between": "never",
          "named": true,
        },
      ],
      "quote-props": ["error", "consistent"],
      "react/jsx-sort-props": ["error"],
      "react-refresh/only-export-components": [
        "error",
        { allowConstantExport: true },
      ],
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
      "sort-keys": [
        "error",
        "asc",
        { allowLineSeparatedGroups: true, caseSensitive: true, natural: true },
      ],
    },
    settings: {
      react: {
        version: "detect",
      },
    },
  },
);
