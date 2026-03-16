import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";
import simpleImportSort from "eslint-plugin-simple-import-sort";
import a11y from "eslint-plugin-jsx-a11y";
import prettier from "eslint-config-prettier";

export default tseslint.config(
  { ignores: ["dist", "coverage", "playwright-report", "test-results", "*.config.js"] },

  // TypeScript + React files
  {
    extends: [
      js.configs.recommended,
      ...tseslint.configs.recommendedTypeChecked,
      prettier,
    ],
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2022,
      globals: globals.browser,
      parserOptions: {
        project: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: {
      "react-hooks":        reactHooks,
      "react-refresh":      reactRefresh,
      "simple-import-sort": simpleImportSort,
      "jsx-a11y":           a11y,
    },
    rules: {
      // React
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": ["warn", { allowConstantExport: true }],

      // TypeScript strictness
      "@typescript-eslint/no-unused-vars":          ["error", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
      "@typescript-eslint/no-explicit-any":          "warn",
      "@typescript-eslint/consistent-type-imports":  ["error", { prefer: "type-imports", fixStyle: "inline-type-imports" }],
      "@typescript-eslint/no-floating-promises":     "error",
      "@typescript-eslint/await-thenable":           "error",
      "@typescript-eslint/no-misused-promises":      ["error", { checksVoidReturn: { attributes: false } }],
      "@typescript-eslint/require-await":            "warn",
      "@typescript-eslint/prefer-nullish-coalescing": "warn",
      "@typescript-eslint/prefer-optional-chain":    "warn",
      "@typescript-eslint/no-unnecessary-condition": "off",

      // Imports
      "simple-import-sort/imports": "error",
      "simple-import-sort/exports": "error",

      // A11y — all recommended rules
      ...a11y.configs.recommended.rules,

      // General quality
      "no-console":       ["warn", { allow: ["warn", "error"] }],
      "no-debugger":      "error",
      "prefer-const":     "error",
      "no-var":           "error",
      "eqeqeq":           ["error", "always", { null: "ignore" }],
      "no-nested-ternary": "warn",
    },
  },

  // Relax rules for test files
  {
    files: ["src/**/*.{test,spec}.{ts,tsx}", "src/test/**"],
    rules: {
      "@typescript-eslint/no-explicit-any":      "off",
      "@typescript-eslint/no-floating-promises": "off",
      "@typescript-eslint/require-await":        "off",
      "no-console":                              "off",
    },
  },
);
