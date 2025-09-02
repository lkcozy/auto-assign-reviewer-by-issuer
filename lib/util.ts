import * as yaml from "yaml";
import _ from "lodash";

export interface Config {
	[key: string]: string[];
}

export function parseConfig(content: string): Config | null {
	try {
		const parsed = yaml.parse(content);
		// Validate that the parsed content is an object
		if (!parsed || typeof parsed !== "object") {
			console.error("Config must be a valid YAML object");
			return null;
		}
		return parsed as Config;
	} catch (error) {
		console.error(
			"Failed to parse YAML config:",
			error instanceof Error ? error.message : "Unknown error",
		);
		return null;
	}
}

export function hasAssignee(
	config: Config | null,
	assignee: string | null,
): boolean {
	if (!config || !assignee) {
		return false;
	}

	const matched = _.findKey(config, (_, key) => {
		try {
			return assignee.match(new RegExp(key));
		} catch {
			// Invalid regex pattern
			console.error(`Invalid regex pattern in config: ${key}`);
			return false;
		}
	});

	return !!matched;
}

export function getReviewers(
	config: Config | null,
	assignee: string | null,
): string[] {
	if (!config || !assignee) {
		return [];
	}

	const matched = _.findKey(config, (_, key) => {
		try {
			return assignee.match(new RegExp(key));
		} catch {
			// Invalid regex pattern
			console.error(`Invalid regex pattern in config: ${key}`);
			return false;
		}
	});

	if (matched) {
		const reviewers = config[matched];
		// Ensure reviewers is an array
		return Array.isArray(reviewers) ? reviewers : [];
	}

	return [];
}
