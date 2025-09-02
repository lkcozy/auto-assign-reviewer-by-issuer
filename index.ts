import * as core from "@actions/core";
import { getOctokit, context } from "@actions/github";
import { parseConfig, hasAssignee, getReviewers, Config } from "./lib/util";

async function run(): Promise<void> {
	try {
		// Get inputs with defaults
		const token = core.getInput("token") || process.env.GITHUB_TOKEN;
		if (!token) {
			core.setFailed(
				"No token provided and GITHUB_TOKEN environment variable is not available",
			);
			return;
		}
		const configPath = core.getInput("config");
		const maxRetries = parseInt(core.getInput("max-retries") || "3");
		const retryDelay = parseInt(core.getInput("retry-delay") || "1000");

		const octokit = getOctokit(token);

		// Validate that this is a pull request event
		if (!context.payload.pull_request) {
			core.setFailed("This action can only be used on pull request events");
			return;
		}

		// Retry wrapper for API calls with proper TypeScript typing
		const retryOperation = async <T>(
			operation: () => Promise<T>,
			maxAttempts: number = maxRetries,
		): Promise<T> => {
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
			throw new Error("Retry operation failed");
		};

		const configContent = await retryOperation(() =>
			fetchContent(octokit, configPath),
		);
		if (!configContent) {
			core.setFailed(`Could not fetch config file from path: ${configPath}`);
			return;
		}

		const config = parseConfig(configContent) as Config;
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
		const errorMessage =
			error instanceof Error ? error.message : "Unknown error occurred";
		core.setFailed(`Action failed: ${errorMessage}`);
	}
}

async function assignReviewers(
	octokit: ReturnType<typeof getOctokit>,
	reviewers: string[],
): Promise<void> {
	await octokit.rest.pulls.requestReviewers({
		owner: context.repo.owner,
		repo: context.repo.repo,
		pull_number: context.payload.pull_request!.number,
		reviewers: reviewers,
	});
}

interface GitHubFileContent {
	type: "file";
	content: string;
	encoding: string;
}

async function fetchContent(
	client: ReturnType<typeof getOctokit>,
	repoPath: string,
): Promise<string | null> {
	try {
		const response = await client.rest.repos.getContent({
			owner: context.repo.owner,
			repo: context.repo.repo,
			path: repoPath,
			ref: context.sha,
		});

		if (Array.isArray(response.data)) {
			core.error("Config path points to a directory, not a file");
			return null;
		}

		// Type guard to ensure we have a file with content
		if (response.data.type !== "file" || !("content" in response.data)) {
			core.error("Config path does not point to a file");
			return null;
		}

		const fileContent = response.data as GitHubFileContent;
		return Buffer.from(
			fileContent.content,
			fileContent.encoding as "utf8" | "base64",
		).toString();
	} catch (error: unknown) {
		if (
			error &&
			typeof error === "object" &&
			"status" in error &&
			(error as { status: number }).status === 404
		) {
			core.error(`Config file not found at path: ${repoPath}`);
			return null;
		}
		throw error;
	}
}

run();
