import { CronJob } from "cron";

import { Config } from "./config";
import { refreshDiscs } from "./refresh";

export class Cron {
	private static EveryNightAtMidnight = "0 0 0 * * *";

	public refreshDiscsNightly = new CronJob(
		Cron.EveryNightAtMidnight,
		() => {
			if (!Config.REFRESH_DISCS_CRON) return;
			console.log("REFRESH_DISCS_CRON is set to true. Starting disc refresh process...");
			refreshDiscs();
		},
		null,
		null,
		"America/New_York"
	);
}
