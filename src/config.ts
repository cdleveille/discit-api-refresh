import type { IConfig } from "./types";

export const Config = {
	API_BASE_URL: Bun.env.API_BASE_URL || "http://localhost:5000",
	API_KEY: Bun.env.API_KEY || undefined,
	REFRESH_DISCS_START: Bun.env.REFRESH_DISCS_START?.toLowerCase() === "true",
	REFRESH_DISCS_CRON: Bun.env.REFRESH_DISCS_CRON?.toLowerCase() === "true",
	DISCIT_URL: Bun.env.DISCIT_URL
} as IConfig;

if (!Config.API_KEY)
	throw new Error("API_KEY is not defined! Must be set equal to the API_KEY in the discit-api project.");
