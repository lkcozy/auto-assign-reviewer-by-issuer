import js from "@eslint/js";
import typescript from "@typescript-eslint/eslint-plugin";
import typescriptParser from "@typescript-eslint/parser";
import jest from "eslint-plugin-jest";
import globals from "globals";

export default [
	js.configs.recommended,
	{
		ignores: ["dist/**", "node_modules/**"],
	},
	{
		files: ["**/*.ts", "**/*.tsx"],
		languageOptions: {
			parser: typescriptParser,
			parserOptions: {
				ecmaVersion: 2020,
				sourceType: "module",
			},
			globals: {
				...globals.node,
				...globals.jest,
			},
		},
		plugins: {
			"@typescript-eslint": typescript,
			jest: jest,
		},
		rules: {
			...typescript.configs.recommended.rules,
			...jest.configs.recommended.rules,
			"@typescript-eslint/no-unused-vars": "error",
			"@typescript-eslint/no-explicit-any": "warn",
			"prefer-const": "error",
			"no-var": "error",
		},
	},
	{
		files: ["**/*.js"],
		languageOptions: {
			ecmaVersion: 2020,
			sourceType: "module",
			globals: {
				...globals.node,
				...globals.jest,
			},
		},
		plugins: {
			jest: jest,
		},
		rules: {
			...jest.configs.recommended.rules,
			"prefer-const": "error",
			"no-var": "error",
		},
	},
];
