import js from "@eslint/js";
import globals from "globals";
import json from "@eslint/json";
import { defineConfig } from "eslint/config";

export default defineConfig([
  { files: ["**/*.{js,mjs,cjs}"], plugins: { js }, extends: ["js/recommended"], languageOptions: { globals: globals.node },
    rules: {
      "semi": ["error", "always"],
      "quotes": ["warn", "double", { avoidEscape: true }],
      "comma-dangle": ["error", "always-multiline"],
      "no-trailing-spaces": "error",
      "eol-last": ["error", "always"],
      "indent": ["error", 2],
      "no-unused-vars": ["error"],
      "eqeqeq": ["error", "always"],
      "curly": "error",
      "prefer-const": "error",
    },
  },
  { files: ["**/*.js"], languageOptions: { sourceType: "commonjs" } },
  { files: ["**/*.json"], plugins: { json }, language: "json/json", extends: ["json/recommended"], ignores: ["package-lock.json"] },
]);
