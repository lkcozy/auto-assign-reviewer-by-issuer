const core = require("@actions/core");
const { getOctokit, context } = require("@actions/github");
const { parseConfig, hasAssignee, getReviewers } = require("./lib/util");

// most @actions toolkit packages have async methods
async function run() {
	try {
		// Get inputs with defaults
		const token = core.getInput("token", { required: true });
		const configPath = core.getInput("config");
		const maxRetries = parseInt(core.getInput("max-retries") || "3");
		const retryDelay = parseInt(core.getInput("retry-delay") || "1000");
		
		const octokit = getOctokit(token);

		// Validate that this is a pull request event
		if (!context.payload.pull_request) {
			core.setFailed("This action can only be used on pull request events");
			return;
		}

		// Retry wrapper for API calls
		const retryOperation = async (operation, maxAttempts = maxRetries) => {
			for (let attempt = 1; attempt <= maxAttempts; attempt++) {
				try {
					return await operation();
				} catch (error) {
					if (attempt === maxAttempts) throw error;
					core.warning(
						`Attempt ${attempt} failed, retrying in ${retryDelay}ms...`,
					);
					await new Promise((resolve) => setTimeout(resolve, retryDelay));
				}
			}
		};

		const configContent = await retryOperation(() =>
			fetchContent(octokit, configPath),
		);
		if (!configContent) {
			core.setFailed(`Could not fetch config file from path: ${configPath}`);
			return;
		}

		const config = parseConfig(configContent);
		if (!config) {
			core.setFailed("Failed to parse config file");
			return;
		}

		core.debug("Config loaded successfully");
		core.debug(JSON.stringify(config, null, 2));

		const issuer = context.payload.pull_request.user.login;
		core.setOutput("issuer", issuer);

		if (hasAssignee(config, issuer)) {
			const reviewers = getReviewers(config, issuer);
			if (reviewers && reviewers.length > 0) {
				await retryOperation(() => assignReviewers(octokit, reviewers));
				core.setOutput("assigned_reviewers", reviewers.join(","));
				core.info(`✅ Assigned reviewers: ${reviewers.join(", ")}`);
			} else {
				core.info("ℹ️ No reviewers found for this issuer");
			}
		} else {
			core.info(`ℹ️ No assignee configuration found for issuer: ${issuer}`);
		}
	} catch (error) {
		core.setFailed(`Action failed: ${error.message}`);
	}
}

async function assignReviewers(octokit, reviewers) {
	await octokit.rest.pulls.requestReviewers({
		owner: context.repo.owner,
		repo: context.repo.repo,
		pull_number: context.payload.pull_request.number,
		reviewers: reviewers,
	});
}

async function fetchContent(client, repoPath) {
	try {
		const response = await client.rest.repos.getContent({
			owner: context.repo.owner,
			repo: context.repo.repo,
			path: repoPath,
			ref: context.sha,
		});

		return Buffer.from(
			response.data.content,
			response.data.encoding,
		).toString();
	} catch (error) {
		if (error.status === 404) {
			core.error(`Config file not found at path: ${repoPath}`);
			return null;
		}
		throw error;
	}
}

run();
