"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const core = __importStar(require("@actions/core"));
const github_1 = require("@actions/github");
const util_1 = require("./lib/util");
async function run() {
    try {
        const token = core.getInput("token") || process.env.GITHUB_TOKEN;
        if (!token) {
            core.setFailed("No token provided. Use ${{ github.token }} or provide a personal access token.");
            return;
        }
        const configPath = core.getInput("config") || ".github/auto-assigner.yml";
        const octokit = (0, github_1.getOctokit)(token);
        if (!github_1.context.payload.pull_request) {
            core.setFailed("This action can only be used on pull request events");
            return;
        }
        const configContent = await fetchContent(octokit, configPath);
        if (!configContent) {
            core.setFailed(`Could not fetch config file from path: ${configPath}`);
            return;
        }
        const config = (0, util_1.parseConfig)(configContent);
        if (!config) {
            core.setFailed("Failed to parse config file");
            return;
        }
        core.debug("Config loaded successfully");
        core.debug(JSON.stringify(config, null, 2));
        const issuer = github_1.context.payload.pull_request.user.login;
        core.setOutput("issuer", issuer);
        if ((0, util_1.hasAssignee)(config, issuer)) {
            const reviewers = (0, util_1.getReviewers)(config, issuer);
            if (reviewers && reviewers.length > 0) {
                await assignReviewers(octokit, reviewers);
                core.setOutput("assigned_reviewers", reviewers.join(","));
                core.info(`✅ Assigned reviewers: ${reviewers.join(", ")}`);
            }
            else {
                core.info("ℹ️ No reviewers found for this issuer");
            }
        }
        else {
            core.info(`ℹ️ No assignee configuration found for issuer: ${issuer}`);
        }
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
        core.setFailed(`Action failed: ${errorMessage}`);
    }
}
async function assignReviewers(octokit, reviewers) {
    await octokit.rest.pulls.requestReviewers({
        owner: github_1.context.repo.owner,
        repo: github_1.context.repo.repo,
        pull_number: github_1.context.payload.pull_request.number,
        reviewers: reviewers,
    });
}
async function fetchContent(client, repoPath) {
    try {
        const response = await client.rest.repos.getContent({
            owner: github_1.context.repo.owner,
            repo: github_1.context.repo.repo,
            path: repoPath,
            ref: github_1.context.sha,
        });
        if (Array.isArray(response.data)) {
            core.error("Config path points to a directory, not a file");
            return null;
        }
        if (response.data.type !== "file" || !("content" in response.data)) {
            core.error("Config path does not point to a file");
            return null;
        }
        return Buffer.from(response.data.content, response.data.encoding).toString();
    }
    catch (error) {
        if (error &&
            typeof error === "object" &&
            "status" in error &&
            error.status === 404) {
            core.error(`Config file not found at path: ${repoPath}`);
            return null;
        }
        throw error;
    }
}
run();
//# sourceMappingURL=index.js.map