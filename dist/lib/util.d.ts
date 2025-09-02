export interface Config {
    [key: string]: string[];
}
export declare function parseConfig(content: string): Config | null;
export declare function hasAssignee(config: Config | null, assignee: string | null): boolean;
export declare function getReviewers(config: Config | null, assignee: string | null): string[];
//# sourceMappingURL=util.d.ts.map