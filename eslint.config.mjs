import { dirname } from "path";
import { fileURLToPath } from "url";

import { FlatCompat } from "@eslint/eslintrc";
import js from "@eslint/js";
import eslintConfigPrettier from "eslint-plugin-prettier/recommended";
import tseslint from "typescript-eslint";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
	baseDirectory: __dirname,
	resolvePluginsRelativeTo: __dirname,
	recommendedConfig: js.configs.recommended,
	allConfig: js.configs.all,
});

/** @type {import('eslint').Linter.Config} */
const eslintConfig = [
	js.configs.recommended,
	...tseslint.configs.recommended,
	...compat.plugins("import", "react", "react-native", "jest"),
	...compat.extends("plugin:react-native/all", "plugin:react-perf/recommended", "plugin:react-hooks/recommended"),
	...compat.env({ browser: true, es2021: true, node: true, "jest/globals": true, "react-native/react-native": true }),
	{
		rules: {
			// Base Rules
			"max-len": ["error", { code: 180, ignoreComments: true, ignoreStrings: true }],
			"no-console": ["error", { allow: ["warn", "error"] }],
			quotes: ["error", "double", { avoidEscape: true }],
			semi: ["error", "always"],
			"object-curly-spacing": ["error", "always"],
			// TypeScript
			"@typescript-eslint/ban-ts-comment": "off",
			"@typescript-eslint/no-explicit-any": "off",
			"@typescript-eslint/no-unsafe-function-type": "off",
			"@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_", varsIgnorePattern: "^_", caughtErrorsIgnorePattern: "^_" }],
			"@typescript-eslint/no-require-imports": "off",
			// Jest
			"jest/no-disabled-tests": "warn",
			"jest/no-focused-tests": "error",
			"jest/no-identical-title": "error",
			"jest/prefer-to-have-length": "warn",
			"jest/valid-expect": "error",
			// React
			"react/display-name": "off",
			"react/function-component-definition": [2, { namedComponents: "arrow-function", unnamedComponents: "arrow-function" }],
			"react/react-in-jsx-scope": "off",
			// React Native
			"react-native/no-raw-text": "off",
			// React Hooks
			"react-hooks/exhaustive-deps": [
				"warn",
				{
					additionalHooks: "(useAnimatedProps|useAnimatedStyle)",
				},
			],
			// Import
			"import/order": [
				"error",
				{
					groups: ["builtin", "external", "internal", "parent", "sibling", "index"],
					pathGroups: [
						{
							pattern: "react*",
							group: "builtin",
							position: "before",
						},
						{
							pattern: "react-native",
							group: "builtin",
							position: "before",
						},
						{
							pattern: "assets/**/*",
							group: "index",
							position: "after",
						},
					],
					pathGroupsExcludedImportTypes: ["react"],
					alphabetize: {
						order: "asc",
						caseInsensitive: true,
					},
					"newlines-between": "always",
				},
			],
		},
	},
	{
		// Ignore files and directories. Has to be in a separate object for some reason.
		ignores: ["node_modules", "dist", ".expo", ".expo-shared", "web-build"],
	},
	{
		files: ["**/*.{js,mjs,cjs,jsx,mjsx,ts,tsx,mtsx}"],
	},
	eslintConfigPrettier,
];

export default eslintConfig;
