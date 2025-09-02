const js = require("@eslint/js");
const typescript = require("@typescript-eslint/eslint-plugin");
const typescriptParser = require("@typescript-eslint/parser");
const jest = require("eslint-plugin-jest");
const globals = require("globals");

module.exports = [
	js.configs.recommended,
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
