import js from "@eslint/js";
import globals from "globals";
import json from "@eslint/json";
import { defineConfig } from "eslint/config";

export default defineConfig([
  {
    ignores: ["package-lock.json", "node_modules/**"]
  },

  js.configs.recommended,

  {
    files: ["**/*.{js,mjs,cjs}"],
    languageOptions: {
      globals: {
        ...globals.node,
      },
      sourceType: "module",
    },
    rules: {
      "semi": ["warn", "always"],
      "quotes": ["warn", "double", { avoidEscape: true }],
      "comma-dangle": ["warn", "always-multiline"],
      "no-trailing-spaces": "warn",
      "eol-last": ["warn", "always"],
      "indent": ["warn", 2, {
        "SwitchCase": 1,
        "MemberExpression": 1,
        "FunctionDeclaration": { "parameters": "first" },
        "FunctionExpression": { "parameters": "first" },
        "CallExpression": { "arguments": "first" },
        "ArrayExpression": "first",
        "ObjectExpression": "first",
        "ImportDeclaration": "first",
        "flatTernaryExpressions": false,
        "ignoreComments": false,
      }],

      "no-console": "warn",
      "no-unused-vars": ["warn", { args: "after-used", ignoreRestSiblings: true }],

      "eqeqeq": ["error", "always"],
      "curly": "error",
      "prefer-const": "error",
      "no-var": "error",
      "object-shorthand": "error",
    },
  },

  {
    files: ["**/*.json"],
    language: "json/json",
    ...json.configs.recommended,
  },
]);
