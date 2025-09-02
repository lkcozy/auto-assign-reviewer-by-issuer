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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseConfig = parseConfig;
exports.hasAssignee = hasAssignee;
exports.getReviewers = getReviewers;
const yaml = __importStar(require("yaml"));
const lodash_1 = __importDefault(require("lodash"));
function parseConfig(content) {
    try {
        const parsed = yaml.parse(content);
        if (!parsed || typeof parsed !== "object") {
            console.error("Config must be a valid YAML object");
            return null;
        }
        return parsed;
    }
    catch (error) {
        console.error("Failed to parse YAML config:", error instanceof Error ? error.message : "Unknown error");
        return null;
    }
}
function hasAssignee(config, assignee) {
    if (!config || !assignee) {
        return false;
    }
    const matched = lodash_1.default.findKey(config, (_, key) => {
        try {
            return assignee.match(new RegExp(key));
        }
        catch (error) {
            console.error(`Invalid regex pattern in config: ${key}`);
            return false;
        }
    });
    return !!matched;
}
function getReviewers(config, assignee) {
    if (!config || !assignee) {
        return [];
    }
    const matched = lodash_1.default.findKey(config, (_, key) => {
        try {
            return assignee.match(new RegExp(key));
        }
        catch (error) {
            console.error(`Invalid regex pattern in config: ${key}`);
            return false;
        }
    });
    if (matched) {
        const reviewers = config[matched];
        return Array.isArray(reviewers) ? reviewers : [];
    }
    return [];
}
//# sourceMappingURL=util.js.map