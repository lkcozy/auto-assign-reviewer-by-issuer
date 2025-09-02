const { parseConfig, hasAssignee, getReviewers } = require("../lib/util");
const fs = require("fs");
const path = require("path");

test("config parser", async () => {
	const content = fs.readFileSync(
		path.join(__dirname, "../.github/auto-assigner.yml"),
		{
			encoding: "utf8",
		},
	);
	const config = parseConfig(content);
	expect(config["lkcozy"]).toMatchObject(["lkcozy2"]);
});

test("assignee matching", async () => {
	const content = fs.readFileSync(
		path.join(__dirname, "../.github/auto-assigner.yml"),
		{
			encoding: "utf8",
		},
	);

	const config = parseConfig(content);

	expect(hasAssignee(config, "lkcozy")).toBeTruthy();

	// fallback
	expect(hasAssignee(config, "john")).toBeTruthy();
});

test("get reviewers", async () => {
	const content = fs.readFileSync(
		path.join(__dirname, "../.github/auto-assigner.yml"),
		{
			encoding: "utf8",
		},
	);

	const config = parseConfig(content);

	expect(getReviewers(config, "lkcozy")).toMatchObject(["lkcozy2"]);
});
