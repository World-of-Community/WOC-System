import { updateTwitchStatus, isTwitchStatusEnabled } from "#systems/twitch.js";

export default {
  name: "twitchStatus",
  cron: "* * * * *",
  runOnReady: true,

  async execute() {
    if (!isTwitchStatusEnabled()) {return;}
    await updateTwitchStatus();
  },
};
