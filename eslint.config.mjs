import js from '@eslint/js';
import { FlatCompat } from '@eslint/eslintrc';
import path from 'path';
import { fileURLToPath } from 'url';
import typescriptEslint from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import cypress from 'eslint-plugin-cypress';
import prettier from 'eslint-plugin-prettier';
import prettierConfig from 'eslint-config-prettier';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
});

export default [
    // 1. Global Ignores
    {
        ignores: [
            "**/node_modules/**",
            "**/dist/**",
            "**/test-output/**",
            "**/playwright-report/**",
            "**/coverage/**",
            "**/*.min.js"
        ],
    },
    // 2. Base Configuration (JS/TS)
    {
        files: ["**/*.ts", "**/*.js"],
        languageOptions: {
            parser: tsParser,
            parserOptions: {
                ecmaVersion: "latest",
                sourceType: "module",
            },
            globals: {
                ...cypress.environments.globals.globals, // Cypress globals (cy, Cypress, etc.)
                node: true,
                es6: true,
            }
        },
        plugins: {
            "@typescript-eslint": typescriptEslint,
            "cypress": cypress,
            "prettier": prettier,
        },
        rules: {
            ...typescriptEslint.configs.recommended.rules,
            ...cypress.configs.recommended.rules,
            "prettier/prettier": "error", // Enforce Prettier formatting
            "@typescript-eslint/no-explicit-any": "warn",
            "@typescript-eslint/no-unused-vars": ["warn", { "argsIgnorePattern": "^_" }],
            "cypress/no-assigning-return-values": "error",
            "cypress/no-unnecessary-waiting": "warn",
            "cypress/assertion-before-screenshot": "warn",
            "cypress/no-force": "warn",
            "cypress/no-async-tests": "error",
            "cypress/no-pause": "error"
        },
    },
    // 3. Prettier Config (Must be last to override)
    prettierConfig,
];
