import { Config } from "./config";
import { Cron } from "./cron";
import { refreshDiscs } from "./refresh";

const cron = new Cron();
cron.refreshDiscsNightly.start();

if (Config.REFRESH_DISCS_START) refreshDiscs();
