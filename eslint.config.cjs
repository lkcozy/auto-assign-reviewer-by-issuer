const { defineConfig } = require("eslint/config");
const jest = require("eslint-plugin-jest");
const globals = require("globals");
const path = require("node:path");
const js = require("@eslint/js");
const { FlatCompat } = require("@eslint/eslintrc");

const compat = new FlatCompat({
	baseDirectory: __dirname,
	recommendedConfig: js.configs.recommended,
	allConfig: js.configs.all,
});

module.exports = defineConfig([
	{
		extends: compat.extends("eslint:recommended"),

		plugins: {
			jest,
		},

		languageOptions: {
			globals: {
				...globals.commonjs,
				...globals.node,
				...globals.jest,
				Atomics: "readonly",
				SharedArrayBuffer: "readonly",
			},

			ecmaVersion: 2018,
			sourceType: "commonjs",
		},

		rules: {},
	},
]);
