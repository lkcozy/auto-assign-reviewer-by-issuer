import { parseConfig, hasAssignee, getReviewers, Config } from "../lib/util";
import * as fs from "fs";
import * as path from "path";

test("config parser", async () => {
	const content = fs.readFileSync(
		path.join(__dirname, "../.github/auto-assigner.yml"),
		{
			encoding: "utf8",
		},
	);
	const config = parseConfig(content) as Config;
	expect(config["lkcozy"]).toMatchObject(["lkcozy2"]);
});

test("assignee matching", async () => {
	const content = fs.readFileSync(
		path.join(__dirname, "../.github/auto-assigner.yml"),
		{
			encoding: "utf8",
		},
	);

	const config = parseConfig(content) as Config;

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

	const config = parseConfig(content) as Config;

	expect(getReviewers(config, "lkcozy")).toMatchObject(["lkcozy2"]);
});
