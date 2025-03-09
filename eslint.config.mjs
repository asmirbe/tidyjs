import typescriptEslint from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";

export default [{
    files: ["**/*.ts"],
}, {
    plugins: {
        "@typescript-eslint": typescriptEslint,
    },

    languageOptions: {
        parser: tsParser,
        ecmaVersion: 2022,
        sourceType: "module",
    },

    ignores: [
        // for non-global ignores a full glob pattern is required
        'test/**/*',
    ],

    rules: {
        "no-unused-vars": [2, {"vars": "local", "args": "after-used"}],
        eqeqeq: "warn",
        "no-throw-literal": "warn",
        semi: "warn",
    },
}];