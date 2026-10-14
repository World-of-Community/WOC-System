import { leaderboardSchedules } from "#systems/leaderboard.js";

export default {
  name: "leaderboard",
  start(client) {
    leaderboardSchedules(client);
  },
};
