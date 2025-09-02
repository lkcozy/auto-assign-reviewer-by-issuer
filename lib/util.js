const yaml = require("yaml");
const _ = require("lodash");

const parseConfig = function (content) {
	try {
		const parsed = yaml.parse(content);
		// Validate that the parsed content is an object
		if (!parsed || typeof parsed !== "object") {
			console.error("Config must be a valid YAML object");
			return null;
		}
		return parsed;
	} catch (error) {
		console.error("Failed to parse YAML config:", error.message);
		return null;
	}
};

const hasAssignee = function (config, assignee) {
	if (!config || !assignee) {
		return false;
	}

	const matched = _.findKey(config, (_, key) => {
		try {
			return assignee.match(new RegExp(key));
		} catch (error) {
			// Invalid regex pattern
			console.error(`Invalid regex pattern in config: ${key}`);
			return false;
		}
	});

	return !!matched;
};

const getReviewers = function (config, assignee) {
	if (!config || !assignee) {
		return [];
	}

	const matched = _.findKey(config, (_, key) => {
		try {
			return assignee.match(new RegExp(key));
		} catch (error) {
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
};

module.exports = {
	parseConfig: parseConfig,
	hasAssignee: hasAssignee,
	getReviewers: getReviewers,
};
