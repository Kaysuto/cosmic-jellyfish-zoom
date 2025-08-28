import js from "@eslint/js";
import globals from "globals";
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
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],
      "@typescript-eslint/no-unused-vars": "off",
      // Règles pour détecter les erreurs de syntaxe
      "@typescript-eslint/no-unreachable": "error",
      "@typescript-eslint/no-extra-semi": "error",
      "@typescript-eslint/no-misplaced-newline": "error",
      // Règles pour améliorer la qualité du code
      "no-console": "warn",
      "no-debugger": "error",
      "no-alert": "warn",
    },
  },
);
