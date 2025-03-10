import typescriptEslint from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import eslintPluginImport from "eslint-plugin-import";

export default [{
    files: ["**/*.ts"],
}, {
    plugins: {
        "@typescript-eslint": typescriptEslint,
        "import": eslintPluginImport,
    },

    languageOptions: {
        parser: tsParser,
        parserOptions: {
            project: "./tsconfig.json",
            ecmaVersion: 2022,
            sourceType: "module",
        },
    },

    ignores: [
        // for non-global ignores a full glob pattern is required
        'test/**/*',
        'node_modules/**/*',
        'dist/**/*',
    ],

    extends: [
        "eslint:recommended",
    ],

    rules: {
        // Règles TypeScript générales
        "@typescript-eslint/no-unused-vars": ["error", { 
            "vars": "all", 
            "args": "after-used", 
            "ignoreRestSiblings": true,
            "argsIgnorePattern": "^_"
        }],
        "@typescript-eslint/explicit-function-return-type": ["warn", {
            "allowExpressions": true,
            "allowTypedFunctionExpressions": true,
        }],
        "@typescript-eslint/no-explicit-any": "warn",
        "@typescript-eslint/no-non-null-assertion": "warn",
        "@typescript-eslint/ban-ts-comment": "warn",
        "@typescript-eslint/prefer-nullish-coalescing": "warn",
        "@typescript-eslint/prefer-optional-chain": "warn",
        "@typescript-eslint/no-empty-function": "warn",
        "@typescript-eslint/no-empty-interface": "warn",
        "@typescript-eslint/ban-types": "error",
        "@typescript-eslint/consistent-type-assertions": "warn",

        // Détection de bugs
        "no-debugger": "warn",
        "no-duplicate-case": "error",
        "no-invalid-regexp": "error",
        "no-irregular-whitespace": "error",
        "no-unreachable": "error",
        "no-console": ["warn", { "allow": ["warn", "error"] }],

        // Style de code
        "eqeqeq": ["error", "always"],
        "no-throw-literal": "error",
        "semi": ["error", "always"],
        "quotes": ["warn", "single", { "avoidEscape": true }],
        "arrow-body-style": ["warn", "as-needed"],
        "prefer-arrow-callback": "warn",
        "prefer-const": "error",
        "camelcase": ["warn", { "properties": "never" }],
        "curly": ["warn", "multi-line"],
        "no-var": "error",
        
        // Règles d'import
        "import/no-unresolved": "off", // TypeScript gère déjà cela
        "import/named": "error",
        "import/default": "error",
        "import/export": "error",
        "import/no-duplicates": "error",
        "import/order": ["warn", {
            "groups": ["builtin", "external", "internal", "parent", "sibling", "index"],
            "newlines-between": "always",
            "alphabetize": { "order": "asc" }
        }],
        "import/no-mutable-exports": "error"
    },
}];