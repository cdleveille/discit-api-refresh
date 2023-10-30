import type { IConfig } from "./types";

export const Config = {
	API_BASE_URL: Bun.env.API_BASE_URL || undefined,
	API_KEY: Bun.env.API_KEY || undefined,
	REFRESH_DISCS_START: Bun.env.REFRESH_DISCS_START?.toLowerCase() === "true",
	REFRESH_DISCS_CRON: Bun.env.REFRESH_DISCS_CRON?.toLowerCase() === "true"
} as IConfig;

if (!Config.API_BASE_URL) throw new Error("API_BASE_URL is not defined!");

if (!Config.API_KEY) throw new Error("API_KEY is not defined!");
