/** @type {import("eslint").Linter.Config} */
module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint", "import"],
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:import/recommended",
    "plugin:import/typescript",
    "prettier"
  ],
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: "module"
  },
  settings: {
    "import/resolver": {
      typescript: {
        alwaysTryTypes: true
      }
    }
  },
  rules: {
    "@typescript-eslint/no-unused-vars": [
      "error",
      { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }
    ],
    "@typescript-eslint/no-explicit-any": "warn",
    "@typescript-eslint/explicit-function-return-type": "off",
    "@typescript-eslint/explicit-module-boundary-types": "off",
    "@typescript-eslint/consistent-type-imports": [
      "error",
      { prefer: "type-imports" }
    ],
    "import/order": [
      "error",
      {
        groups: [
          "builtin",
          "external",
          "internal",
          ["parent", "sibling"],
          "index"
        ],
        "newlines-between": "always",
        alphabetize: { order: "asc" }
      }
    ],
    "import/no-duplicates": "error"
  },
  ignorePatterns: [
    "node_modules",
    "dist",
    ".next",
    ".expo",
    "coverage",
    ".turbo"
  ]
};
