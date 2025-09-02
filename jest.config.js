module.exports = {
	preset: "ts-jest",
	testEnvironment: "node",
	testMatch: ["**/__tests__/**/?(*.)+(spec|test).[jt]s?(x)"],
	moduleFileExtensions: ["ts", "js", "json"],
	transform: {
		"^.+\\.ts$": "ts-jest",
	},
	collectCoverageFrom: ["index.ts", "lib/**/*.ts", "!**/*.d.ts"],
};
